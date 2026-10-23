import { ref, reactive } from 'vue';
import { fetch } from '@tauri-apps/plugin-http';
import settingsManager from './settingsManager';
import dayjs from 'dayjs';
import { t, tList, isZh } from '../i18n';

/*
 * 多天气源管理（数据来源：https://www.rinuo.com/free/weather 中列出的免费接口）
 * 支持 4 个可切换的免费天气源：
 *   1. Open-Meteo      —— 完全免费、无需 Key（默认）
 *   2. OpenWeatherMap  —— 需要 Key（免费 60 次/分钟）
 *   3. WeatherAPI.com  —— 需要 Key（免费 100 万次/月）
 *   4. Weatherbit      —— 需要 Key（免费 50 次/天）
 *
 * 各源返回数据统一映射为高德格式的 forecast 结构，
 * 保持 UI（RightPanel / 状态栏）无需感知数据源差异：
 *   { date, dayweather, nightweather, daytemp, nighttemp, daywind, daypower, category }
 * 文字字段随当前语言输出；category 为与语言无关的天气类别（sunny/cloudy/fog/rain/snow/thunder/''），供图标判断。
 */

export const WEATHER_PROVIDERS = [
    {
        id: 'open-meteo',
        get name() {
            return t('weather.provider.openMeteo');
        },
        needKey: false,
        doc: 'https://open-meteo.com/',
        maxDays: 14
    },
    {
        id: 'openweathermap',
        name: 'OpenWeatherMap',
        needKey: true,
        doc: 'https://openweathermap.org/api',
        maxDays: 5
    },
    {
        id: 'weatherapi',
        name: 'WeatherAPI.com',
        needKey: true,
        doc: 'https://www.weatherapi.com/',
        maxDays: 3
    },
    {
        id: 'weatherbit',
        name: 'Weatherbit',
        needKey: true,
        doc: 'https://www.weatherbit.io/',
        maxDays: 14
    }
];

// WMO 天气代码 → [词条 key, 类别]（Open-Meteo 使用）
const WMO_WEATHER_MAP = {
    0: ['clear', 'sunny'],
    1: ['mainlyClear', 'cloudy'],
    2: ['partlyCloudy', 'cloudy'],
    3: ['overcast', 'cloudy'],
    45: ['fog', 'fog'],
    48: ['rimeFog', 'fog'],
    51: ['drizzle', 'rain'],
    53: ['drizzle', 'rain'],
    55: ['drizzle', 'rain'],
    56: ['freezingDrizzle', 'rain'],
    57: ['freezingDrizzle', 'rain'],
    61: ['lightRain', 'rain'],
    63: ['moderateRain', 'rain'],
    65: ['heavyRain', 'rain'],
    66: ['freezingRain', 'rain'],
    67: ['freezingRain', 'rain'],
    71: ['lightSnow', 'snow'],
    73: ['moderateSnow', 'snow'],
    75: ['heavySnow', 'snow'],
    77: ['snowGrains', 'snow'],
    80: ['showers', 'rain'],
    81: ['heavyShowers', 'rain'],
    82: ['violentShowers', 'rain'],
    85: ['snowShowers', 'snow'],
    86: ['heavySnowShowers', 'snow'],
    95: ['thunderstorm', 'thunder'],
    96: ['thunderHail', 'thunder'],
    99: ['thunderHail', 'thunder']
};

const WIND_ABBRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

// 按天气描述（中/英文）推断类别，顺序即优先级
const CATEGORY_PATTERNS = [
    ['thunder', /雷|thunder/i],
    ['snow', /雪|snow|sleet|blizzard|ice pellets/i],
    ['rain', /雨|rain|drizzle|shower/i],
    ['fog', /雾|霾|沙|尘|fog|mist|haze|smoke|dust|sand/i],
    ['cloudy', /云|阴|cloud|overcast/i],
    ['sunny', /晴|clear|sunny/i]
];

function categoryFromText(text) {
    if (!text) return '';
    const hit = CATEGORY_PATTERNS.find(([, re]) => re.test(text));
    return hit ? hit[0] : '';
}

