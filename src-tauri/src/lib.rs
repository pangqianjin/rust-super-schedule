// 课程收入记录 —— 数据持久化后端
// 数据以 JSON 文件形式保存在应用数据目录下的 schedule.json 中。

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tauri::Manager;

/// 一节课的类型：morning = 早自习，day = 白天课，evening = 晚自习
#[derive(Serialize, Deserialize, Clone, Default)]
struct LessonEntry {
    kind: String,
    count: u32,
    note: String,
}

/// 课程表上的一个格子。课型由所在行决定，不需要单独存。
#[derive(Serialize, Deserialize, Clone, Default)]
struct Slot {
    #[serde(default)]
    note: String,
}

/// 全部数据
#[derive(Serialize, Deserialize, Clone, Default)]
struct AppData {
    /// 每天实际记录的课程，按日期（YYYY-MM-DD）索引
    #[serde(default)]
    days: HashMap<String, Vec<LessonEntry>>,
    /// 每周固定课程表的已填格子，键形如 "mon-p1"（星期-节次）
    #[serde(default)]
    timetable: HashMap<String, Slot>,
}

/// 获取数据文件路径，并确保其父目录存在
fn data_file_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("schedule.json"))
}

/// 从 JSON 里取某个字段；结构对不上时返回默认值。
/// 这样旧版本残留的数据（比如老格式的课程表）只会丢掉那一个字段，
/// 不会导致整个文件读不出来、连日历记录一起丢。
fn field<T: serde::de::DeserializeOwned + Default>(value: &serde_json::Value, key: &str) -> T {
    value
        .get(key)
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default()
}

/// 从磁盘加载全部数据；文件不存在时返回空数据
#[tauri::command]
fn load_data(app: tauri::AppHandle) -> Result<AppData, String> {
    let path = data_file_path(&app)?;
    if !path.exists() {
        return Ok(AppData::default());
    }
    let text = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let value: serde_json::Value =
        serde_json::from_str(&text).map_err(|e| format!("解析数据失败：{e}"))?;

    Ok(AppData {
        days: field(&value, "days"),
        timetable: field(&value, "timetable"),
    })
}

/// 将全部数据写回磁盘
#[tauri::command]
fn save_data(app: tauri::AppHandle, data: AppData) -> Result<(), String> {
    let path = data_file_path(&app)?;
    let text = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, text).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_data, save_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
