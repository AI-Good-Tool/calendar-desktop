<template>
    <div class="calendar-container">
        <!-- Toolbar -->
        <div class="calendar-header">
            <div class="left-controls">
                <a-popover
                    v-model:open="monthPickerVisible"
                    trigger="click"
                    placement="bottomLeft"
                    :overlayClassName="'month-picker-popover'"
                >
                    <template #content>
                        <div class="month-picker-panel">
                            <div class="month-picker-header">
                                <a-button type="text" size="small" @click="changeYear(-1)">
                                    <template #icon><double-left-outlined /></template>
                                </a-button>
                                <span class="current-year">{{ pickerYear }}</span>
                                <a-button type="text" size="small" @click="changeYear(1)">
                                    <template #icon><double-right-outlined /></template>
                                </a-button>
                            </div>
                            <div class="month-grid">
                                <div
                                    v-for="m in 12"
                                    :key="m"
                                    class="month-item"
                                    :class="{
                                        active: pickerYear === currentDate.year() && m - 1 === currentDate.month()
                                    }"
                                    @click="selectMonth(m - 1)"
                                >
                                    {{ monthNames[m - 1] }}
                                </div>
                            </div>
                        </div>
                    </template>
                    <div class="nav-tag year-month-tag">
                        {{ currentYearMonth }}
                    </div>
                </a-popover>

                <a-dropdown trigger="click">
                    <div class="nav-tag holiday-tag">{{ t('calendar.holidaySchedule') }}</div>
                    <template #overlay>
                        <a-menu @click="handleHolidayJump">
                            <a-menu-item v-for="h in holidayList" :key="h.date">
                                {{ translateHolidayName(h.name) }}
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </div>

            <div class="center-controls"></div>

            <div class="right-controls">
                <a-button type="text" class="today-btn" @click="goToday">{{ t('calendar.today') }}</a-button>
                <div class="nav-arrows">
                    <a-button type="text" size="small" @click="prevMonth">
                        <template #icon><LeftOutlined /></template>
                    </a-button>
                    <a-button type="text" size="small" @click="nextMonth">
                        <template #icon><RightOutlined /></template>
                    </a-button>
                </div>

                <a-divider type="vertical" />

                <a-button type="text" class="action-icon">
                    <FilterOutlined />
                </a-button>
                <a-button type="text" class="action-icon">
                    <CalendarOutlined />
                </a-button>
                <a-button type="primary" shape="circle" class="add-btn">
                    <template #icon><PlusOutlined /></template>
                </a-button>
            </div>
        </div>

        <!-- Weekday Headers -->
        <div class="weekday-header">
            <div v-for="(day, index) in weekDays" :key="index" class="weekday-item" :class="{ weekend: index >= 5 }">
                {{ day }}
            </div>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
            <div
                v-for="(date, index) in calendarDays"
                :key="index"
                class="calendar-cell"
                :class="{
                    'other-month': !date.isCurrentMonth,
                    today: date.isToday,
                    selected: isSelected(date)
                }"
                @click="selectDate(date)"
            >
                <div class="date-header">
                    <span class="solar-day">{{ date.day }}</span>
                </div>
                <span v-if="date.isHoliday" class="status-tag holiday-tag">{{ t('calendar.badgeOff') }}</span>
                <span v-else-if="date.isWorkday" class="status-tag workday-tag">{{ t('calendar.badgeWork') }}</span>
                <!-- 副标题只占一行：节日 > 节气 > 农历日，避免格子较矮时多行互相挤压重叠 -->
                <div
                    class="lunar-day"
                    :class="{ festival: date.festival, 'solar-term': !date.festival && date.term }"
                    :title="[date.festival, date.term, date.lunarDayName].filter(Boolean).join(' · ')"
                >
                    {{ date.festival || date.term || date.lunarDayName }}
                </div>

                <!-- 日程标记小圆点 -->
                <div v-if="date.scheduleCount > 0" class="schedule-indicator">
                    <div class="schedule-dot"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import { Lunar } from 'lunar-javascript';
import {
    LeftOutlined,
    RightOutlined,
    FilterOutlined,
    CalendarOutlined,
    PlusOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined
} from '@ant-design/icons-vue';
import scheduleManager from '../utils/scheduleManager';
import settingsManager from '../utils/settingsManager';
import { fetch } from '@tauri-apps/plugin-http';
import { useI18n } from 'vue-i18n';
import { tList, lunarDayText, translateHolidayName } from '../i18n';

const { t } = useI18n();

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'select']);

