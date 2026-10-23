// 时区工具：
// - systemTimeZone：macOS 系统时区（出差/旅行自动切换时区时实时生效）。
//   WebKit 收到系统时区变更通知后会刷新 JS 的 Date/Intl 缓存，但 Vue 的计算属性不会自己重算，
//   因此这里轮询出一个响应式的 systemTimeZone，供组件依赖。
// - appTimeZone：应用实际使用的时区。设置里开启"跟随系统时区"时等于系统时区；
//   关闭时使用用户选择的时区，未选择则中文默认上海、英文默认纽约（美国东部）。
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { isZh } from '../i18n';
import settingsManager from './settingsManager';

dayjs.extend(utc);
dayjs.extend(timezone);

function detectTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
        return 'UTC';
    }
}

function isValidTimeZone(tz) {
    if (!tz) return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
    } catch (e) {
        return false;
    }
}

/** 当前系统 IANA 时区名，如 "Asia/Shanghai"、"America/New_York"（响应式） */
export const systemTimeZone = ref(detectTimeZone());

/** 是否跟随系统时区（设置项，默认开启） */
export const followSystemTimeZone = ref(settingsManager.get('followSystemTimeZone') !== false);

/** 不跟随系统时用户选择的时区；空字符串表示使用语言默认时区 */
export const customTimeZone = ref(settingsManager.get('customTimeZone') || '');

/** 不跟随系统且未手动选择时的默认时区：中文 → 上海，英文 → 纽约（美国东部） */
export function defaultTimeZoneForLocale() {
    return isZh() ? 'Asia/Shanghai' : 'America/New_York';
}

/** 应用实际使用的时区（响应式） */
export const appTimeZone = computed(() => {
    if (followSystemTimeZone.value) return systemTimeZone.value;
    return isValidTimeZone(customTimeZone.value) ? customTimeZone.value : defaultTimeZoneForLocale();
});

export function setFollowSystemTimeZone(follow) {
    followSystemTimeZone.value = !!follow;
    settingsManager.set('followSystemTimeZone', !!follow);
}

export function setCustomTimeZone(tz) {
    customTimeZone.value = tz || '';
    settingsManager.set('customTimeZone', tz || '');
}

// ---------- 让无参 dayjs() 返回应用时区的"当前钟面时间" ----------
// 项目里日程日期/时间都是不带时区的钟面值（如 "2026-09-24 18:00"），日历、今天高亮、提醒、农历换算
// 以及 antd 日期选择器内部的"今天"都基于 dayjs()。应用时区与系统时区不同时，
// 这里把 dayjs() 的起点换成"应用时区此刻的年月日时分秒"，下游逻辑无需逐处改动。
// 注意：被替换后的 dayjs() 不再代表真实时刻，需要真实时刻（换算到其他时区）时请用 dayjs(Date.now())。

const wallClockFormatters = new Map();

/** 某时区在 ms 时刻的钟面时间，返回一个"本地字段等于该钟面时间"的 Date */
function wallClockDate(tz, ms = Date.now()) {
    let f = wallClockFormatters.get(tz);
    if (!f) {
        f = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hourCycle: 'h23',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        wallClockFormatters.set(tz, f);
    }
    const p = {};
    for (const { type, value } of f.formatToParts(ms)) p[type] = value;
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second, ms % 1000);
}

// 需要改写"当前时间"的目标时区；null 表示与系统时区一致，保持 dayjs 原生行为
let shiftTimeZone = null;

dayjs.extend((option, Dayjs) => {
    const parse = Dayjs.prototype.parse;
    Dayjs.prototype.parse = function (cfg) {
        if (shiftTimeZone && cfg.date === undefined && !cfg.utc) {
            cfg.date = wallClockDate(shiftTimeZone);
        }
        return parse.call(this, cfg);
    };
});

function updateShift() {
    const tz = appTimeZone.value;
    const same = tz === systemTimeZone.value || zoneOffsetMinutes(tz) === -new Date().getTimezoneOffset();
    shiftTimeZone = same ? null : tz;
}

// ---------- 时区变化通知 ----------

const listeners = new Set();
let lastOffset = new Date().getTimezoneOffset();

function notify(tz, prev) {
    listeners.forEach((cb) => {
        try {
            cb(tz, prev);
        } catch (e) {
            console.error('时区变更回调失败:', e);
        }
    });
}

