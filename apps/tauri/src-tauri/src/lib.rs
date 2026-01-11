mod migrations;

use aisdk::{
    core::{LanguageModelRequest, LanguageModelStreamChunkType},
    providers::openai::{Gpt52, OpenAI},
};
use futures::StreamExt;
use tauri::ipc::Channel;
use tokio::sync::mpsc;

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase", tag = "type")]
enum StreamEvent {
    Chunk { text: String },
    Done,
    Error { message: String },
}

#[tauri::command]
async fn chat_stream(message: String, on_event: Channel<StreamEvent>) -> Result<(), String> {
    let (tx, mut rx) = mpsc::channel::<StreamEvent>(100);

    // Spawn a blocking task with its own runtime for the non-Send stream
    let handle = std::thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();

        rt.block_on(async move {
            let openai = OpenAI::<Gpt52>::builder()
                .api_key(std::env::var("OPENAI_API_KEY").unwrap())
                .build()
                .unwrap();

            let response = LanguageModelRequest::builder()
                .model(openai)
                .system("You are a helpful assistant.")
                .prompt(&message)
                .build()
                .stream_text()
                .await
                .map_err(|e| e.to_string())?;

            let mut stream = response.stream;

            while let Some(chunk) = stream.next().await {
                match chunk {
                    LanguageModelStreamChunkType::Text(text) => {
                        if tx.send(StreamEvent::Chunk { text }).await.is_err() {
                            break;
                        }
                    }
                    LanguageModelStreamChunkType::End(_) => {
                        break;
                    }
                    _ => {}
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // load environment variables from .env file
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:ALLIN.sqlite", migrations::sql_migrations())
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![chat_stream])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
