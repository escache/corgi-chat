use tauri::{AppHandle, Emitter, Manager, RunEvent};

pub mod deep_link;
pub mod tray;
pub mod updater;

pub fn run() {
    let toggle_mute: tauri_plugin_global_shortcut::Shortcut =
        "CmdOrCtrl+Shift+M".parse().expect("valid global shortcut");

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(
            |app, argv, _cwd| handle_single_instance(app, argv),
        ))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts([toggle_mute.clone()])
                .expect("register global shortcut")
                .with_handler(move |_app, shortcut, event| {
                    if shortcut == &toggle_mute
                        && event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed
                    {
                        let _ = _app.emit("global-shortcut", "toggle-mute");
                    }
                })
                .build(),
        )
        .setup(setup)
        .invoke_handler(tauri::generate_handler![
            tray::get_recent_rooms,
            tray::add_recent_room,
        ]);

    let app = builder
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, event| match event {
        RunEvent::ExitRequested { code, api, .. } => {
            if code.is_none() {
                api.prevent_exit();
            }
        }
        RunEvent::Reopen { .. } => {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        _ => {}
    });
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle().clone();

    deep_link::setup(&handle)?;
    tray::setup(&handle)?;
    updater::setup(&handle);

    Ok(())
}

fn handle_single_instance(app: &AppHandle, argv: Vec<String>) {
    if let Some(url) = argv.into_iter().find(|a| a.starts_with("corgi-chat://")) {
        if let Some(slug) = url
            .trim_start_matches("corgi-chat://")
            .strip_prefix("r/")
        {
            let _ = app.emit("navigate-to-room", slug.to_string());
        }
    }

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}
