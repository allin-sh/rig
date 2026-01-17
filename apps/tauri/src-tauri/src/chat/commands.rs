use aisdk::{
    core::{LanguageModelRequest, Message},
    integrations::vercel_aisdk_ui::{VercelUIMessage, VercelUIStreamOptions},
    providers::openai::{Gpt52, OpenAI},
};
use futures::StreamExt;
use tauri::{ipc::Channel, AppHandle};
use tauri_plugin_keyring::KeyringExt;
use tokio::sync::mpsc;

use super::events::StreamEvent;
use crate::api_key::constants::{KEYRING_SERVICE, OPENAI_API_KEY_NAME};

#[tauri::command]
pub async fn chat_stream(
    app: AppHandle,
    messages: Vec<VercelUIMessage>,
    on_event: Channel<StreamEvent>,
) -> Result<(), String> {
    // Get API key from keychain
    let api_key = app
        .keyring()
        .get_password(KEYRING_SERVICE, OPENAI_API_KEY_NAME)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| {
            "API key not set. Please configure your OpenAI API key in settings.".to_string()
        })?;

    let (tx, mut rx) = mpsc::channel::<StreamEvent>(100);

    // Convert UI messages to aisdk messages using built-in converter
    let aisdk_messages = Message::from_vercel_ui_message(&messages);

    // Spawn a blocking task with its own runtime for the non-Send stream
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
                .messages(aisdk_messages)
                .build()
                .stream_text()
                .await
                .map_err(|e| e.to_string())?;

            let mut stream = response.into_vercel_ui_stream(VercelUIStreamOptions {
                send_reasoning: true,
                send_start: true,
                send_finish: true,
                ..Default::default()
            });

            while let Some(chunk) = stream.next().await {
                match chunk {
                    Ok(data) => {
                        if tx.send(StreamEvent::Chunk { data }).await.is_err() {
                            break;
                        }
                    }
                    Err(e) => {
                        let _ = tx
                            .send(StreamEvent::Error {
                                message: e.to_string(),
                            })
                            .await;
                        return Err("Stream failed".to_string());
                    }
                }
            }

            let _ = tx.send(StreamEvent::Done).await;
            Ok::<(), String>(())
        })
    });

    // Forward events from the channel to the IPC channel
    while let Some(event) = rx.recv().await {
        let is_done = matches!(event, StreamEvent::Done | StreamEvent::Error { .. });
        on_event.send(event).map_err(|e| e.to_string())?;
        if is_done {
            break;
        }
    }

    // Wait for the thread to complete
    handle.join().map_err(|_| "Thread panicked".to_string())??;

    Ok(())
}
