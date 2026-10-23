// 国际化入口：跟随 macOS 系统语言（含"系统设置 → 通用 → 语言与地区 → 应用程序"里的单独应用语言）
// 支持 zh-CN / en-US，其他语言一律回退到英文。
import { createI18n } from 'vue-i18n';
import { computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { I18n as LunarI18n } from 'lunar-javascript';
import antdZhCN from 'ant-design-vue/es/locale/zh_CN';
import antdEnUS from 'ant-design-vue/es/locale/en_US';

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'];

// 各业务模块的词条放在 ./modules/*.js，格式：export default { 'zh-CN': { ns: {...} }, 'en-US': { ns: {...} } }
const modules = import.meta.glob('./modules/*.js', { eager: true });
const messages = { 'zh-CN': {}, 'en-US': {} };
for (const mod of Object.values(modules)) {
    const m = mod.default || {};
    for (const lang of SUPPORTED_LOCALES) {
        Object.assign(messages[lang], m[lang] || {});
    }
}

const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    fallbackLocale: 'zh-CN',
    messages,
    missingWarn: false,
    fallbackWarn: false
});

export default i18n;

/** 非组件代码（utils 等）使用的翻译函数 */
export const t = (...args) => i18n.global.t(...args);

/** 取数组词条（如星期、月份名），返回纯字符串数组 */
export const tList = (key) => {
    const raw = i18n.global.tm(key);
    return Array.isArray(raw) ? raw.map((m) => i18n.global.rt(m)) : [];
};

/** 带数量的单位：tUnit('day', 3) → "3 天" / "3 days" */
export const tUnit = (unit, n) => i18n.global.t(`common.unit.${unit}`, { n }, n);

/** 当前语言（响应式） */
export const currentLocale = computed(() => i18n.global.locale.value);

export const isZh = () => i18n.global.locale.value === 'zh-CN';

/** 当前语言对应的 ant-design-vue locale（响应式） */
export const antdLocale = computed(() => (i18n.global.locale.value === 'zh-CN' ? antdZhCN : antdEnUS));

/** BCP 47 语言标签 → 支持的语言 */
export function normalizeLocale(tag) {
    return String(tag || '')
        .toLowerCase()
        .startsWith('zh')
        ? 'zh-CN'
        : 'en-US';
}

export function applyLocale(locale) {
    const lang = SUPPORTED_LOCALES.includes(locale) ? locale : 'en-US';
    i18n.global.locale.value = lang;
    dayjs.locale(lang === 'zh-CN' ? 'zh-cn' : 'en');
    // lunar-javascript 自带英文：宜忌、干支、节日、节气等随之切换
    LunarI18n.setLanguage(lang === 'zh-CN' ? 'chs' : 'en');
    document.documentElement.lang = lang;
    document.title = i18n.global.t('common.appName');
    return lang;
}

/**
 * 启动时检测语言。优先用 Rust 读取的 NSLocale.preferredLanguages（反映应用级语言设置），
 * 非 Tauri 环境回退到 navigator.language。
 */
export async function initLocale() {
    let tag = '';
    try {
        tag = await invoke('get_app_locale');
    } catch (e) {
        tag = navigator.language;
    }
    return applyLocale(normalizeLocale(tag));
}

/** 农历日期的短文本：中文"十五"，英文"8/15"（闰月"Leap 8/15"） */
export function lunarDayText(lunar) {
    if (isZh()) return lunar.getDayInChinese();
    const month = lunar.getMonth();
    return `${month < 0 ? 'Leap ' : ''}${Math.abs(month)}/${lunar.getDay()}`;
}

/** 农历月日完整文本：中文"八月十五"，英文"Lunar 8/15" */
export function lunarMonthDayText(lunar) {
    if (isZh()) return `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    return `Lunar ${lunarDayText(lunar)}`;
}

/**
 * 法定节假日名称翻译（假期接口只返回中文，如"中秋节"、"国庆节后补班"）
 */
const HOLIDAY_NAMES_EN = {
    元旦: "New Year's Day",
    春节: 'Spring Festival',
    除夕: "Chinese New Year's Eve",
    元宵节: 'Lantern Festival',
    清明节: 'Qingming Festival',
    清明: 'Qingming Festival',
    劳动节: 'Labour Day',
    端午节: 'Dragon Boat Festival',
    中秋节: 'Mid-Autumn Festival',
    国庆节: 'National Day',
    国庆中秋: 'National Day & Mid-Autumn'
};

export function translateHolidayName(name) {
    if (!name || isZh()) return name;
    const m = String(name).match(/^(.+?)(前|后)?补班$/);
    if (m) {
        const base = HOLIDAY_NAMES_EN[m[1]] || m[1];
        return `${base} (make-up workday)`;
    }
    return HOLIDAY_NAMES_EN[name] || name;
}
