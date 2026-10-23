// 工具箱（src/components/tools/*）词条
export default {
    'zh-CN': {
        tools: {
            shared: {
                selectDate: '选择日期：',
                solar: '公历：',
                lunar: '农历：',
                ganZhi: '干支：',
                zodiac: '生肖：',
                festival: '节日：',
                solarTerm: '节气：',
                ganZhiValue: '{year}年 {month}月 {day}日',
                zodiacValue: '{zodiac}年'
            },
            converter: {
                selectSolarDate: '选择公历日期：',
                result: '转换结果'
            },
            perpetual: {
                detail: '日期详情'
            },
            countdown: {
                targetDate: '目标日期：',
                eventName: '事件名称：',
                eventPlaceholder: '例如：我的生日',
                title: '倒计时',
                defaultName: '目标日期',
                daysLeft: '天后到达',
                daysPassed: '天前已过'
            },
            dateCalc: {
                startDate: '开始日期：',
                endDate: '结束日期：',
                result: '计算结果',
                daysDiff: '相差天数：',
                weeksDiff: '相差周数：',
                monthsDiff: '相差月数：',
                yearsDiff: '相差年数：'
            },
            luckyDay: {
                title: '宜忌事项',
                yi: '宜',
                ji: '忌',
                noYi: '诸事不宜',
                noJi: '百无禁忌'
            },
            holidayList: {
                tabLegal: '法定节假日',
                tabTraditional: '传统节日',
                tabSolarTerms: '24节气',
                daysOff: '(放假{n}天)',
                termRange: '{m}月{from}-{to}日',
                traditional: {
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
            }
        }
    },
    'en-US': {
        tools: {
            shared: {
                selectDate: 'Date:',
                solar: 'Gregorian:',
                lunar: 'Lunar:',
                ganZhi: 'Ganzhi:',
                zodiac: 'Zodiac:',
                festival: 'Festival:',
                solarTerm: 'Solar term:',
                ganZhiValue: '{year} year, {month} month, {day} day',
                zodiacValue: 'Year of the {zodiac}'
            },
            converter: {
                selectSolarDate: 'Gregorian date:',
                result: 'Result'
            },
            perpetual: {
                detail: 'Date details'
            },
            countdown: {
                targetDate: 'Target date:',
                eventName: 'Event name:',
                eventPlaceholder: 'e.g. My birthday',
                title: 'Countdown',
                defaultName: 'Target date',
                daysLeft: 'day to go | days to go',
                daysPassed: 'day ago | days ago'
            },
            dateCalc: {
                startDate: 'Start date:',
                endDate: 'End date:',
                result: 'Result',
                daysDiff: 'Days:',
                weeksDiff: 'Weeks:',
                monthsDiff: 'Months:',
                yearsDiff: 'Years:'
            },
            luckyDay: {
                title: 'Auspicious & Inauspicious',
                yi: 'Do',
                ji: "Don't",
                noYi: 'Nothing advised',
                noJi: 'No taboos'
            },
            holidayList: {
                tabLegal: 'Public holidays',
                tabTraditional: 'Traditional',
                tabSolarTerms: 'Solar terms',
                daysOff: '({n} day off) | ({n} days off)',
                termRange: '{month} {from}–{to}',
                traditional: {
                    chuXi: { name: "Chinese New Year's Eve", date: 'Lunar 12/30' },
                    chunJie: { name: 'Spring Festival', date: 'Lunar 1/1' },
                    yuanXiao: { name: 'Lantern Festival', date: 'Lunar 1/15' },
                    longTaiTou: { name: 'Dragon Head Raising', date: 'Lunar 2/2' },
                    qingMing: { name: 'Qingming Festival', date: 'Qingming solar term' },
                    duanWu: { name: 'Dragon Boat Festival', date: 'Lunar 5/5' },
                    qiXi: { name: 'Qixi Festival', date: 'Lunar 7/7' },
                    zhongYuan: { name: 'Ghost Festival', date: 'Lunar 7/15' },
                    zhongQiu: { name: 'Mid-Autumn Festival', date: 'Lunar 8/15' },
                    chongYang: { name: 'Double Ninth Festival', date: 'Lunar 9/9' },
                    hanYi: { name: 'Winter Clothing Day', date: 'Lunar 10/1' },
                    dongZhi: { name: 'Winter Solstice', date: 'Winter Solstice solar term' },
                    laBa: { name: 'Laba Festival', date: 'Lunar 12/8' }
                }
            }
        }
    }
};
