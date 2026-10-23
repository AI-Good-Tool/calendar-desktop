/*
 * @Author: DaLong Li
 * @Date: 2026-02-05 15:45:33
 * @LastEditTime: 2026-09-20 17:15:00
 * @LastEditors: DaLong Li
 * @Description:
 * 生命在于运动，代码在于抽动。
 */
use std::sync::{Mutex, OnceLock};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 状态栏显示配置：由前端同步过来。
/// template 中使用占位符（如 {YYYY} {MM} {DD} {ddd} {HH} {mm} {ss}），
/// 天气、城市等动态文本由前端替换好后再传入。
struct TrayConfig {
    show: bool,
    template: String,
    /// 指定的 IANA 时区（如 "Asia/Shanghai"）；None 表示跟随系统本地时区
    time_zone: Option<chrono_tz::Tz>,
    last_title: String,
    /// 当前状态栏是否显示图标（None = 尚未同步过）。
    /// 显示时间时只显示文字（宽度自适应）；关闭时间显示时用图标作为点击入口。
    icon_shown: Option<bool>,
}

impl Default for TrayConfig {
    fn default() -> Self {
        Self {
            show: false,
            template: String::new(),
            time_zone: None,
            last_title: String::new(),
            icon_shown: None,
        }
    }
}

/// 应用当前语言标签（如 "zh-Hans-CN"、"en-US"）。
/// macOS 下取 NSLocale.preferredLanguages 首项，它会反映"系统设置 → 语言与地区 → 应用程序"里的单独应用语言。
/// 语言切换需要重启应用才生效，因此进程内缓存。
fn app_locale() -> &'static str {
    static LOCALE: OnceLock<String> = OnceLock::new();
    LOCALE.get_or_init(|| {
        #[cfg(target_os = "macos")]
        {
            objc2_foundation::NSLocale::preferredLanguages()
                .firstObject()
                .map(|s| s.to_string())
                .unwrap_or_else(|| "en".into())
        }
        #[cfg(not(target_os = "macos"))]
        {
            std::env::var("LANG").unwrap_or_else(|_| "en".into())
        }
    })
}

fn is_zh() -> bool {
    app_locale().to_ascii_lowercase().starts_with("zh")
}

/// 按应用语言在中英文之间选择
fn tr<'a>(zh: &'a str, en: &'a str) -> &'a str {
    if is_zh() {
        zh
    } else {
        en
    }
}

#[tauri::command]
fn get_app_locale() -> String {
    app_locale().to_string()
}

/// 状态栏图标（关闭时间显示时作为唤起窗口的入口）
fn tray_icon_image() -> tauri::image::Image<'static> {
    tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png")).expect("内置状态栏图标解析失败")
}

fn tray_config() -> &'static Mutex<TrayConfig> {
    static CONFIG: OnceLock<Mutex<TrayConfig>> = OnceLock::new();
    CONFIG.get_or_init(|| Mutex::new(TrayConfig::default()))
}

/// 第二状态栏项（菜单2）的配置：独立开关 + 时区，只显示时间，不含天气
#[derive(Default)]
struct Tray2Config {
    show: bool,
    template: String,
    time_zone: Option<chrono_tz::Tz>,
    last_title: String,
    /// 可见性缓存（None = 尚未同步过）
    visible: Option<bool>,
}

/// 菜单2 的持久化状态（写入 app_config_dir/tray2-state.json）。
/// macOS 26 对应用启动后才创建的状态栏项不予显示，必须随应用启动一起创建，
/// 因此开关/模板/时区要持久化，setup 时按此直接创建。
#[derive(serde::Serialize, serde::Deserialize, Default)]
struct Tray2State {
    show: bool,
    template: String,
    time_zone: Option<String>,
}

/// 菜单2 是否在本次启动的 setup 阶段创建（只有启动期创建的项 macOS 26 才会显示）
#[cfg(target_os = "macos")]
static TRAY2_AT_LAUNCH: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

fn tray2_config() -> &'static Mutex<Tray2Config> {
    static CONFIG: OnceLock<Mutex<Tray2Config>> = OnceLock::new();
    CONFIG.get_or_init(|| Mutex::new(Tray2Config::default()))
}

