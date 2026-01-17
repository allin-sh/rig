use aisdk::{
    core::{LanguageModelRequest, Message},
    integrations::vercel_aisdk_ui::{VercelUIMessage, VercelUIStream, VercelUIStreamOptions},
    providers::openai::{Gpt52, OpenAI},
};
use futures::StreamExt;
use tauri::{ipc::Channel, AppHandle};
use tauri_plugin_keyring::KeyringExt;

use crate::api_key::constants::{KEYRING_SERVICE, OPENAI_API_KEY_NAME};

#[tauri::command]
pub async fn chat_stream(
    app: AppHandle,
    messages: Vec<VercelUIMessage>,
    on_event: Channel<VercelUIStream>,
) -> Result<(), String> {
    // Get API key from keychain
    let api_key = app
        .keyring()
        .get_password(KEYRING_SERVICE, OPENAI_API_KEY_NAME)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| {
            "API key not set. Please configure your OpenAI API key in settings.".to_string()
        })?;

    // Convert UI messages to model messages
    let model_messages = Message::from_vercel_ui_message(&messages);

    // Spawn a blocking task with its own runtime for the non-Send stream
    let (tx, mut rx) = tokio::sync::mpsc::channel::<VercelUIStream>(100);

    let handle = std::thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();

        rt.block_on(async move {
            let openai = OpenAI::<Gpt52>::builder().api_key(api_key).build().unwrap();

            let response = LanguageModelRequest::builder()
                .model(openai)
                .system("You are a helpful assistant.")
                .messages(model_messages)
                .build()
                .stream_text()
                .await
                .map_err(|e| e.to_string())?;

            let options = VercelUIStreamOptions {
                send_reasoning: true,
                send_start: true,
                send_finish: true,
                generate_message_id: None,
            };

            let mut stream = response.into_vercel_ui_stream(options);

            while let Some(chunk) = stream.next().await {
                let ui_chunk = match chunk {
                    Ok(c) => c,
                    Err(e) => VercelUIStream::Error {
                        error_text: e.to_string(),
                    },
                };

                if tx.send(ui_chunk).await.is_err() {
                    break;
                }
            }

            Ok::<(), String>(())
        })
    });

    // Forward events from the channel to the IPC channel
    while let Some(event) = rx.recv().await {
        let is_error = matches!(event, VercelUIStream::Error { .. });
        on_event.send(event).map_err(|e| e.to_string())?;

        if is_error {
            break;
        }
    }

    // Wait for the thread to complete
    handle.join().map_err(|_| "Thread panicked".to_string())??;

    Ok(())
}
