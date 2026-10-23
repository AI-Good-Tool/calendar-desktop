// 天气相关词条（weatherManager 使用）。注意 vue-i18n 消息语法：{ } @ $ | 是特殊字符
export default {
    'zh-CN': {
        weather: {
            provider: {
                openMeteo: 'Open-Meteo（免 Key）'
            },
            // WMO 天气代码对应的文字（Open-Meteo）
            wmo: {
                clear: '晴',
                mainlyClear: '晴间多云',
                partlyCloudy: '多云',
                overcast: '阴',
                fog: '雾',
                rimeFog: '雾凇',
                drizzle: '毛毛雨',
                freezingDrizzle: '冻毛毛雨',
                lightRain: '小雨',
                moderateRain: '中雨',
                heavyRain: '大雨',
                freezingRain: '冻雨',
                lightSnow: '小雪',
                moderateSnow: '中雪',
                heavySnow: '大雪',
                snowGrains: '雪粒',
                showers: '阵雨',
                heavyShowers: '强阵雨',
                violentShowers: '暴雨',
                snowShowers: '阵雪',
                heavySnowShowers: '强阵雪',
                thunderstorm: '雷暴',
                thunderHail: '雷阵雨伴冰雹'
            },
            unknown: '未知',
            // 白天/夜间天气不同时的连接，如"小雨转多云"
            turnTo: '{from}转{to}',
            // 8 方位风向（按角度）
            dir8: ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'],
            // 16 方位缩写 → 风向（Weatherbit）
            dir16: {
                N: '北风',
                NNE: '北东北风',
                NE: '东北风',
                ENE: '东东北风',
                E: '东风',
                ESE: '东东南风',
                SE: '东南风',
                SSE: '南东南风',
                S: '南风',
                SSW: '南西南风',
                SW: '西南风',
                WSW: '西西南风',
                W: '西风',
                WNW: '西西北风',
                NW: '西北风',
                NNW: '北西北风'
            },
            powerLow: '≤3级',
            power: '{level}级'
        }
    },
    'en-US': {
        weather: {
            provider: {
                openMeteo: 'Open-Meteo (no key)'
            },
            wmo: {
                clear: 'Clear',
                mainlyClear: 'Mostly clear',
                partlyCloudy: 'Partly cloudy',
                overcast: 'Overcast',
                fog: 'Fog',
                rimeFog: 'Rime fog',
                drizzle: 'Drizzle',
                freezingDrizzle: 'Freezing drizzle',
                lightRain: 'Light rain',
                moderateRain: 'Rain',
                heavyRain: 'Heavy rain',
                freezingRain: 'Freezing rain',
                lightSnow: 'Light snow',
                moderateSnow: 'Snow',
                heavySnow: 'Heavy snow',
                snowGrains: 'Snow grains',
                showers: 'Showers',
                heavyShowers: 'Heavy showers',
                violentShowers: 'Downpour',
                snowShowers: 'Snow showers',
                heavySnowShowers: 'Heavy snow showers',
                thunderstorm: 'Thunderstorm',
                thunderHail: 'Thunderstorm with hail'
            },
            unknown: 'Unknown',
            turnTo: '{from} → {to}',
            dir8: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
            dir16: {
                N: 'N',
                NNE: 'NNE',
                NE: 'NE',
                ENE: 'ENE',
                E: 'E',
                ESE: 'ESE',
                SE: 'SE',
                SSE: 'SSE',
                S: 'S',
                SSW: 'SSW',
                SW: 'SW',
                WSW: 'WSW',
                W: 'W',
                WNW: 'WNW',
                NW: 'NW',
                NNW: 'NNW'
            },
            powerLow: 'Force ≤3',
            power: 'Force {level}'
        }
    }
};