fn tray2_state_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    use tauri::Manager;
    app.path()
        .app_config_dir()
        .ok()
        .map(|d| d.join("tray2-state.json"))
}

/// 前端同步状态栏显示配置（开关 + 模板 + 时区）。
/// 真正的按秒计时在 Rust 后台线程执行，窗口隐藏 / WebView 挂起后时间依然正常走动。
#[tauri::command]
fn sync_tray_config(app: tauri::AppHandle, show: bool, template: String, time_zone: Option<String>) {
    {
        let mut cfg = tray_config().lock().unwrap();
        cfg.show = show;
        cfg.template = template;
        // 无法识别的时区名按跟随系统处理
        cfg.time_zone = time_zone.and_then(|tz| tz.parse::<chrono_tz::Tz>().ok());
    }
    // 立即刷新一次，不用等下一个 tick
    tick_tray_title(&app);
}

/// 前端同步第二状态栏（菜单2）配置：开关 + 模板 + 时区。
/// 与主状态栏共用模板渲染，但不含天气占位符（前端不会传入）。
/// 配置同时持久化到 tray2-state.json，下次启动时随应用一起创建（macOS 26 要求）。
#[tauri::command]
fn sync_tray2_config(app: tauri::AppHandle, show: bool, template: String, time_zone: Option<String>) {
    {
        let mut cfg = tray2_config().lock().unwrap();
        cfg.show = show;
        cfg.template = template.clone();
        cfg.time_zone = time_zone.clone().and_then(|tz| tz.parse::<chrono_tz::Tz>().ok());
    }
    // 持久化，供下次启动时创建
    if let Some(path) = tray2_state_path(&app) {
        let state = Tray2State { show, template, time_zone };
        if let Some(dir) = path.parent() {
            let _ = std::fs::create_dir_all(dir);
        }
        let _ = std::fs::write(&path, serde_json::to_string(&state).unwrap());
    }
    tick_tray2_title(&app);
}

