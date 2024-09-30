use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::Window;

#[derive(Debug, Clone, Serialize)]
struct RenameResult {
    key: String,
    code: i32,
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FileInfo {
    key: String,
    path: String,
    ext: String,
    file: String,
    renamed: String,
}

pub fn emit_event(window: Window, event: &str, payload: &FileInfo) {
    window.emit(event, payload).unwrap();
}

#[tauri::command]
pub fn rename(list: Vec<FileInfo>) -> String {
    let mut handles = vec![];
    let rename_result = Arc::new(Mutex::new(vec![]));

    for info in list {
        let rename_result_clone = Arc::clone(&rename_result);
        let handle = std::thread::spawn(move || {
            let mut rename_result = rename_result_clone.lock().unwrap();
            let old_path = format!("{}", info.path);
            let new_path = format!("{}", info.path.replace(&info.file, &info.renamed));

            match std::fs::rename(old_path, new_path) {
                Ok(_) => {
                    rename_result.push(RenameResult {
                        key: info.key,
                        code: 0,
                    });
                }
                Err(_) => {
                    rename_result.push(RenameResult {
                        key: info.key,
                        code: 1,
                    });
                }
            }
        });

        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let x = rename_result.lock().unwrap();
    serde_json::to_string(&x.to_vec()).unwrap()
}
