// 状态栏显示格式预设。选择预设时保存的是当时语言的格式串，
// 语言切换后按预设自动换成对应语言的版本；用户自定义的格式原样保留。
import { isZh } from '../i18n';

export const TRAY_PRESETS = [
    {
        id: 'full',
        zh: 'M月D日 ddd HH:mm:ss - {city} {temp}°C {weather}',
        en: 'ddd MMM D HH:mm:ss - {city} {temp}°C {weather}'
    },
    { id: 'dateTime', zh: 'M月D日 ddd HH:mm:ss', en: 'ddd MMM D HH:mm:ss' },
    { id: 'time', zh: 'HH:mm:ss', en: 'HH:mm:ss' },
    { id: 'weather', zh: '{city} {temp}°C {weather}', en: '{city} {temp}°C {weather}' }
];

export function findTrayPreset(format) {
    return TRAY_PRESETS.find((p) => p.zh === format || p.en === format) || null;
}

/** 当前语言下的预设格式串 */
export function presetFormat(preset) {
    return isZh() ? preset.zh : preset.en;
}

/** 把保存的格式换成当前语言的版本（仅预设） */
export function localizeTrayFormat(format) {
    const preset = findTrayPreset(format);
    return preset ? presetFormat(preset) : format;
}

export const DEFAULT_TRAY_FORMAT = TRAY_PRESETS[0].zh;

// 菜单2（第二时区时间）格式预设：仅时间相关，不含天气
export const TRAY2_PRESETS = [
    { id: 'time', zh: 'HH:mm:ss', en: 'HH:mm:ss' },
    { id: 'dateTime', zh: 'M月D日 ddd HH:mm:ss', en: 'ddd MMM D HH:mm:ss' },
    { id: 'date', zh: 'M月D日 ddd', en: 'ddd MMM D' }
];

export function findTray2Preset(format) {
    return TRAY2_PRESETS.find((p) => p.zh === format || p.en === format) || null;
}

/** 把菜单2保存的格式换成当前语言的版本（仅预设） */
export function localizeTray2Format(format) {
    const preset = findTray2Preset(format);
    return preset ? presetFormat(preset) : format;
}

export const DEFAULT_TRAY2_FORMAT = TRAY2_PRESETS[0].zh;