/// 菜单2 是否在本次启动期创建（只有启动期创建的状态栏项 macOS 26 才会显示；
/// 运行期新创建的项要下次启动才显示）
#[tauri::command]
fn tray2_displayable() -> bool {
    #[cfg(target_os = "macos")]
    {
        TRAY2_AT_LAUNCH.load(std::sync::atomic::Ordering::Relaxed)
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

/// 重启应用（菜单2 首次开启后需要重启才能在 macOS 26 状态栏显示）
#[tauri::command]
fn restart_app(app: tauri::AppHandle) {
    use tauri::Manager;
    if let Some(window) = app.get_webview_window("main") {
        save_win_state(&window);
    }
    app.restart();
}

/// 把模板中的占位符替换为当前时间（指定时区，或系统本地时区）
fn render_tray_template(template: &str, time_zone: Option<chrono_tz::Tz>) -> String {
    use chrono::{Datelike, Local, Timelike, Utc};

    // Local 跟随系统时区：chrono 会检测 /etc/localtime 的变化，系统切换时区后约 1 秒内生效
    let now = match time_zone {
        Some(tz) => Utc::now().with_timezone(&tz).naive_local(),
        None => Local::now().naive_local(),
    };
    let wd_idx = now.weekday().num_days_from_sunday() as usize;
    let month_idx = now.month0() as usize;
    let (weekdays, weekdays_full, months, months_full): (&[&str; 7], &[&str; 7], &[&str; 12], &[&str; 12]) = if is_zh() {
        (
            &["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            &["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            &["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            &["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        )
    } else {
        (
            &["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            &["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            &["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            &[
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
                "November", "December",
            ],
        )
    };
    let wd = weekdays[wd_idx];
    let weekday_full = weekdays_full[wd_idx].to_string();
    let hour12 = {
        let h = now.hour() % 12;
        if h == 0 {
            12
        } else {
            h
        }
    };
    let ampm_upper = if now.hour() < 12 { "AM" } else { "PM" };
    let ampm_lower = if now.hour() < 12 { "am" } else { "pm" };

    // 注意：必须先替换长的占位符，再替换短的（如 {dddd} 先于 {ddd}，{MM} 先于 {M}）
    let pairs: [(&str, String); 22] = [
        ("{YYYY}", format!("{:04}", now.year())),
        ("{MMMM}", months_full[month_idx].to_string()),
        ("{MMM}", months[month_idx].to_string()),
        ("{dddd}", weekday_full),
        ("{ddd}", wd.to_string()),
        ("{MM}", format!("{:02}", now.month())),
        ("{DD}", format!("{:02}", now.day())),
        ("{HH}", format!("{:02}", now.hour())),
        ("{hh}", format!("{:02}", hour12)),
        ("{mm}", format!("{:02}", now.minute())),
        ("{ss}", format!("{:02}", now.second())),
        ("{M}", format!("{}", now.month())),
        ("{D}", format!("{}", now.day())),
        ("{H}", format!("{}", now.hour())),
        ("{h}", format!("{}", hour12)),
        ("{m}", format!("{}", now.minute())),
        ("{s}", format!("{}", now.second())),
        ("{A}", ampm_upper.to_string()),
        ("{a}", ampm_lower.to_string()),
        ("{YY}", format!("{:02}", now.year() % 100)),
        ("{city}", String::new()),
        ("{temp}", String::new()),
    ];

    let mut out = template.to_string();
    for (k, v) in pairs {
        out = out.replace(k, &v);
    }
    out
}

fn tick_tray_title(app: &tauri::AppHandle) {
    let title = {
        let cfg = tray_config().lock().unwrap();
        if cfg.show && !cfg.template.is_empty() {
            render_tray_template(&cfg.template, cfg.time_zone)
        } else {
            String::new()
        }
    };

    // 有文字时不显示图标，让状态栏项宽度完全跟随文字；无文字时显示图标作为点击入口
    let want_icon = title.is_empty();
    let (title_changed, icon_changed) = {
        let cfg = tray_config().lock().unwrap();
        (cfg.last_title != title, cfg.icon_shown != Some(want_icon))
    };
    if !title_changed && !icon_changed {
        return;
    }

    let Some(tray) = app.tray_by_id("main-tray") else { return };
    if icon_changed {
        let icon = if want_icon { Some(tray_icon_image()) } else { None };
        match tray.set_icon(icon) {
            Ok(()) => tray_config().lock().unwrap().icon_shown = Some(want_icon),
            Err(error) => eprintln!("状态栏图标更新失败: {error}"),
        }
    }
    if title_changed {
        match tray.set_title(Some(&title)) {
            Ok(()) => tray_config().lock().unwrap().last_title = title,
            Err(error) => eprintln!("状态栏更新失败: {error}"),
        }
    }
}

/// 第二状态栏（菜单2）tick：按配置渲染时间；关闭时隐藏状态栏项。
/// 菜单2 采用懒创建（见 ensure_tray2），此处托盘不存在时直接跳过。
fn tick_tray2_title(app: &tauri::AppHandle) {
    let (show, title) = {
        let cfg = tray2_config().lock().unwrap();
        let title = if cfg.show && !cfg.template.is_empty() {
            render_tray_template(&cfg.template, cfg.time_zone)
        } else {
            String::new()
        };
        (cfg.show, title)
    };

    #[cfg(target_os = "macos")]
    if show && !title.is_empty() {
        ensure_tray2(app, &title);
    }
    let Some(tray) = app.tray_by_id("main-tray-2") else { return };

    let (title_changed, visible_changed) = {
        let cfg = tray2_config().lock().unwrap();
        (cfg.last_title != title, cfg.visible != Some(show))
    };
    if visible_changed {
        let _ = tray.set_visible(show);
        tray2_config().lock().unwrap().visible = Some(show);
    }
    if show && title_changed {
        match tray.set_title(Some(&title)) {
            Ok(()) => tray2_config().lock().unwrap().last_title = title,
            Err(error) => eprintln!("第二状态栏更新失败: {error}"),
        }
    }
}

/// 启动原生后台计时线程：不受 WebView 挂起（App Nap）影响，
/// 解决窗口隐藏一段时间后状态栏时间/日期不走的问题。
fn start_tray_clock(app: tauri::AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_millis(500));
        // 兜底：计时线程内的任何 panic 都不允许拖垮整个应用
        let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            tick_tray_title(&app);
            tick_tray2_title(&app);
        }));
    });
}

