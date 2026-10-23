// 通用词条。注意 vue-i18n 消息语法：{ } @ $ | 是特殊字符，字面量需写成 {'{'} {'}'} {'@'} {'$'} {'|'}
export default {
    'zh-CN': {
        common: {
            appName: '云小历',
            ok: '确定',
            cancel: '取消',
            confirm: '确认',
            save: '保存',
            delete: '删除',
            edit: '编辑',
            add: '添加',
            create: '创建',
            close: '关闭',
            reset: '重置',
            refresh: '刷新',
            back: '返回',
            search: '搜索',
            loading: '加载中...',
            noData: '暂无数据',
            success: '操作成功',
            failed: '操作失败',
            saved: '已保存',
            all: '全部',
            more: '更多',
            today: '今天',
            tomorrow: '明天',
            yesterday: '昨天',
            allDay: '全天',
            // 周一开头
            weekdaysShort: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            // 按 dayjs().day() 索引（0 = 周日）
            weekdaysBySunday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            weekdaysFullBySunday: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            // dayjs 格式串
            fmt: {
                yearMonth: 'YYYY年M月',
                monthDay: 'M月D日',
                monthDayWeek: 'M月D日 ddd',
                fullDate: 'YYYY年M月D日',
                fullDateWeek: 'YYYY年M月D日 dddd',
                time: 'HH:mm',
                timeSec: 'HH:mm:ss'
            },
            unit: {
                day: '{n} 天',
                hour: '{n} 小时',
                minute: '{n} 分钟',
                year: '{n} 年',
                month: '{n} 个月',
                week: '{n} 周'
            }
        }
    },
    'en-US': {
        common: {
            appName: 'Yun Calendar',
            ok: 'OK',
            cancel: 'Cancel',
            confirm: 'Confirm',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            create: 'Create',
            close: 'Close',
            reset: 'Reset',
            refresh: 'Refresh',
            back: 'Back',
            search: 'Search',
            loading: 'Loading...',
            noData: 'No data',
            success: 'Done',
            failed: 'Failed',
            saved: 'Saved',
            all: 'All',
            more: 'More',
            today: 'Today',
            tomorrow: 'Tomorrow',
            yesterday: 'Yesterday',
            allDay: 'All day',
            weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            weekdaysBySunday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            weekdaysFullBySunday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            fmt: {
                yearMonth: 'MMMM YYYY',
                monthDay: 'MMM D',
                monthDayWeek: 'ddd, MMM D',
                fullDate: 'MMM D, YYYY',
                fullDateWeek: 'dddd, MMM D, YYYY',
                time: 'HH:mm',
                timeSec: 'HH:mm:ss'
            },
            unit: {
                day: '{n} day | {n} days',
                hour: '{n} hour | {n} hours',
                minute: '{n} minute | {n} minutes',
                year: '{n} year | {n} years',
                month: '{n} month | {n} months',
                week: '{n} week | {n} weeks'
            }
        }
    }
};
