use tauri::AppHandle;
use tauri_plugin_keyring::KeyringExt;

use super::constants::{KEYRING_SERVICE, OPENAI_API_KEY_NAME};

#[tauri::command]
pub async fn save_api_key(app: AppHandle, api_key: String) -> Result<(), String> {
    app.keyring()
        .set_password(KEYRING_SERVICE, OPENAI_API_KEY_NAME, &api_key)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_api_key(app: AppHandle) -> Result<Option<String>, String> {
    app.keyring()
        .get_password(KEYRING_SERVICE, OPENAI_API_KEY_NAME)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_api_key(app: AppHandle) -> Result<(), String> {
    // delete_credential may fail if no password exists, but we don't care
    let _ = app
        .keyring()
        .delete_password(KEYRING_SERVICE, OPENAI_API_KEY_NAME);
    Ok(())
}

#[tauri::command]
pub async fn has_api_key(app: AppHandle) -> Result<bool, String> {
    app.keyring()
        .get_password(KEYRING_SERVICE, OPENAI_API_KEY_NAME)
        .map(|opt| opt.is_some())
        .map_err(|e| e.to_string())
}