/// 构建状态栏右键菜单（主状态栏与菜单2共用同一套菜单项）
#[cfg(target_os = "macos")]
fn build_tray_menu(app: &tauri::AppHandle) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem};
    let show_item = MenuItemBuilder::with_id("tray-show", tr("打开云小历", "Open Yun Calendar")).build(app)?;
    let add_item = MenuItemBuilder::with_id("tray-add", tr("添加日程", "Add Schedule"))
        .accelerator("CmdOrControl+Alt+N")
        .build(app)?;
    let settings_item = MenuItemBuilder::with_id("tray-settings", tr("偏好设置", "Preferences"))
        .accelerator("CmdOrControl+,")
        .build(app)?;
    let about_item = MenuItemBuilder::with_id("tray-about", tr("关于云小历", "About Yun Calendar")).build(app)?;
    let quit_item = MenuItemBuilder::with_id("tray-quit", tr("退出", "Quit"))
        .accelerator("CmdOrControl+Q")
        .build(app)?;
    MenuBuilder::new(app)
        .items(&[
            &show_item,
            &PredefinedMenuItem::separator(app)?,
            &add_item,
            &settings_item,
            &about_item,
            &PredefinedMenuItem::separator(app)?,
            &quit_item,
        ])
        .build()
}

/// 状态栏右键菜单事件（主状态栏与菜单2共用）
#[cfg(target_os = "macos")]
fn handle_tray_menu_event(app: &tauri::AppHandle, event: tauri::menu::MenuEvent) {
    use tauri::Emitter;
    match event.id().as_ref() {
        "tray-show" => show_main_window(app),
        "tray-add" => {
            show_main_window(app);
            let _ = app.emit("tray-action", "add-schedule");
        }
        "tray-settings" => {
            show_main_window(app);
            let _ = app.emit("tray-action", "settings");
        }
        "tray-about" => {
            show_main_window(app);
            let _ = app.emit("tray-action", "about");
        }
        "tray-quit" => app.exit(0),
        _ => {}
    }
}

/// 菜单2 懒创建：首次开启时才创建状态栏项，且创建时就带时间文字。
/// 若启动时就创建"无图标无标题"的零宽度项，macOS（尤其 Tahoe 的 ControlCenter 托管）
/// 会直接丢弃它，之后 set_visible(true) 也无法显示。
#[cfg(target_os = "macos")]
fn ensure_tray2(app: &tauri::AppHandle, title: &str) {
    use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
    use tauri::Manager;
    if app.tray_by_id("main-tray-2").is_some() {
        return;
    }
    let Ok(menu) = build_tray_menu(app) else { return };
    let result = TrayIconBuilder::with_id("main-tray-2")
        .tooltip(tr("云小历：点击打开日历", "Yun Calendar: click to open"))
        .title(title)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(handle_tray_menu_event)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        })
        .build(app);
    // 必须由应用状态持有，否则句柄释放后状态栏项会被移除
    if let Ok(tray) = result {
        app.manage(tray);
    }
}

/// macOS 26（Tahoe）状态栏归属诊断与修复。
///
/// Tahoe 起第三方状态栏项由 ControlCenter 统一托管，允许名单保存在
/// `~/Library/Group Containers/group.com.apple.controlcenter/Library/Preferences/group.com.apple.controlcenter.plist`
/// 的 `trackedApplications`（内嵌 binary plist）中。已知两类会让状态栏项"创建成功但永远不显示"的状态：
/// 1. 本应用条目 `isAllowed = false`（用户在 系统设置 → 菜单栏 中关闭了）；
/// 2. 本应用的 bundle id 被写进了**另一个** app 条目的 `menuItemLocations`，且那个 app `isAllowed = false`。
///    从终端 / IDE 直接启动应用时，macOS 会把状态栏项归属到启动它的父应用，从而产生这种孤儿映射，
///    此后无论如何重启都会被 ControlCenter 归入 blocked 列表（日志表现为 "Moving host to blocked list"）。
#[cfg(target_os = "macos")]
mod tray_tahoe {
    use super::{is_zh, tr};
    use std::path::PathBuf;

    pub const BUNDLE_ID: &str = "com.yunxiaoli.app";
    const TRACKED_KEY: &str = "trackedApplications";

