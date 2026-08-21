use tauri::AppHandle;
use tauri_plugin_deep_link::DeepLinkExt;

pub fn setup(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(desktop)]
    {
        app.deep_link().register("corgi-chat")?;
    }
    Ok(())
}