// 应用时区变化（系统时区变化且跟随系统，或设置里切换）时通知
watch(
    appTimeZone,
    (tz, prev) => {
        updateShift();
        if (prev !== undefined) notify(tz, prev);
    },
    { immediate: true, flush: 'sync' }
);

function checkTimeZone() {
    const tz = detectTimeZone();
    const offset = new Date().getTimezoneOffset();
    if (tz !== systemTimeZone.value) {
        systemTimeZone.value = tz;
        lastOffset = offset;
        // 不跟随系统时 appTimeZone 不变，但系统偏移变了，改写规则需要重算
        updateShift();
    } else if (offset !== lastOffset) {
        // 同名时区偏移变化（夏令时切换）
        lastOffset = offset;
        updateShift();
        if (followSystemTimeZone.value) notify(tz, tz);
    }
}

setInterval(checkTimeZone, 5000);
window.addEventListener('focus', checkTimeZone);

/** 订阅应用时区变化，返回取消订阅函数 */
export function onTimeZoneChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

/** 指定时区的当前时间（dayjs 对象，format/hour 等均为该时区的值） */
export function nowIn(tz) {
    return dayjs(Date.now()).tz(tz);
}

/** 指定时区当前相对 UTC 的偏移（分钟） */
export function zoneOffsetMinutes(tz, date = new Date()) {
    return dayjs(date).tz(tz).utcOffset();
}

/** "GMT+8"、"GMT-4"、"GMT+5:30" */
export function formatGmtOffset(minutes) {
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

/** 两个时区的时差（小时，可为小数），b 相对 a */
export function zoneDiffHours(a, b, date = new Date()) {
    return (zoneOffsetMinutes(b, date) - zoneOffsetMinutes(a, date)) / 60;
}

const CITY_NAMES_ZH = {
    'Asia/Shanghai': '北京',
    'Asia/Chongqing': '重庆',
    'Asia/Urumqi': '乌鲁木齐',
    'Asia/Hong_Kong': '香港',
    'Asia/Macau': '澳门',
    'Asia/Taipei': '台北',
    'Asia/Tokyo': '东京',
    'Asia/Seoul': '首尔',
    'Asia/Singapore': '新加坡',
    'Asia/Bangkok': '曼谷',
    'Asia/Kolkata': '新德里',
    'Asia/Dubai': '迪拜',
    'Europe/London': '伦敦',
    'Europe/Paris': '巴黎',
    'Europe/Berlin': '柏林',
    'Europe/Moscow': '莫斯科',
    'America/New_York': '纽约',
    'America/Chicago': '芝加哥',
    'America/Denver': '丹佛',
    'America/Los_Angeles': '洛杉矶',
    'America/Toronto': '多伦多',
    'America/Vancouver': '温哥华',
    'America/Sao_Paulo': '圣保罗',
    'Australia/Sydney': '悉尼',
    'Australia/Melbourne': '墨尔本',
    'Pacific/Auckland': '奥克兰',
    'Pacific/Honolulu': '檀香山',
    UTC: 'UTC'
};

const CITY_NAMES_EN_OVERRIDE = {
    'Asia/Shanghai': 'Beijing',
    'Asia/Kolkata': 'New Delhi'
};

/** 时区的城市显示名（随当前语言） */
export function zoneCityName(tz) {
    if (isZh()) return CITY_NAMES_ZH[tz] || tz.split('/').pop().replace(/_/g, ' ');
    return CITY_NAMES_EN_OVERRIDE[tz] || tz.split('/').pop().replace(/_/g, ' ');
}

/** 日程表单等处可选的常用时区（系统时区、应用时区若不在其中会自动加入） */
export const COMMON_TIME_ZONES = Object.keys(CITY_NAMES_ZH);

/** 时区下拉选项：[{ value: 'Asia/Shanghai', label: '(GMT+8) 北京' }] */
export function timeZoneOptions(extra = []) {
    const list = [systemTimeZone.value, appTimeZone.value, ...extra, ...COMMON_TIME_ZONES].filter(Boolean);
    const unique = [...new Set(list)];
    return unique
        .map((tz) => {
            let offset = 0;
            try {
                offset = zoneOffsetMinutes(tz);
            } catch (e) {
                // 旧数据里的 "GMT+8:00" 这类非 IANA 值
                return { value: tz, label: tz, offset: 0 };
            }
            return { value: tz, label: `(${formatGmtOffset(offset)}) ${zoneCityName(tz)}`, offset };
        })
        .sort((a, b) => a.offset - b.offset);
}