    #[derive(serde::Serialize, Default)]
    pub struct TrayRegistration {
        /// 是否成功读取到 ControlCenter 的登记信息（非 Tahoe 或读取失败时为 false）
        pub available: bool,
        /// 本应用自身条目的 isAllowed；None 表示尚未登记
        pub allowed: Option<bool>,
        /// 把本应用列入自己 menuItemLocations 且被禁止显示的其他应用（真正造成屏蔽的元凶）
        pub blocked_by: Vec<String>,
        /// 把本应用列入自己 menuItemLocations 但仍允许显示的其他应用（暂无影响，一旦被关闭就会连带屏蔽）
        pub attributed_to: Vec<String>,
        pub error: Option<String>,
    }

    fn plist_path() -> Option<PathBuf> {
        let home = std::env::var_os("HOME")?;
        Some(PathBuf::from(home).join(
            "Library/Group Containers/group.com.apple.controlcenter/Library/Preferences/group.com.apple.controlcenter.plist",
        ))
    }

    fn bundle_of(loc: &plist::Value) -> Option<&str> {
        loc.as_dictionary()?
            .get("bundle")?
            .as_dictionary()?
            .get("_0")?
            .as_string()
    }

    /// 读取内层 trackedApplications 数组
    fn read_tracked() -> Result<Vec<plist::Value>, String> {
        let path = plist_path().ok_or(tr("无法定位用户目录", "Cannot locate home directory"))?;
        let outer = plist::Value::from_file(&path).map_err(|e| {
            format!("{}: {e}", tr("读取 ControlCenter 配置失败", "Failed to read Control Center settings"))
        })?;
        let data = outer
            .as_dictionary()
            .and_then(|d| d.get(TRACKED_KEY))
            .and_then(|v| v.as_data())
            .ok_or(tr("配置中没有 trackedApplications", "trackedApplications not found"))?;
        let inner = plist::Value::from_reader(std::io::Cursor::new(data))
            .map_err(|e| format!("{}: {e}", tr("解析 trackedApplications 失败", "Failed to parse trackedApplications")))?;
        inner
            .into_array()
            .ok_or_else(|| tr("trackedApplications 不是数组", "trackedApplications is not an array").to_string())
    }

    pub fn inspect() -> TrayRegistration {
        let entries = match read_tracked() {
            Ok(e) => e,
            Err(e) => {
                return TrayRegistration {
                    error: Some(e),
                    ..Default::default()
                }
            }
        };
        let mut reg = TrayRegistration {
            available: true,
            ..Default::default()
        };
        for entry in &entries {
            let Some(dict) = entry.as_dictionary() else { continue };
            let Some(locations) = dict.get("menuItemLocations").and_then(|v| v.as_array()) else { continue };
            let owner = dict.get("location").and_then(bundle_of);
            let allowed = dict.get("isAllowed").and_then(|v| v.as_boolean()).unwrap_or(false);
            if owner == Some(BUNDLE_ID) {
                reg.allowed = Some(allowed);
                continue;
            }
            if locations.iter().any(|l| bundle_of(l) == Some(BUNDLE_ID)) {
                let name = owner.unwrap_or("unknown").to_string();
                if allowed {
                    reg.attributed_to.push(name);
                } else {
                    reg.blocked_by.push(name);
                }
            }
        }
        reg
    }

