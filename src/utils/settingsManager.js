/*
 * @Author: DaLong Li
 * @Date: 2026-02-06 15:30:28
 * @LastEditTime: 2026-02-06 15:38:28
 * @LastEditors: DaLong Li
 * @Description:
 * 生命在于运动，代码在于抽动。
 */
// 设置管理工具类
const STORAGE_KEY = 'calendar_api_settings';

const DEFAULT_SETTINGS = {
    // 天气数据源（多源可切换，见 weatherManager 的 WEATHER_PROVIDERS）
    weatherProvider: 'open-meteo',
    weatherKeys: { openweathermap: '', weatherapi: '', weatherbit: '' },
    zodiacApi: 'https://v2.xxapi.cn/api/horoscope',
    zodiacKey: 'free',
    holidayApi: 'https://timor.tech/api/holiday/year',
    showTrayTime: true,
    // 第二状态栏（菜单2）：第二时区时间，仅时间无天气，默认关闭，默认美国东部（纽约）时区
    showTray2: false,
    tray2TimeZone: 'America/New_York',
    tray2Format: 'HH:mm:ss',
    // 是否跟随系统时区；关闭后使用 customTimeZone，未选择时中文默认上海、英文默认纽约
    followSystemTimeZone: true,
    customTimeZone: '',
    trayDisplayFormat: 'M月D日 ddd HH:mm:ss - {city} {temp}°C {weather}'
};

class SettingsManager {
    constructor() {
        this.settings = this._load();
    }

    _load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
                // 迁移逻辑：如果还是旧的聚合接口，强制更新为新的免费接口
                if (settings.zodiacApi && settings.zodiacApi.includes('juhe.cn')) {
                    settings.zodiacApi = DEFAULT_SETTINGS.zodiacApi;
                    settings.zodiacKey = DEFAULT_SETTINGS.zodiacKey;
                    // 保存更新后的设置
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
                }
                // 迁移逻辑：删除已弃用的高德天气配置，切换到多天气源
                if ('weatherApi' in settings || 'weatherKey' in settings) {
                    delete settings.weatherApi;
                    delete settings.weatherKey;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
                }
                return settings;
            } catch (e) {
                console.error('加载设置失败:', e);
            }
        }
        return { ...DEFAULT_SETTINGS };
    }

    get(key) {
        return this.settings[key];
    }

    getAll() {
        return { ...this.settings };
    }

    set(key, value) {
        this.settings[key] = value;
        this._save();
    }

    setAll(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this._save();
    }

    _save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    }

    reset() {
        this.settings = { ...DEFAULT_SETTINGS };
        this._save();
    }
}

export default new SettingsManager();
