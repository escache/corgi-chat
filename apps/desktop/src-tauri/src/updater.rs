use tauri::AppHandle;
use tauri_plugin_updater::UpdaterExt;

pub fn setup(app: &AppHandle) {
    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        let _ = check_update(&handle).await;
    });
}

async fn check_update(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
        let _ = app.emit("update-available", update.body.clone().unwrap_or_default());
        // Auto-download and install for now; the user can disable this with a dialog later.
        let _ = update.download_and_install().await.map_err(|e| e.to_string())?;
    }
    Ok(())
}
