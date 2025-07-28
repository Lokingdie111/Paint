use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize)]
struct SaveImageRequest {
    image_data: String, // base64 encoded image data
    filename: Option<String>,
}

#[tauri::command]
async fn save_image(request: SaveImageRequest) -> Result<String, String> {
    // Remove data URL prefix if present
    let image_data = if request.image_data.starts_with("data:image/png;base64,") {
        request.image_data.replace("data:image/png;base64,", "")
    } else {
        request.image_data
    };

    // Decode base64
    let decoded_data = base64::decode(&image_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    // Generate filename if not provided
    let filename = request.filename.unwrap_or_else(|| {
        format!("paint_{}.png", chrono::Utc::now().format("%Y%m%d_%H%M%S"))
    });

    // Get desktop directory for saving
    let desktop_path = dirs::desktop_dir()
        .ok_or("Could not find desktop directory")?;
    
    let file_path = desktop_path.join(&filename);

    // Write file
    fs::write(&file_path, decoded_data)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(format!("Image saved to: {:?}", file_path))
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, save_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
