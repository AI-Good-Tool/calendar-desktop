// 设置页。注意 vue-i18n 消息语法：{ } @ $ | 是特殊字符，字面量需写成 {'{'} {'}'} {'@'} {'$'} {'|'}
export default {
    'zh-CN': {
        settings: {
            title: '系统设置',
            backToCalendar: '返回日历',
            tabs: {
                general: '常规设置',
                api: 'API 配置',
                data: '数据管理',
                about: '关于'
            },
            autoLaunch: {
                label: '开机自启动',
                extra: '登录系统后自动启动云小历（macOS 通过登录项 LaunchAgent 实现）',
                toggle: '登录后自动启动',
                enabled: '已开启开机自启动',
                disabled: '已关闭开机自启动',
                failed: '设置失败，请重试'
            },
            timezone: {
                label: '时区',
                extra: '开启后跟随 macOS 系统时区（出差自动切换）；关闭后使用选择的时区，默认中文为北京时间（上海时区）、英文为美国东部（纽约）时区',
                toggle: '跟随系统时区',
                select: '使用时区',
                followOn: '已跟随系统时区',
                followOff: '已切换为固定时区：{zone}',
                changed: '时区已切换为 {zone}'
            },
            tray: {
                label: '系统状态栏显示',
                extra: '在 macOS 顶部状态栏实时显示当前日期、时间和天气',
                toggle: '显示时间与天气',
                enabled: '状态栏显示已开启',
                disabled: '状态栏显示已关闭',
                blockedTitle: 'macOS 未显示云小历的状态栏项',
                blockedDesc:
                    'macOS 把云小历的状态栏项归属到了「{apps}」，而该应用已被禁止在菜单栏显示，' +
                    '云小历因此被一并屏蔽（通常是从终端或开发工具直接启动云小历导致）。点击"一键修复"解除关联并重启控制中心；' +
                    '之后请通过 Finder / 启动台 / Dock 打开云小历。',
                appSeparator: '、',
                notAllowedTitle: 'macOS 未允许云小历在菜单栏显示',
                notAllowedDesc: '请在 系统设置 → 菜单栏 → "允许在菜单栏中显示" 中开启云小历，或点击"一键修复"。',
                repair: '一键修复',
                openSystemSettings: '打开系统设置',
                recheck: '重新检测',
                repairFailed: '修复失败：{error}',
                openSettingsFailed: '打开系统设置失败：{error}'
            },
            tray2: {
                label: '第二时区时间（菜单2）',
                extra: '在 macOS 状态栏再显示一个时钟（仅时间，无天气），可选择时区，默认美国东部（纽约）',
                toggle: '显示第二时区时间',
                select: '时区',
                formatPlaceholder: '自定义格式，如 HH:mm:ss（不支持天气占位符）',
                enabled: '第二时区时间已开启',
                disabled: '第二时区时间已关闭',
                restartTitle: '需要重启生效',
                restartContent: 'macOS 只显示随应用启动创建的状态栏项，第二时区时间将在重启后显示。是否立即重启？',
                restartNow: '立即重启',
                restartLater: '稍后手动重启'
            },
            format: {
                label: '显示格式',
                extra: "支持自定义格式。占位符：{'{'}city{'}'} 城市, {'{'}temp{'}'} 温度, {'{'}weather{'}'} 天气。 时间格式参考 dayjs (如: HH:mm:ss)。",
                placeholder: '选择显示格式',
                customPlaceholder: '或输入自定义格式内容',
                updated: '显示格式已更新',
                presets: {
                    full: '日期+时间+天气 (最丰富)',
                    dateTime: '日期+星期+时间',
                    time: '仅时间 (分秒)',
                    date: '仅日期+星期',
                    weather: '仅天气信息'
                }
            },
            weather: {
                label: '天气数据源',
                extra: '免费天气接口（来源：rinuo.com/free/weather），可随时切换；带 🔑 的源需要自行注册并填写 API Key。',
                keyPlaceholder: '请输入该数据源的 API Key',
                getKey: '前往 {name} 注册获取 Key →',
                switched: '天气数据源已切换为 {name}',
                keySaved: '天气 API Key 已保存'
            },
            zodiac: {
                label: '星座运势 API',
                extra: '用于右侧边栏的星座运势卡片。',
                doc: '查看 xxapi.cn 文档',
                apiPlaceholder: '接口地址'
            },
            holiday: {
                label: '节假日 API (timor.tech)',
                extra: '用于日历下标显示节假日和调休信息。',
                doc: '查看节假日文档',
                apiPlaceholder: '年接口地址'
            },
            actions: {
                save: '保存配置',
                reset: '重置为默认',
                saved: '配置已保存',
                resetTitle: '确定要重置配置吗？',
                resetContent: '这将把所有 API 地址和 Key 还原为默认值。',
                resetDone: '已恢复默认配置'
            },
            data: {
                dbTitle: '清除日程数据库',
                dbDesc: '这将永久删除 SQLite 数据库中保存的所有日程、待办、生日等事项。此操作不可撤销。',
                dbButton: '清除所有数据',
                dbConfirmTitle: '确定要清除所有日程吗？',
                dbConfirmContent: '此操作将从本地数据库中永久删除所有日程记录。',
                dbConfirmOk: '确定清除',
                dbCleared: '数据库已清空',
                dbClearFailed: '清除失败',
                cacheTitle: '清除本地缓存 (Local Storage)',
                cacheDesc: '重置所有订阅状态、主题设置、搜索历史及 API 配置。执行后应用将自动刷新。',
                cacheButton: '重置应用',
                cacheConfirmTitle: '确定要重置应用吗？',
                cacheConfirmContent: '此操作将清除本地存储的所有配置、订阅和偏好设置。重置后应用将重启。',
                cacheConfirmOk: '确定重置'
            },
            about: {
                version: 'Version {version}',
                desc: '一个基于 Tauri + Vue 3 的轻量级桌面日历应用，支持农历、节假日、日程提醒及多种生活订阅服务。'
            }
        }
    },
    'en-US': {
        settings: {
            title: 'Settings',
            backToCalendar: 'Back to Calendar',
            tabs: {
                general: 'General',
                api: 'APIs',
                data: 'Data',
                about: 'About'
            },
            autoLaunch: {
                label: 'Launch at Login',
                extra: 'Start Yun Calendar automatically after you log in (via a LaunchAgent login item on macOS)',
                toggle: 'Open at login',
                enabled: 'Launch at login enabled',
                disabled: 'Launch at login disabled',
                failed: 'Failed to update, please try again'
            },
            timezone: {
                label: 'Time Zone',
                extra: 'When on, follows the macOS system time zone (updates automatically when you travel). When off, uses the selected time zone: China Standard Time (Shanghai) by default in Chinese, US Eastern (New York) in English.',
                toggle: 'Follow system time zone',
                select: 'Time zone',
                followOn: 'Following the system time zone',
                followOff: 'Switched to fixed time zone: {zone}',
                changed: 'Time zone changed to {zone}'
            },
            tray: {
                label: 'Menu Bar',
                extra: 'Show the current date, time and weather in the macOS menu bar',
                toggle: 'Show time and weather',
                enabled: 'Menu bar display enabled',
                disabled: 'Menu bar display disabled',
                blockedTitle: "macOS is hiding Yun Calendar's menu bar item",
                blockedDesc:
                    "macOS attributed Yun Calendar's menu bar item to \"{apps}\", which is not allowed in the menu bar, " +
                    'so Yun Calendar is hidden as well (usually because it was launched from a terminal or dev tool). ' +
                    'Click "Fix" to remove the association and restart Control Center, ' +
                    'then open Yun Calendar from Finder, Launchpad or the Dock.',
                appSeparator: ', ',
                notAllowedTitle: 'Yun Calendar is not allowed in the menu bar',
                notAllowedDesc:
                    'Turn on Yun Calendar in System Settings → Menu Bar → "Allow in the Menu Bar", or click "Fix".',
                repair: 'Fix',
                openSystemSettings: 'Open System Settings',
                recheck: 'Check Again',
                repairFailed: 'Fix failed: {error}',
                openSettingsFailed: 'Failed to open System Settings: {error}'
            },
            tray2: {
                label: 'Second Time Zone (Menu 2)',
                extra: 'Show an extra clock in the macOS menu bar (time only, no weather) with a selectable time zone. Defaults to US Eastern (New York).',
                toggle: 'Show second time zone clock',
                select: 'Time zone',
                formatPlaceholder: 'Custom format, e.g. HH:mm:ss (weather placeholders not supported)',
                enabled: 'Second time zone clock enabled',
                disabled: 'Second time zone clock disabled',
                restartTitle: 'Restart required',
                restartContent: 'macOS only shows menu bar items created at app launch. The second clock will appear after a restart. Restart now?',
                restartNow: 'Restart now',
                restartLater: 'Later'
            },
            format: {
                label: 'Display Format',
                extra: "Custom formats are supported. Placeholders: {'{'}city{'}'} city, {'{'}temp{'}'} temperature, {'{'}weather{'}'} weather. Date and time use dayjs tokens (e.g. ddd MMM D HH:mm:ss).",
                placeholder: 'Select a format',
                customPlaceholder: 'Or enter a custom format',
                updated: 'Display format updated',
                presets: {
                    full: 'Date + time + weather',
                    dateTime: 'Date + weekday + time',
                    time: 'Time only',
                    date: 'Date + weekday only',
                    weather: 'Weather only'
                }
            },
            weather: {
                label: 'Weather Source',
                extra: 'Free weather APIs (source: rinuo.com/free/weather), switchable anytime. Sources marked 🔑 require your own API key.',
                keyPlaceholder: 'Enter the API key for this source',
                getKey: 'Get a key from {name} →',
                switched: 'Weather source switched to {name}',
                keySaved: 'Weather API key saved'
            },
            zodiac: {
                label: 'Horoscope API',
                extra: 'Used by the horoscope card in the side panel.',
                doc: 'xxapi.cn docs',
                apiPlaceholder: 'API URL'
            },
            holiday: {
                label: 'Holiday API (timor.tech)',
                extra: 'Used to show public holidays and make-up workdays on the calendar.',
                doc: 'Holiday API docs',
                apiPlaceholder: 'Yearly API URL'
            },
            actions: {
                save: 'Save',
                reset: 'Reset to Defaults',
                saved: 'Settings saved',
                resetTitle: 'Reset settings?',
                resetContent: 'All API URLs and keys will be restored to their defaults.',
                resetDone: 'Defaults restored'
            },
            data: {
                dbTitle: 'Clear Event Database',
                dbDesc: 'Permanently deletes all events, to-dos, birthdays and other items stored in the SQLite database. This cannot be undone.',
                dbButton: 'Clear All Data',
                dbConfirmTitle: 'Clear all events?',
                dbConfirmContent: 'All event records will be permanently deleted from the local database.',
                dbConfirmOk: 'Clear',
                dbCleared: 'Database cleared',
                dbClearFailed: 'Failed to clear',
                cacheTitle: 'Clear Local Storage',
                cacheDesc: 'Resets all subscriptions, theme settings, search history and API settings. The app will reload afterwards.',
                cacheButton: 'Reset App',
                cacheConfirmTitle: 'Reset the app?',
                cacheConfirmContent: 'All locally stored settings, subscriptions and preferences will be cleared. The app will restart.',
                cacheConfirmOk: 'Reset'
            },
            about: {
                version: 'Version {version}',
                desc: 'A lightweight desktop calendar built with Tauri + Vue 3, featuring the lunar calendar, public holidays, event reminders and a variety of lifestyle subscriptions.'
            }
        }
    }
};