const currentDate = ref(props.modelValue ? dayjs(props.modelValue) : dayjs()); // 默认为 props 或 今天
const selectedDate = ref(props.modelValue ? dayjs(props.modelValue) : dayjs());
const viewMode = ref('month');
const holidayData = ref({});
const monthSchedules = ref([]);

// 月份选择器状态
const monthPickerVisible = ref(false);
const pickerYear = ref(dayjs().year());
const monthNames = computed(() => tList('common.monthsShort'));

function changeYear(step) {
    pickerYear.value += step;
}

function selectMonth(month) {
    currentDate.value = dayjs().year(pickerYear.value).month(month);
    monthPickerVisible.value = false;
}

// 假期跳转列表
const holidayList = computed(() => {
    // 找出当年的主要节假日（去重并排序）
    const list = [];
    const seen = new Set();
    Object.values(holidayData.value).forEach((h) => {
        if (h.holiday && h.name && !seen.has(h.name)) {
            list.push({ name: h.name, date: h.date });
            seen.add(h.name);
        }
    });
    // 按日期排序
    return list.sort((a, b) => a.date.localeCompare(b.date));
});

function handleHolidayJump({ key }) {
    if (key) {
        currentDate.value = dayjs(key);
        selectedDate.value = dayjs(key);
        // 获取完整的日期对象并选中
        const dObj = createDateObject(dayjs(key), true);
        emit('select', dObj);
    }
}

const weekDays = computed(() => tList('common.weekdaysShort'));

const scheduleCounts = ref({});

// 加载当前显示的月份的日程
async function loadMonthSchedules() {
    const year = currentDate.value.year();
    const month = currentDate.value.month() + 1;
    const schedules = await scheduleManager.getSchedulesByMonth(year, month);

    // 计算统计
    const counts = {};
    schedules.forEach((s) => {
        counts[s.date] = (counts[s.date] || 0) + 1;
    });
    scheduleCounts.value = counts;
}

// 供外部调用以刷新日程
async function refresh() {
    await loadMonthSchedules();
}

// 暴露 refresh 方法
defineExpose({
    refresh
});

// 动态显示当前年月
const currentYearMonth = computed(() => {
    return currentDate.value.format(t('common.fmt.yearMonth'));
});

// 获取假期数据
async function fetchHolidays() {
    try {
        const year = currentDate.value.year();
        const holidayApi = settingsManager.get('holidayApi');
        const response = await fetch(`${holidayApi}/${year}`);
        const data = await response.json();

        if (data.code === 0) {
            // 将数据转换为按全日期 YYYY-MM-DD 索引，因为 API 返回的是按 MM-DD 索引
            const remapped = {};
            if (data.holiday) {
                Object.values(data.holiday).forEach((item) => {
                    if (item.date) {
                        remapped[item.date] = item;
                    }
                });
            }
            holidayData.value = remapped;
        }
    } catch (error) {
        console.error('获取假期数据失败:', error);
    }
}

onMounted(async () => {
    await fetchHolidays();
    await loadMonthSchedules();
});

// 监听日期变化，重新加载日程和假期
watch(currentDate, async (newVal) => {
    pickerYear.value = newVal.year(); // 同步选择器年份
    await fetchHolidays();
    await loadMonthSchedules();
});

const calendarDays = computed(() => {
    const year = currentDate.value.year();
    const month = currentDate.value.month(); // 0-11
    const startOfMonth = currentDate.value.startOf('month');
    const endOfMonth = currentDate.value.endOf('month');

    const startDayOfWeek = startOfMonth.day() === 0 ? 7 : startOfMonth.day(); // 1(Mon) - 7(Sun)

    const days = [];

    // Previous month padding
    const prevMonthEnd = startOfMonth.subtract(1, 'day');
    const paddingBefore = startDayOfWeek - 1;
    for (let i = paddingBefore - 1; i >= 0; i--) {
        const d = startOfMonth.subtract(i + 1, 'day');
        days.push(createDateObject(d, false));
    }

    // Current month
    for (let i = 0; i < endOfMonth.date(); i++) {
        const d = startOfMonth.add(i, 'day');
        days.push(createDateObject(d, true));
    }

    // Next month padding
    const totalCells = 42; // 6 rows * 7
    const remaining = totalCells - days.length;
    for (let i = 0; i < remaining; i++) {
        const d = endOfMonth.add(i + 1, 'day');
        days.push(createDateObject(d, false));
    }

    return days;
});