    /// 清理孤儿映射：把本应用从其他 app 的 menuItemLocations 中移除，并把自身 isAllowed 置为 true。
    /// 修改前把原始 plist 备份到 backup_dir；写入走 `defaults`（经 cfprefsd，避免被其缓存覆盖），
    /// 最后重启 ControlCenter 让其重新读取（launchd 会自动拉起）。
    pub fn repair(backup_dir: PathBuf) -> Result<String, String> {
        let path = plist_path().ok_or(tr("无法定位用户目录", "Cannot locate home directory"))?;
        let mut entries = read_tracked()?;
        let changed = strip_orphan_mappings(&mut entries);
        if changed.is_empty() {
            return Ok(tr(
                "ControlCenter 登记信息正常，无需修复",
                "Control Center registration is fine, nothing to repair",
            )
            .into());
        }

        std::fs::create_dir_all(&backup_dir)
            .map_err(|e| format!("{}: {e}", tr("创建备份目录失败", "Failed to create backup folder")))?;
        let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
        let backup = backup_dir.join(format!("group.com.apple.controlcenter.{stamp}.plist"));
        std::fs::copy(&path, &backup).map_err(|e| format!("{}: {e}", tr("备份失败", "Backup failed")))?;

        let hex = encode_tracked(entries)?;
        // defaults 以路径作为域名时不带 .plist 后缀
        let domain = path.with_extension("");
        let status = std::process::Command::new("/usr/bin/defaults")
            .arg("write")
            .arg(&domain)
            .arg(TRACKED_KEY)
            .arg("-data")
            .arg(&hex)
            .status()
            .map_err(|e| format!("{}: {e}", tr("执行 defaults 失败", "Failed to run defaults")))?;
        if !status.success() {
            return Err(tr("defaults write 执行失败", "defaults write failed").into());
        }

        let _ = std::process::Command::new("/usr/bin/killall").arg("ControlCenter").status();

        Ok(if is_zh() {
            format!("已修复：{}。原配置已备份到 {}", changed.join("；"), backup.display())
        } else {
            format!("Repaired: {}. Original settings backed up to {}", changed.join("; "), backup.display())
        })
    }

    /// 纯逻辑：移除其他 app 对本应用的归属映射、确保自身 isAllowed = true。返回变更描述。
    pub fn strip_orphan_mappings(entries: &mut [plist::Value]) -> Vec<String> {
        let mut changed: Vec<String> = Vec::new();
        for entry in entries.iter_mut() {
            let Some(dict) = entry.as_dictionary_mut() else { continue };
            let owner = dict.get("location").and_then(bundle_of).map(str::to_string);
            if owner.as_deref() == Some(BUNDLE_ID) {
                if dict.get("isAllowed").and_then(|v| v.as_boolean()) != Some(true) {
                    dict.insert("isAllowed".into(), plist::Value::Boolean(true));
                    changed.push(if is_zh() {
                        format!("{BUNDLE_ID} 设为允许显示")
                    } else {
                        format!("allowed {BUNDLE_ID} in the menu bar")
                    });
                }
                continue;
            }
            let Some(locations) = dict.get_mut("menuItemLocations").and_then(|v| v.as_array_mut()) else { continue };
            let before = locations.len();
            locations.retain(|l| bundle_of(l) != Some(BUNDLE_ID));
            if locations.len() != before {
                let owner = owner.unwrap_or_else(|| "unknown".into());
                changed.push(if is_zh() {
                    format!("解除与 {owner} 的归属关联")
                } else {
                    format!("detached from {owner}")
                });
            }
        }
        changed
    }

    /// 把内层数组序列化为 binary plist 的 hex 字串（供 `defaults write -data` 使用）
    pub fn encode_tracked(entries: Vec<plist::Value>) -> Result<String, String> {
        let mut buf = Vec::new();
        plist::Value::Array(entries)
            .to_writer_binary(&mut buf)
            .map_err(|e| format!("{}: {e}", tr("序列化失败", "Serialization failed")))?;
        Ok(buf.iter().map(|b| format!("{b:02x}")).collect())
    }
}

/// 查询 ControlCenter 对本应用状态栏项的登记情况（仅 macOS 26+ 有意义）
#[tauri::command]
fn tray_registration_status() -> serde_json::Value {
    #[cfg(target_os = "macos")]
    {
        serde_json::to_value(tray_tahoe::inspect()).unwrap_or(serde_json::Value::Null)
    }
    #[cfg(not(target_os = "macos"))]
    {
        serde_json::json!({ "available": false })
    }
}

/// 一键修复 ControlCenter 中对本应用的错误归属 / 屏蔽状态
#[tauri::command]
fn repair_tray_registration(app: tauri::AppHandle) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use tauri::Manager;
        let dir = app
            .path()
            .app_config_dir()
            .map_err(|e| e.to_string())?
            .join("controlcenter-backup");
        tray_tahoe::repair(dir)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = app;
        Err("仅支持 macOS".into())
    }
}

/// 打开 系统设置 → 菜单栏（控制中心）面板
#[tauri::command]
fn open_menu_bar_settings() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("/usr/bin/open")
            .arg("x-apple.systempreferences:com.apple.ControlCenter-Settings.extension")
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("仅支持 macOS".into())
    }
}

