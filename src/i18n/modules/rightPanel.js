// 右侧面板（RightPanel.vue）词条。注意 vue-i18n 消息语法：{ } @ $ | 是特殊字符
export default {
    'zh-CN': {
        rightPanel: {
            summary: '{year}年第{week}周 第{day}天 {rel}',
            rel: {
                after: '{n}天后',
                before: '{n}天前'
            },
            createSchedule: '创建日程',
            lunar: {
                header: '农历 {date}',
                yearInfo: '{year} {animal}年 {month}月 {day}日 {time}时',
                fullDate: '{year}年{date}',
                ganZhi: '{year}年 {month}月 {day}日',
                animalYear: '{animal}年',
                yi: '宜',
                ji: '忌',
                noYi: '诸事不宜',
                noJi: '百无禁忌'
            },
            schedule: {
                title: '日程安排',
                new: '新建',
                empty: '今日暂无日程安排',
                addNow: '立即添加',
                deleteTitle: '确定要删除这个日程吗？',
                deleteContent: '删除后将无法恢复',
                deleted: '日程已删除',
                deleteFailed: '删除失败'
            },
            scheduleType: {
                todo: '待办',
                event: '日程',
                birthday: '生日',
                anniversary: '纪念日',
                countdown: '倒数',
                other: '其他'
            },
            weather: {
                cardTitle: '天气预报 - {city}',
                refresh: '刷新天气',
                settings: '天气设置',
                viewForecast: '点击查看未来预报 ›',
                forecastTitle: '未来天气预报 - {city}',
                days: '{n}天',
                noForecast: '暂无预报数据，请点击右上角刷新',
                selectCity: '选择城市：',
                cityPlaceholder: '选择一个城市',
                cityTip: '提示：目前支持全国主要城市，选择后点击确定刷新天气数据。',
                updated: '天气已更新',
                refreshFailedCheck: '天气刷新失败，请检查数据源配置',
                refreshFailed: '天气刷新失败'
            },
            clock: {
                title: '世界时钟',
                local: '本地',
                diff: '{diff}小时'
            },
            zodiac: {
                title: '星座运势',
                types: {
                    today: '今日',
                    tomorrow: '明日',
                    week: '本周',
                    month: '本月'
                },
                signs: {
                    aries: '白羊座',
                    taurus: '金牛座',
                    gemini: '双子座',
                    cancer: '巨蟹座',
                    leo: '狮子座',
                    virgo: '处女座',
                    libra: '天秤座',
                    scorpio: '天蝎座',
                    sagittarius: '射手座',
                    capricorn: '摩羯座',
                    aquarius: '水瓶座',
                    pisces: '双鱼座'
                },
                index: {
                    all: '综合指数',
                    love: '爱情指数',
                    work: '工作指数',
                    money: '财运指数',
                    health: '健康指数'
                },
                luckyColor: '幸运色：{v}',
                luckyNumber: '幸运数：{v}',
                match: '速配：{v}',
                period: {
                    all: '综合运势',
                    work: '💼 工作运',
                    money: '💰 财运',
                    love: '❤️ 爱情运',
                    health: '🏥 健康运'
                },
                failed: '获取数据失败，请重试'
            },
            huangli: {
                title: '黄历运势'
            },
            editSubscription: '编辑订阅',
            label: {
                solar: '公历：',
                lunar: '农历：',
                ganZhi: '干支：',
                animal: '生肖：',
                festival: '节日：',
                term: '节气：',
                date: '选择日期：',
                result: '转换结果'
            },
            converter: {
                title: '公农历转换',
                pickDate: '选择公历日期：'
            },
            holidays: {
                title: '{year}年节日大全',
                legal: '法定节假日',
                traditional: '传统节日',
                solarTerms: '24节气',
                daysOff: '(放假{n}天)',
                termDate: '{m}月{from}-{to}日',
                items: {
                    chuXi: { name: '除夕', date: '农历腊月三十' },
                    chunJie: { name: '春节', date: '农历正月初一' },
                    yuanXiao: { name: '元宵节', date: '农历正月十五' },
                    longTaiTou: { name: '龙抬头', date: '农历二月初二' },
                    qingMing: { name: '清明节', date: '清明节气' },
                    duanWu: { name: '端午节', date: '农历五月初五' },
                    qiXi: { name: '七夕节', date: '农历七月初七' },
                    zhongYuan: { name: '中元节', date: '农历七月十五' },
                    zhongQiu: { name: '中秋节', date: '农历八月十五' },
                    chongYang: { name: '重阳节', date: '农历九月初九' },
                    hanYi: { name: '寒衣节', date: '农历十月初一' },
                    dongZhi: { name: '冬至节', date: '冬至节气' },
                    laBa: { name: '腊八节', date: '农历腊月初八' }
                }
            },
            calculator: {
                title: '日期计算器',
                start: '开始日期：',
                end: '结束日期：',
                result: '计算结果',
                days: '相差天数：',
                weeks: '相差周数：',
                months: '相差月数：',
                years: '相差年数：'
            },
            countdown: {
                title: '倒数日',
                target: '目标日期：',
                eventName: '事件名称：',
                placeholder: '例如：我的生日',
                heading: '倒计时',
                defaultName: '目标日期',
                future: '天后到达',
                past: '天前已过'
            },
            perpetual: {
                title: '万年历查询',
                details: '日期详情'
            },
            lucky: {
                title: '黄道吉日查询',
                heading: '宜忌事项'
            }
        }
    },
    'en-US': {
        rightPanel: {
            summary: 'Week {week} · Day {day} · {rel}',
            rel: {
                after: 'in {n} day | in {n} days',
                before: '{n} day ago | {n} days ago'
            },
            createSchedule: 'New event',
            lunar: {
                header: '{date}',
                yearInfo: '{year} ({animal}) · Month {month} · Day {day} · Hour {time}',
                fullDate: '{date}, {year}',
                ganZhi: 'Year {year} · Month {month} · Day {day}',
                animalYear: 'Year of the {animal}',
                yi: 'Do',
                ji: 'Avoid',
                noYi: 'Nothing auspicious',
                noJi: 'Nothing to avoid'
            },
            schedule: {
                title: 'Schedule',
                new: 'New',
                empty: 'No events today',
                addNow: 'Add one',
                deleteTitle: 'Delete this event?',
                deleteContent: 'This cannot be undone.',
                deleted: 'Event deleted',
                deleteFailed: 'Failed to delete'
            },
            scheduleType: {
                todo: 'To-do',
                event: 'Event',
                birthday: 'Birthday',
                anniversary: 'Anniversary',
                countdown: 'Countdown',
                other: 'Other'
            },
            weather: {
                cardTitle: 'Weather · {city}',
                refresh: 'Refresh weather',
                settings: 'Weather settings',
                viewForecast: 'View forecast ›',
                forecastTitle: 'Forecast · {city}',
                days: '{n} days',
                noForecast: 'No forecast data. Click Refresh above.',
                selectCity: 'City:',
                cityPlaceholder: 'Select a city',
                cityTip: 'Tip: Major cities in China are supported. Click OK to refresh the weather.',
                updated: 'Weather updated',
                refreshFailedCheck: 'Weather refresh failed. Check the data source settings.',
                refreshFailed: 'Weather refresh failed'
            },
            clock: {
                title: 'World Clock',
                local: 'Local',
                diff: '{diff}h'
            },
            zodiac: {
                title: 'Horoscope',
                types: {
                    today: 'Today',
                    tomorrow: 'Tomorrow',
                    week: 'Week',
                    month: 'Month'
                },
                signs: {
                    aries: 'Aries',
                    taurus: 'Taurus',
                    gemini: 'Gemini',
                    cancer: 'Cancer',
                    leo: 'Leo',
                    virgo: 'Virgo',
                    libra: 'Libra',
                    scorpio: 'Scorpio',
                    sagittarius: 'Sagittarius',
                    capricorn: 'Capricorn',
                    aquarius: 'Aquarius',
                    pisces: 'Pisces'
                },
                index: {
                    all: 'Overall',
                    love: 'Love',
                    work: 'Career',
                    money: 'Wealth',
                    health: 'Health'
                },
                luckyColor: 'Lucky color: {v}',
                luckyNumber: 'Lucky number: {v}',
                match: 'Best match: {v}',
                period: {
                    all: 'Overall',
                    work: '💼 Career',
                    money: '💰 Wealth',
                    love: '❤️ Love',
                    health: '🏥 Health'
                },
                failed: 'Failed to load. Please retry.'
            },
            huangli: {
                title: 'Almanac'
            },
            editSubscription: 'Edit subscriptions',
            label: {
                solar: 'Gregorian:',
                lunar: 'Lunar:',
                ganZhi: 'Ganzhi:',
                animal: 'Zodiac:',
                festival: 'Festival:',
                term: 'Solar term:',
                date: 'Date:',
                result: 'Result'
            },
            converter: {
                title: 'Lunar Converter',
                pickDate: 'Gregorian date:'
            },
            holidays: {
                title: 'Holidays of {year}',
                legal: 'Public holidays',
                traditional: 'Traditional',
                solarTerms: 'Solar terms',
                daysOff: '({n} day off) | ({n} days off)',
                termDate: '{mon} {from}–{to}',
                items: {
                    chuXi: { name: "Chinese New Year's Eve", date: 'Lunar 12/30' },
                    chunJie: { name: 'Spring Festival', date: 'Lunar 1/1' },
                    yuanXiao: { name: 'Lantern Festival', date: 'Lunar 1/15' },
                    longTaiTou: { name: 'Dragon Head Raising Day', date: 'Lunar 2/2' },
                    qingMing: { name: 'Qingming Festival', date: 'Qingming solar term' },
                    duanWu: { name: 'Dragon Boat Festival', date: 'Lunar 5/5' },
                    qiXi: { name: 'Qixi Festival', date: 'Lunar 7/7' },
                    zhongYuan: { name: 'Ghost Festival', date: 'Lunar 7/15' },
                    zhongQiu: { name: 'Mid-Autumn Festival', date: 'Lunar 8/15' },
                    chongYang: { name: 'Double Ninth Festival', date: 'Lunar 9/9' },
                    hanYi: { name: 'Winter Clothes Day', date: 'Lunar 10/1' },
                    dongZhi: { name: 'Winter Solstice', date: 'Winter Solstice solar term' },
                    laBa: { name: 'Laba Festival', date: 'Lunar 12/8' }
                }
            },
            calculator: {
                title: 'Date Calculator',
                start: 'Start date:',
                end: 'End date:',
                result: 'Result',
                days: 'In days:',
                weeks: 'In weeks:',
                months: 'In months:',
                years: 'In years:'
            },
            countdown: {
                title: 'Countdown',
                target: 'Target date:',
                eventName: 'Event name:',
                placeholder: 'e.g. My birthday',
                heading: 'Countdown',
                defaultName: 'Target date',
                future: 'day to go | days to go',
                past: 'day ago | days ago'
            },
            perpetual: {
                title: 'Perpetual Calendar',
                details: 'Details'
            },
            lucky: {
                title: 'Auspicious Days',
                heading: "Dos & Don'ts"
            }
        }
    }
};