function createDateObject(dateObj, isCurrentMonth) {
    const lunar = Lunar.fromDate(dateObj.toDate());
    const dateStr = dateObj.format('YYYY-MM-DD');
    const holidayInfo = holidayData.value[dateStr];

    // 从缓存中获取该日期的日程数量
    const scheduleCount = scheduleCounts.value[dateStr] || 0;

    // 优先显示法定节假日，否则显示农历节日或节气
    let festival = null;
    if (holidayInfo && holidayInfo.name) {
        festival = translateHolidayName(holidayInfo.name);
    } else {
        const festivals = lunar.getFestivals();
        festival = festivals.length > 0 ? festivals[0] : null;
    }

    return {
        dateObj: dateObj,
        day: dateObj.date(),
        isCurrentMonth,
        isToday: dateObj.isSame(dayjs(), 'day'),
        lunarDayName: lunarDayText(lunar),
        term: lunar.getJieQi(),
        festival: festival,
        scheduleCount: scheduleCount,
        isHoliday: holidayInfo && holidayInfo.holiday === true,
        isWorkday: holidayInfo && holidayInfo.holiday === false
    };
}

function prevMonth() {
    currentDate.value = currentDate.value.subtract(1, 'month');
}
function nextMonth() {
    currentDate.value = currentDate.value.add(1, 'month');
}
function goToday() {
    currentDate.value = dayjs();
    selectedDate.value = dayjs();
    emit('select', createDateObject(dayjs(), true));
}
function isSelected(date) {
    return selectedDate.value && date.dateObj.isSame(selectedDate.value, 'day');
}
function selectDate(date) {
    selectedDate.value = date.dateObj;
    emit('select', date);
}
</script>

<style scoped>
.calendar-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background: white;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 0 4px;
}

.left-controls {
    display: flex;
    gap: 12px;
    align-items: center;
}

.nav-tag {
    padding: 4px 12px;
    background: #f0f5ff;
    color: #1d39c4;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid transparent;
}

.nav-tag:hover {
    background: #e6f7ff;
    border-color: #91d5ff;
}

.right-controls {
    display: flex;
    align-items: center;
    gap: 4px;
}

.today-btn {
    color: #262626;
    background: #f0f0f0;
    border-radius: 4px;
    padding: 0 16px;
    height: 32px;
}

.nav-arrows {
    display: flex;
    background: #f0f0f0;
    border-radius: 4px;
    padding: 2px;
    margin: 0 8px;
}

.nav-arrows .ant-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-icon {
    font-size: 18px;
    color: #595959;
    padding: 4px;
    height: auto;
}

.add-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    margin-left: 8px;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.35);
}

/* Month Picker Styles */
.month-picker-panel {
    padding: 8px;
    width: 240px;
}

.month-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 8px;
}

.current-year {
    font-size: 16px;
    font-weight: 600;
}

.month-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.month-item {
    text-align: center;
    padding: 12px 0;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
}

.month-item:hover {
    background: #f5f5f5;
    color: #1890ff;
}

.month-item.active {
    background: #1890ff;
    color: white;
}

.weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 8px;
    font-weight: 500;
    color: #666;
}

.weekday-item {
    padding: 8px 0;
}
.weekend {
    color: #ff4d4f;
}

.calendar-grid {
    display: grid;
    /* minmax(0, 1fr)：严格等分，格子长宽不随单元格内容（多行节日文案等）变化 */
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: repeat(6, minmax(0, 1fr));
    flex: 1;
    min-height: 0;
    border-top: 1px solid #f0f0f0;
    border-left: 1px solid #f0f0f0;
}

.calendar-cell {
    border-right: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    padding: 8px;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, box-shadow 0.2s;
    position: relative;
}

.calendar-cell:hover {
    background-color: #f5f7fa;
}

.calendar-cell.selected {
    background-color: #e6f7ff;
    /* 用内阴影画高亮边框，不改变盒模型尺寸，避免选中时格子变形 */
    box-shadow: inset 0 0 0 2px #1890ff;
    z-index: 1;
}

.other-month {
    color: #ccc;
    background-color: #fafafa;
}

.date-header {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.status-tag {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 10px;
    padding: 2px 3px;
    border-radius: 4px;
    line-height: 1.2;
    white-space: nowrap;
    transform: scale(0.9);
    z-index: 5;
    pointer-events: none;
}

.holiday-tag {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
    font-weight: 500;
}

.workday-tag {
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
    font-weight: 500;
}

.lunar-day {
    font-size: 12px;
    color: #888;
    /* 长节日名单行省略，避免换行撑高格子 */
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

.festival {
    color: #ff4d4f;
}

.solar-term {
    color: #1890ff;
}

.today .date-header {
    color: #1890ff;
}

.schedule-indicator {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
}

.schedule-dot {
    width: 6px;
    height: 6px;
    background-color: #1890ff;
    border-radius: 50%;
}
</style>
