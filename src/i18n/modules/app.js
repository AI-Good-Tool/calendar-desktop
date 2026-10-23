// App.vue 外壳：窗口按钮、导航、通知中心、日程详情、退出确认
export default {
    'zh-CN': {
        app: {
            window: {
                close: '关闭',
                minimize: '最小化',
                maximize: '最大化/还原'
            },
            nav: {
                calendar: '日历',
                subscription: '订阅',
                tools: '工具'
            },
            notif: {
                center: '通知中心',
                clear: '清空',
                empty: '暂无新消息',
                allDayTitle: '今日全天事项',
                startTitle: '日程开始提醒',
                allDayContent: '【{title}】今天全天',
                startContent: '【{title}】现在开始了',
                toast: '行程提醒: {title}'
            },
            detail: {
                title: '日程详情',
                time: '时间：',
                location: '地点：',
                note: '备注：'
            },
            types: {
                todo: '待办',
                event: '日程',
                birthday: '生日',
                anniversary: '纪念日',
                countdown: '倒数'
            },
            quit: {
                title: '提示',
                content: '确定要退出云小历吗？',
                ok: '退出'
            }
        }
    },
    'en-US': {
        app: {
            window: {
                close: 'Close',
                minimize: 'Minimize',
                maximize: 'Maximize / Restore'
            },
            nav: {
                calendar: 'Calendar',
                subscription: 'Subscriptions',
                tools: 'Tools'
            },
            notif: {
                center: 'Notifications',
                clear: 'Clear',
                empty: 'No new notifications',
                allDayTitle: 'All-day event today',
                startTitle: 'Event starting',
                allDayContent: '"{title}" is all day today',
                startContent: '"{title}" is starting now',
                toast: 'Reminder: {title}'
            },
            detail: {
                title: 'Event Details',
                time: 'Time:',
                location: 'Location:',
                note: 'Notes:'
            },
            types: {
                todo: 'To-do',
                event: 'Event',
                birthday: 'Birthday',
                anniversary: 'Anniversary',
                countdown: 'Countdown'
            },
            quit: {
                title: 'Notice',
                content: 'Are you sure you want to quit Yun Calendar?',
                ok: 'Quit'
            }
        }
    }
};
