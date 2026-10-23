// 首页底部工具栏、工具页、订阅页
export default {
    'zh-CN': {
        home: {
            converter: '公农历转换',
            holidays: '节日大全',
            dateCalc: '日期计算',
            all: '全部'
        },
        toolsView: {
            converter: { name: '公农历转换', desc: '公历与农历互相转换' },
            holidays: { name: '节日大全', desc: '查询一年的所有节日' },
            dateCalc: { name: '日期计算', desc: '计算日期间隔，推算几天之后的日期' },
            countdown: { name: '倒数日', desc: '距离重要日子还有多久' },
            perpetual: { name: '万年历', desc: '查看任意年份的日历' },
            luckyDay: { name: '吉日查询', desc: '查询黄道吉日' }
        },
        subscription: {
            title: '全部订阅',
            backToCalendar: '返回日历',
            manage: '订阅管理',
            subscribe: '订阅',
            subscribed: '已订阅'
        }
    },
    'en-US': {
        home: {
            converter: 'Lunar Converter',
            holidays: 'Holidays',
            dateCalc: 'Date Calculator',
            all: 'All'
        },
        toolsView: {
            converter: { name: 'Lunar Converter', desc: 'Convert between Gregorian and lunar dates' },
            holidays: { name: 'Holidays', desc: 'Browse all holidays of a year' },
            dateCalc: { name: 'Date Calculator', desc: 'Count days between dates or find a date N days away' },
            countdown: { name: 'Countdown', desc: 'How long until the days that matter' },
            perpetual: { name: 'Perpetual Calendar', desc: 'View the calendar of any year' },
            luckyDay: { name: 'Auspicious Days', desc: 'Find auspicious days in the Chinese almanac' }
        },
        subscription: {
            title: 'All Subscriptions',
            backToCalendar: 'Back to Calendar',
            manage: 'Manage',
            subscribe: 'Subscribe',
            subscribed: 'Subscribed'
        }
    }
};
