#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rename::commands::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, rename, open_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
