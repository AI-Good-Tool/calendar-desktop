// 日程弹窗（ScheduleModal）与各类型表单（schedule-forms/*）词条
export default {
    'zh-CN': {
        schedule: {
            addTitle: '添加日程',
            editTitle: '修改日程',
            calendarSelect: '日历选择：',
            myCalendar: '我的日历',
            calendarManage: '日历管理',
            saveFailed: '保存日程失败：{msg}',
            types: {
                todo: '待办',
                event: '日程',
                birthday: '生日',
                anniversary: '纪念日',
                countdown: '倒数日'
            },
            field: {
                title: '标题',
                name: '姓名',
                content: '内容',
                time: '时间',
                allDay: '全天',
                solar: '公历',
                lunar: '农历',
                start: '开始',
                end: '结束',
                reminder: '提醒',
                timezone: '时区',
                repeat: '重复',
                locationOptional: '位置信息（可选）',
                noteOptional: '请添加备注（可选）'
            },
            placeholder: {
                eventTitle: '请输入日程标题',
                todoTitle: '请输入待办标题',
                birthdayName: '请输入寿星名字',
                anniversaryTitle: '请输入纪念日标题',
                countdownTitle: '请输入倒数日内容',
                location: '请输入位置信息',
                note: '请添加备注',
                searchTimezone: '搜索时区'
            },
            // 提醒选项的显示文本（选项值本身是写入数据库的中文，不翻译）
            reminder: {
                none: '不提醒',
                atStart: '开始时',
                min5: '5分钟前',
                min15: '15分钟前',
                min30: '30分钟前',
                hour1: '1小时前',
                day1: '1天前',
                day3: '3天前',
                day7: '7天前'
            },
            repeat: {
                none: '一次性日程',
                daily: '每天',
                weekly: '每周',
                monthly: '每月',
                yearly: '每年'
            },
            // 旧数据里的 "GMT+8:00" 时区值
            legacyBeijing: '(GMT+8) 北京'
        }
    },
    'en-US': {
        schedule: {
            addTitle: 'New Event',
            editTitle: 'Edit Event',
            calendarSelect: 'Calendar:',
            myCalendar: 'My Calendar',
            calendarManage: 'Manage calendars',
            saveFailed: 'Failed to save: {msg}',
            types: {
                todo: 'To-do',
                event: 'Event',
                birthday: 'Birthday',
                anniversary: 'Anniversary',
                countdown: 'Countdown'
            },
            field: {
                title: 'Title',
                name: 'Name',
                content: 'Title',
                time: 'Date',
                allDay: 'All day',
                solar: 'Gregorian',
                lunar: 'Lunar',
                start: 'Starts',
                end: 'Ends',
                reminder: 'Reminder',
                timezone: 'Time zone',
                repeat: 'Repeat',
                locationOptional: 'Location (optional)',
                noteOptional: 'Notes (optional)'
            },
            placeholder: {
                eventTitle: 'Event title',
                todoTitle: 'To-do title',
                birthdayName: "Person's name",
                anniversaryTitle: 'Anniversary title',
                countdownTitle: 'What are you counting down to?',
                location: 'Add location',
                note: 'Add notes',
                searchTimezone: 'Search time zones'
            },
            reminder: {
                none: 'None',
                atStart: 'At time of event',
                min5: '5 minutes before',
                min15: '15 minutes before',
                min30: '30 minutes before',
                hour1: '1 hour before',
                day1: '1 day before',
                day3: '3 days before',
                day7: '1 week before'
            },
            repeat: {
                none: 'Never',
                daily: 'Every day',
                weekly: 'Every week',
                monthly: 'Every month',
                yearly: 'Every year'
            },
            legacyBeijing: '(GMT+8) Beijing'
        }
    }
};