/// 窗口尺寸/位置记忆（逻辑像素）。
/// 不用 window-state 插件：该插件在 Retina 屏上物理/逻辑像素混用，
/// 会导致恢复后尺寸翻倍、窗口跑出屏幕外。
#[derive(serde::Serialize, serde::Deserialize)]
struct WinState {
    width: f64,
    height: f64,
    x: i32,
    y: i32,
    maximized: bool,
}

fn win_state_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    use tauri::Manager;
    app.path()
        .app_config_dir()
        .ok()
        .map(|d| d.join("win-state.json"))
}

fn save_win_state(window: &tauri::WebviewWindow) {
    use tauri::Manager;
    // 最大化时不覆盖记录的正常尺寸
    if window.is_maximized().unwrap_or(false) {
        if let Some(path) = win_state_path(window.app_handle()) {
            if let Ok(data) = std::fs::read_to_string(&path) {
                if let Ok(mut state) = serde_json::from_str::<WinState>(&data) {
                    state.maximized = true;
                    let _ = std::fs::write(&path, serde_json::to_string_pretty(&state).unwrap());
                }
            }
        }
        return;
    }
    let Ok(scale) = window.scale_factor() else { return };
    let Ok(phys) = window.outer_size() else { return };
    let logical = phys.to_logical::<f64>(scale);
    let pos = window.outer_position().ok();
    let state = WinState {
        width: logical.width,
        height: logical.height,
        x: pos.map(|p| (p.x as f64 / scale) as i32).unwrap_or(100),
        y: pos.map(|p| (p.y as f64 / scale) as i32).unwrap_or(100),
        maximized: false,
    };
    if let Some(path) = win_state_path(window.app_handle()) {
        if let Some(dir) = path.parent() {
            let _ = std::fs::create_dir_all(dir);
        }
        let _ = std::fs::write(&path, serde_json::to_string_pretty(&state).unwrap());
    }
}

fn restore_win_state(window: &tauri::WebviewWindow) {
    use tauri::Manager;
    let Some(path) = win_state_path(window.app_handle()) else {
        return;
    };
    let Ok(data) = std::fs::read_to_string(&path) else {
        return;
    };
    let Ok(state) = serde_json::from_str::<WinState>(&data) else {
        return;
    };

    // 恢复尺寸（逻辑像素，带下限保护）
    let _ = window.set_size(tauri::LogicalSize::new(
        state.width.max(600.0),
        state.height.max(400.0)
    ));

    // 恢复位置：目标位置必须还落在当前屏幕范围内（防止外接显示器拔掉后窗口跑出屏幕）
    if let Ok(Some(monitor)) = window.current_monitor() {
        let scale = monitor.scale_factor();
        let m_pos = monitor.position();
        let m_size = monitor.size();
        let mx = m_pos.x as f64 / scale;
        let my = m_pos.y as f64 / scale;
        let mw = m_size.width as f64 / scale;
        let mh = m_size.height as f64 / scale;
        let x = state.x as f64;
        let y = state.y as f64;
        // 窗口左上角必须在屏幕内，且至少露出 1/3
        let in_bounds = x >= mx - state.width / 3.0
            && x < mx + mw - 100.0
            && y >= my
            && y < my + mh - 100.0;
        if in_bounds {
            let _ = window.set_position(tauri::LogicalPosition::new(x, y));
        } else {
            let _ = window.center();
        }
    }

    if state.maximized {
        let _ = window.maximize();
    }
}

/// 显示主窗口（macOS 下同时把应用切回 Regular 模式，恢复 Dock 图标）
fn show_main_window(app: &tauri::AppHandle) {
    use tauri::Manager;
    #[cfg(target_os = "macos")]
    {
        // Accessory 模式下应用不会出现在 Dock，也不会自动成为前台应用。
        // 托盘点击和登录项启动后的首次交互都需要显式恢复 Regular 模式。
        let _ = app.set_activation_policy(tauri::ActivationPolicy::Regular);
    }
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

/// 隐藏窗口到状态栏（macOS 下同时切换为 Accessory 模式，Dock 中彻底隐藏）
#[tauri::command]
fn hide_window_to_tray(app: tauri::AppHandle) {
    use tauri::Manager;
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    #[cfg(target_os = "macos")]
    let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);
}