// 第三方接口返回的英文描述常为小写（如 "light rain"），首字母大写
function normalizeDesc(text) {
    if (!text || isZh()) return text || '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// 角度 → 风向（中文"东北风"，英文"NE"）
function windDirFromDeg(deg) {
    if (deg == null || isNaN(deg)) return '';
    return tList('weather.dir8')[Math.round(deg / 45) % 8] || '';
}

// 16 方位缩写 → 风向（中文"东北风"，英文"NE"）
function windDirFromAbbr(abbr) {
    return WIND_ABBRS.includes(abbr) ? t(`weather.dir16.${abbr}`) : '';
}

// km/h → 风力等级（蒲福风级近似；中文"≤3级"/"5级"，英文"Force ≤3"/"Force 5"）
function windLevelFromKmh(kmh) {
    if (kmh == null || isNaN(kmh)) return '';
    const thresholds = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
    let level = 0;
    for (const th of thresholds) {
        if (kmh >= th) level++;
    }
    return level <= 3 ? t('weather.powerLow') : t('weather.power', { level });
}

// 当前语言对应的接口语言参数
function apiLang(zh, en) {
    return isZh() ? zh : en;
}

// 城市英文名（城市内部标识与接口查询始终使用中文名，这里仅用于英文界面显示）
const CITY_NAMES_EN = {
    北京: 'Beijing',
    上海: 'Shanghai',
    广州: 'Guangzhou',
    深圳: 'Shenzhen',
    杭州: 'Hangzhou',
    成都: 'Chengdu',
    武汉: 'Wuhan',
    西安: "Xi'an",
    南京: 'Nanjing',
    重庆: 'Chongqing',
    苏州: 'Suzhou',
    天津: 'Tianjin',
    郑州: 'Zhengzhou',
    长沙: 'Changsha',
    福州: 'Fuzhou',
    沈阳: 'Shenyang',
    哈尔滨: 'Harbin',
    济南: 'Jinan',
    青岛: 'Qingdao',
    大连: 'Dalian',
    宁波: 'Ningbo',
    厦门: 'Xiamen',
    昆明: 'Kunming',
    合肥: 'Hefei',
    南昌: 'Nanchang',
    贵阳: 'Guiyang',
    兰州: 'Lanzhou',
    太原: 'Taiyuan',
    石家庄: 'Shijiazhuang',
    长春: 'Changchun',
    乌鲁木齐: 'Urumqi',
    呼和浩特: 'Hohhot',
    海口: 'Haikou',
    三亚: 'Sanya',
    拉萨: 'Lhasa',
    西宁: 'Xining',
    银川: 'Yinchuan',
    南宁: 'Nanning',
    珠海: 'Zhuhai',
    佛山: 'Foshan',
    香港: 'Hong Kong',
    澳门: 'Macau',
    台北: 'Taipei',
    高雄: 'Kaohsiung',
    台中: 'Taichung',
    东莞: 'Dongguan',
    中山: 'Zhongshan',
    惠州: 'Huizhou',
    江门: 'Jiangmen',
    汕头: 'Shantou',
    湛江: 'Zhanjiang',
    无锡: 'Wuxi',
    常州: 'Changzhou',
    南通: 'Nantong',
    徐州: 'Xuzhou',
    扬州: 'Yangzhou',
    温州: 'Wenzhou',
    绍兴: 'Shaoxing',
    嘉兴: 'Jiaxing',
    金华: 'Jinhua',
    泉州: 'Quanzhou',
    烟台: 'Yantai',
    潍坊: 'Weifang',
    威海: 'Weihai',
    洛阳: 'Luoyang',
    开封: 'Kaifeng',
    保定: 'Baoding',
    唐山: 'Tangshan',
    秦皇岛: 'Qinhuangdao',
    大同: 'Datong',
    包头: 'Baotou',
    鄂尔多斯: 'Ordos',
    吉林: 'Jilin',
    大庆: 'Daqing',
    齐齐哈尔: 'Qiqihar',
    鞍山: 'Anshan',
    芜湖: 'Wuhu',
    九江: 'Jiujiang',
    赣州: 'Ganzhou',
    宜昌: 'Yichang',
    襄阳: 'Xiangyang',
    株洲: 'Zhuzhou',
    岳阳: 'Yueyang',
    桂林: 'Guilin',
    柳州: 'Liuzhou',
    北海: 'Beihai',
    绵阳: 'Mianyang',
    宜宾: 'Yibin',
    遵义: 'Zunyi',
    大理: 'Dali',
    丽江: 'Lijiang',
    西双版纳: 'Xishuangbanna',
    喀什: 'Kashgar',
    延安: "Yan'an",
    宝鸡: 'Baoji',
    东京: 'Tokyo',
    大阪: 'Osaka',
    首尔: 'Seoul',
    新加坡: 'Singapore',
    曼谷: 'Bangkok',
    吉隆坡: 'Kuala Lumpur',
    雅加达: 'Jakarta',
    马尼拉: 'Manila',
    河内: 'Hanoi',
    胡志明市: 'Ho Chi Minh City',
    新德里: 'New Delhi',
    孟买: 'Mumbai',
    迪拜: 'Dubai',
    伊斯坦布尔: 'Istanbul',
    莫斯科: 'Moscow',
    伦敦: 'London',
    巴黎: 'Paris',
    柏林: 'Berlin',
    罗马: 'Rome',
    马德里: 'Madrid',
    阿姆斯特丹: 'Amsterdam',
    苏黎世: 'Zurich',
    维也纳: 'Vienna',
    纽约: 'New York',
    洛杉矶: 'Los Angeles',
    旧金山: 'San Francisco',
    芝加哥: 'Chicago',
    西雅图: 'Seattle',
    华盛顿: 'Washington',
    波士顿: 'Boston',
    多伦多: 'Toronto',
    温哥华: 'Vancouver',
    墨西哥城: 'Mexico City',
    圣保罗: 'São Paulo',
    布宜诺斯艾利斯: 'Buenos Aires',
    悉尼: 'Sydney',
    墨尔本: 'Melbourne',
    奥克兰: 'Auckland',
    开罗: 'Cairo',
    约翰内斯堡: 'Johannesburg',
    檀香山: 'Honolulu'
};

const HAN_RE = /[\u4e00-\u9fff]/;

class WeatherManager {
    constructor() {
        this.todayWeather = ref(null);
        this.selectedWeather = ref(null);
        this.weatherForecasts = ref([]);
        // 内置映射之外的城市英文名，取自天气接口返回（中文名 → 英文名）
        this.cityNameCache = reactive({});
    }

    getProvider() {
        const id = settingsManager.get('weatherProvider') || 'open-meteo';
        return WEATHER_PROVIDERS.find((p) => p.id === id) || WEATHER_PROVIDERS[0];
    }

    // 当前数据源支持的最大预报天数
    getSupportedDays() {
        return this.getProvider().maxDays || 7;
    }

    getKey(providerId) {
        const keys = settingsManager.get('weatherKeys') || {};
        return keys[providerId] || '';
    }

    /**
     * 拉取指定城市（城市名，如 "北京"）的天气预报并统一格式
     */
    async fetchWeather(cityName) {
        const city = cityName || '北京';
        const provider = this.getProvider();
        try {
            let forecasts = null;
            switch (provider.id) {
                case 'openweathermap':
                    forecasts = await this._fetchOpenWeatherMap(city);
                    break;
                case 'weatherapi':
                    forecasts = await this._fetchWeatherApi(city);
                    break;
                case 'weatherbit':
                    forecasts = await this._fetchWeatherbit(city);
                    break;
                default:
                    forecasts = await this._fetchOpenMeteo(city);
            }
            if (forecasts && forecasts.length > 0) {
                this.weatherForecasts.value = forecasts;
                this.updateToday();
                return forecasts;
            }
        } catch (error) {
            console.error(`获取天气失败 [${provider.id}]:`, error);
        }
        return null;
    }

    // ---------- 数据源实现 ----------

    // 1. Open-Meteo：免 Key，先地理编码再取 7 天预报
    async _fetchOpenMeteo(city) {
        // 城市按中文名搜索，必须 language=zh 才能命中（language=en 搜中文名无结果）
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`,
            { method: 'GET' }
        );
        const geo = await geoRes.json();
        const loc = geo.results && geo.results[0];
        if (!loc) throw new Error(`未找到城市: ${city}`);
        if (loc.id && this._needCityName(city)) this._learnOpenMeteoCityName(city, loc.id);

        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant` +
                `&timezone=auto&forecast_days=16`,
            { method: 'GET' }
        );
        const data = await res.json();
        const d = data.daily;
        if (!d || !d.time) return null;

        return d.time.map((date, i) => {
            const wmo = WMO_WEATHER_MAP[d.weather_code[i]];
            const text = wmo ? t(`weather.wmo.${wmo[0]}`) : t('weather.unknown');
            return {
                date,
                dayweather: text,
                nightweather: text,
                daytemp: Math.round(d.temperature_2m_max[i]),
                nighttemp: Math.round(d.temperature_2m_min[i]),
                daywind: windDirFromDeg(d.wind_direction_10m_dominant[i]),
                daypower: windLevelFromKmh(d.wind_speed_10m_max[i]),
                category: wmo ? wmo[1] : ''
            };
        });
    }

    // 英文界面下，用地理编码 id 取城市英文名（仅内置映射未覆盖的城市）
    async _learnOpenMeteoCityName(city, id) {
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/get?id=${id}&language=en`, {
                method: 'GET'
            });
            const data = await res.json();
            this._rememberCityName(city, data && data.name);
        } catch (e) {
            console.warn('获取城市英文名失败:', e);
        }
    }

    // 2. OpenWeatherMap：免费 5 天/3 小时间隔预报，聚合为按天数据
    async _fetchOpenWeatherMap(city) {
        const key = this.getKey('openweathermap');
        if (!key) throw new Error('未配置 OpenWeatherMap API Key');
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=${apiLang('zh_cn', 'en')}`,
            { method: 'GET' }
        );
        const data = await res.json();
        if (!data.list) throw new Error(data.message || 'OpenWeatherMap 返回异常');
        this._rememberCityName(city, data.city && data.city.name);

        // 按日期分组
        const byDate = {};
        for (const item of data.list) {
            const date = item.dt_txt.slice(0, 10);
            const hour = parseInt(item.dt_txt.slice(11, 13), 10);
            (byDate[date] = byDate[date] || []).push({
                hour,
                temp: item.main.temp,
                desc: normalizeDesc(item.weather[0]?.description || ''),
                windDeg: item.wind?.deg,
                windSpeedKmh: (item.wind?.speed || 0) * 3.6
            });
        }

        const pickClosest = (entries, targetHour) =>
            entries.reduce((a, b) => (Math.abs(b.hour - targetHour) < Math.abs(a.hour - targetHour) ? b : a));

        return Object.keys(byDate)
            .sort()
            .map((date) => {
                const entries = byDate[date];
                const dayEntry = pickClosest(entries, 14);
                const nightEntry = pickClosest(entries, 2);
                return {
                    date,
                    dayweather: dayEntry.desc,
                    nightweather: nightEntry.desc,
                    daytemp: Math.round(Math.max(...entries.map((e) => e.temp))),
                    nighttemp: Math.round(Math.min(...entries.map((e) => e.temp))),
                    daywind: windDirFromDeg(dayEntry.windDeg),
                    daypower: windLevelFromKmh(dayEntry.windSpeedKmh),
                    category: categoryFromText(dayEntry.desc)
                };
            });
    }

    // 3. WeatherAPI.com：一次返回 7 天预报
    async _fetchWeatherApi(city) {
        const key = this.getKey('weatherapi');
        if (!key) throw new Error('未配置 WeatherAPI.com API Key');
        const res = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(city)}&days=3&lang=${apiLang('zh', 'en')}`,
            { method: 'GET' }
        );
        const data = await res.json();
        const days = data.forecast && data.forecast.forecastday;
        if (!days) throw new Error(data.error?.message || 'WeatherAPI 返回异常');
        this._rememberCityName(city, data.location && data.location.name);

        return days.map((d) => {
            const text = normalizeDesc(d.day.condition.text);
            return {
                date: d.date,
                dayweather: text,
                nightweather: text,
                daytemp: Math.round(d.day.maxtemp_c),
                nighttemp: Math.round(d.day.mintemp_c),
                daywind: '',
                daypower: windLevelFromKmh(d.day.maxwind_kph),
                category: categoryFromText(text)
            };
        });
    }

    // 4. Weatherbit：免费档支持 16 天每日预报
    async _fetchWeatherbit(city) {
        const key = this.getKey('weatherbit');
        if (!key) throw new Error('未配置 Weatherbit API Key');
        const res = await fetch(
            `https://api.weatherbit.io/v2.0/forecast/daily?city=${encodeURIComponent(city)}&key=${key}&lang=${apiLang('zh', 'en')}&days=16`,
            { method: 'GET' }
        );
        const data = await res.json();
        if (!data.data) throw new Error('Weatherbit 返回异常');
        this._rememberCityName(city, data.city_name);

        return data.data.map((d) => {
            const text = normalizeDesc(d.weather.description);
            return {
                date: d.valid_date,
                dayweather: text,
                nightweather: text,
                daytemp: Math.round(d.max_temp),
                nighttemp: Math.round(d.min_temp),
                daywind: windDirFromAbbr(d.wind_cdir),
                daypower: windLevelFromKmh((d.wind_spd || 0) * 3.6),
                category: categoryFromText(text)
            };
        });
    }

    // ---------- 统一的数据访问层 ----------

    // 白天/夜间天气合并文字，如"小雨转多云" / "Light rain → Cloudy"
    _combineWeather(match) {
        return match.dayweather === match.nightweather
            ? match.dayweather
            : t('weather.turnTo', { from: match.dayweather, to: match.nightweather });
    }

    updateToday() {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const match = this.weatherForecasts.value.find((f) => f.date === todayStr);
        if (match) {
            this.todayWeather.value = {
                weather: this._combineWeather(match),
                temp_day: match.daytemp,
                temp_night: match.nighttemp,
                date: match.date,
                category: match.category || ''
            };
        }
    }

    updateSelected(dateStr, cityName) {
        const match = this.weatherForecasts.value.find((f) => f.date === dateStr);
        if (match) {
            this.selectedWeather.value = {
                city: cityName,
                weather: this._combineWeather(match),
                temp_day: match.daytemp,
                temp_night: match.nighttemp,
                daywind: match.daywind,
                daypower: match.daypower,
                date: match.date,
                category: match.category || ''
            };
        } else {
            this.selectedWeather.value = null;
        }
    }

    _needCityName(city) {
        return !isZh() && !CITY_NAMES_EN[city] && !CITY_NAMES_EN[String(city).replace(/市$/, '')];
    }

    _rememberCityName(city, enName) {
        if (!city || !enName || !this._needCityName(city) || HAN_RE.test(enName)) return;
        this.cityNameCache[city] = enName;
    }

    // 城市显示名（随语言切换；城市内部标识与接口查询始终使用中文名）
    getCityDisplayName(name) {
        if (!name || isZh() || !HAN_RE.test(name)) return name;
        return CITY_NAMES_EN[name] || CITY_NAMES_EN[name.replace(/市$/, '')] || this.cityNameCache[name] || name;
    }

    getToday() {
        return this.todayWeather.value;
    }

    getSelected() {
        return this.selectedWeather.value;
    }

    // Compatibility method
    update(data) {
        this.todayWeather.value = data;
    }

    // Compatibility method
    get() {
        return this.todayWeather.value;
    }
}

export default new WeatherManager();
