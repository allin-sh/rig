mod api_key;
mod chat;
mod migrations;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // load environment variables from .env file
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .plugin(tauri_plugin_keyring::init())
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
        .invoke_handler(tauri::generate_handler![
            chat::commands::chat_stream,
            api_key::commands::save_api_key,
            api_key::commands::get_api_key,
            api_key::commands::delete_api_key,
            api_key::commands::has_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