/// 从状态栏恢复显示主窗口
#[tauri::command]
fn show_window_from_tray(app: tauri::AppHandle) {
    show_main_window(&app);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None::<Vec<&str>>
        ))
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
                app.handle().plugin(tauri_plugin_process::init())?;
            }
            #[cfg(all(desktop, target_os = "macos"))]
            {
                use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
                use tauri::Manager;
                {
                    // 状态栏右键菜单
                    let tray_menu = build_tray_menu(&app.handle())?;

                    let tray = TrayIconBuilder::with_id("main-tray")
                        // 启动时先用图标占位（前端同步显示配置后，显示时间时会移除图标只留文字）。
                        // logo 是彩色圆角图，不能作为 template（会被渲染成实心白块）。
                        .icon(tray_icon_image())
                        .icon_as_template(false)
                        .tooltip(tr("云小历：点击打开日历", "Yun Calendar: click to open"))
                        .menu(&tray_menu)
                        .show_menu_on_left_click(false)
                        .on_menu_event(handle_tray_menu_event)
                        .on_tray_icon_event(|tray, event| {
                            if let TrayIconEvent::Click {
                                button: MouseButton::Left,
                                button_state: MouseButtonState::Up,
                                ..
                            } = event
                            {
                                show_main_window(tray.app_handle());
                            }
                        })
                        .build(app)?;
                    // TrayIcon 在最后一个句柄释放时会从 macOS 状态栏移除，
                    // 必须由应用状态持有整个生命周期。
                    app.manage(tray);

                    // 菜单2：若上次退出时处于开启状态，必须在启动期随应用一起创建。
                    // macOS 26 的 ControlCenter 不显示"运行期才新建"的状态栏项，只有随启动创建才显示。
                    {
                        let state = app
                            .path()
                            .app_config_dir()
                            .ok()
                            .map(|d| d.join("tray2-state.json"))
                            .and_then(|p| std::fs::read_to_string(p).ok())
                            .and_then(|d| serde_json::from_str::<Tray2State>(&d).ok());
                        if let Some(state) = state {
                            if state.show && !state.template.is_empty() {
                                let tz = state.time_zone.as_deref().and_then(|s| s.parse::<chrono_tz::Tz>().ok());
                                let title = render_tray_template(&state.template, tz);
                                {
                                    let mut cfg = tray2_config().lock().unwrap();
                                    cfg.show = true;
                                    cfg.template = state.template.clone();
                                    cfg.time_zone = tz;
                                    cfg.last_title = title.clone();
                                    cfg.visible = Some(true);
                                }
                                ensure_tray2(&app.handle(), &title);
                                TRAY2_AT_LAUNCH.store(true, std::sync::atomic::Ordering::Relaxed);
                            }
                        }
                    }
                }
                // 启动原生状态栏计时线程
                start_tray_clock(app.handle().clone());
            }
            #[cfg(desktop)]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    // 启动时恢复上次的窗口尺寸/位置
                    restore_win_state(&window);
                    // 关闭窗口时记录尺寸/位置
                    let w = window.clone();
                    window.on_window_event(move |event| {
                        if let tauri::WindowEvent::CloseRequested { .. } = event {
                            save_win_state(&w);
                        }
                    });
                }
            }
            let _ = app;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_app_locale,
            sync_tray_config,
            sync_tray2_config,
            tray2_displayable,
            restart_app,
            hide_window_to_tray,
            show_window_from_tray,
            tray_registration_status,
            repair_tray_registration,
            open_menu_bar_settings
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        match &event {
            // 登录启动后窗口可能已可见但未激活，Dock 点击始终恢复并聚焦窗口。
            #[cfg(target_os = "macos")]
            tauri::RunEvent::Reopen { .. } => show_main_window(app_handle),
            // Cmd+Q 等途径退出时也记录窗口尺寸/位置
            #[cfg(desktop)]
            tauri::RunEvent::ExitRequested { .. } => {
                use tauri::Manager;
                if let Some(window) = app_handle.get_webview_window("main") {
                    save_win_state(&window);
                }
            }
            _ => {}
        }
        let _ = app_handle;
        let _ = event;
    });
}
