use serde_json::Value;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

const RECENT_STORE: &str = "recent-rooms.bin";
const RECENT_KEY: &str = "rooms";

pub fn setup(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    rebuild_tray(app)?;
    Ok(())
}

pub fn rebuild_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let _ = app.remove_tray_by_id("main-tray");
    let store = app.store(RECENT_STORE)?;
    let rooms = match store.get(RECENT_KEY) {
        Some(Value::Array(arr)) => arr,
        _ => vec![],
    };

    let open_i = MenuItem::with_id(app, "open", "Open Corgi Chat", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;

    // Build recent rooms submenu dynamically.
    let mut recent_entries: Vec<MenuItem<tauri::Wry>> = Vec::new();
    for room in &rooms {
        let slug = room.get("slug").and_then(|s| s.as_str()).unwrap_or("").to_string();
        let name = room.get("name").and_then(|s| s.as_str()).unwrap_or(&slug).to_string();
        if slug.is_empty() {
            continue;
        }
        let item = MenuItem::with_id(
            app,
            format!("recent:{}", slug),
            format!("{name}  /r/{slug}"),
            true,
            None::<&str>,
        )?;
        recent_entries.push(item);
    }

    let recent_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> =
        recent_entries.iter().map(|item| item as &dyn tauri::menu::IsMenuItem<tauri::Wry>).collect();
    let recent_submenu = if recent_refs.is_empty() {
        let no_recent = MenuItem::with_id(app, "no-recent", "No recent rooms", false, None::<&str>)?;
        let items: &[&dyn tauri::menu::IsMenuItem<tauri::Wry>] = &[&no_recent];
        Submenu::with_items(app, "Recent rooms", true, items)?
    } else {
        Submenu::with_items(app, "Recent rooms", true, recent_refs.as_slice())?
    };

    let items: &[&dyn tauri::menu::IsMenuItem<tauri::Wry>] = &[
        &open_i,
        &recent_submenu,
        &separator,
        &quit_i,
    ];
    let menu = Menu::with_items(app, items)?;

    let _tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("Corgi Chat")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "open" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            id => {
                if let Some(slug) = id.strip_prefix("recent:") {
                    let _ = app.emit("navigate-to-room", slug.to_string());
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

#[tauri::command]
pub async fn add_recent_room(app: AppHandle, slug: String, name: String) -> Result<(), String> {
    let store = app.store(RECENT_STORE).map_err(|e| e.to_string())?;
    let mut rooms = match store.get(RECENT_KEY) {
        Some(Value::Array(arr)) => arr,
        _ => vec![],
    };

    rooms.retain(|r| r.get("slug").and_then(|s| s.as_str()) != Some(&slug));
    let mut new = serde_json::Map::new();
    new.insert("slug".into(), Value::String(slug));
    new.insert("name".into(), Value::String(name));
    rooms.insert(0, Value::Object(new));
    rooms.truncate(5);

    store.set(RECENT_KEY, Value::Array(rooms));
    let _ = store.save().map_err(|e| e.to_string())?;

    rebuild_tray(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_recent_rooms(app: AppHandle) -> Result<Vec<Value>, String> {
    let store = app.store(RECENT_STORE).map_err(|e| e.to_string())?;
    match store.get(RECENT_KEY) {
        Some(Value::Array(arr)) => Ok(arr),
        _ => Ok(vec![]),
    }
}
