// utils 层数据的展示文案（subscriptionManager 等）。注意 vue-i18n 消息语法：{ } @ $ | 是特殊字符
export default {
    'zh-CN': {
        subscriptionData: {
            weather: { name: '天气预报', desc: '预报天气和空气质量' },
            lunar: { name: '农历详情', desc: '农历年、月、日详情' },
            huangli: { name: '黄历运势', desc: '每日宜忌，早知道' },
            zodiac: { name: '星座运势', desc: '你专属的星座运势...' },
            worldClock: { name: '世界时钟', desc: '地球上其它城市现...' },
            schedule: { name: '日程安排', desc: '管理并提醒您的每日日程' }
        }
    },
    'en-US': {
        subscriptionData: {
            weather: { name: 'Weather', desc: 'Forecast and air quality' },
            lunar: { name: 'Lunar Calendar', desc: 'Lunar year, month and day' },
            huangli: { name: 'Almanac', desc: "Daily do's and don'ts" },
            zodiac: { name: 'Horoscope', desc: 'Your daily horoscope...' },
            worldClock: { name: 'World Clock', desc: 'Time in other cities...' },
            schedule: { name: 'Schedule', desc: 'Manage and remind your daily events' }
        }
    }
};
