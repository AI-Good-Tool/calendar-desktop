<template>
    <div class="event-form">
        <!-- 标题 -->
        <div class="form-item">
            <div class="form-label">
                <check-square-outlined />
                <span>{{ t('schedule.field.title') }}</span>
            </div>
            <a-input
                v-model:value="localData.title"
                :placeholder="t('schedule.placeholder.eventTitle')"
                @change="emitUpdate"
            />
        </div>

        <!-- 全天开关 -->
        <div class="form-item">
            <div class="form-label">
                <clock-circle-outlined />
                <span>{{ t('schedule.field.allDay') }}</span>
            </div>
            <a-switch v-model:checked="localData.isAllDay" @change="emitUpdate" />
        </div>

        <!-- 公历/农历 -->
        <div class="form-item">
            <a-radio-group v-model:value="localData.isLunar" @change="emitUpdate">
                <a-radio :value="false">{{ t('schedule.field.solar') }}</a-radio>
                <a-radio :value="true">{{ t('schedule.field.lunar') }}</a-radio>
            </a-radio-group>
        </div>

        <!-- 开始时间 -->
        <div class="form-item">
            <div class="form-label">{{ t('schedule.field.start') }}</div>
            <a-space>
                <a-date-picker
                    v-model:value="startDate"
                    format="YYYY-MM-DD"
                    style="width: 200px"
                    @change="handleStartDateChange"
                />
                <a-time-picker
                    v-if="!localData.isAllDay"
                    v-model:value="startTime"
                    format="HH:mm"
                    style="width: 120px"
                    @change="handleStartTimeChange"
                />
            </a-space>
        </div>

        <!-- 结束时间 -->
        <div class="form-item">
            <div class="form-label">{{ t('schedule.field.end') }}</div>
            <a-space>
                <a-date-picker
                    v-model:value="endDate"
                    format="YYYY-MM-DD"
                    style="width: 200px"
                    @change="handleEndDateChange"
                />
                <a-time-picker
                    v-if="!localData.isAllDay"
                    v-model:value="endTime"
                    format="HH:mm"
                    style="width: 120px"
                    @change="handleEndTimeChange"
                />
            </a-space>
        </div>

        <!-- 提醒 -->
        <div class="form-item">
            <div class="form-label">
                <bell-outlined />
                <span>{{ t('schedule.field.reminder') }}</span>
            </div>
            <a-select v-model:value="localData.reminder" style="width: 100%" @change="emitUpdate">
                <a-select-option value="none">{{ t('schedule.reminder.none') }}</a-select-option>
                <a-select-option value="开始时">{{ t('schedule.reminder.atStart') }}</a-select-option>
                <a-select-option value="5分钟前">{{ t('schedule.reminder.min5') }}</a-select-option>
                <a-select-option value="15分钟前">{{ t('schedule.reminder.min15') }}</a-select-option>
                <a-select-option value="30分钟前">{{ t('schedule.reminder.min30') }}</a-select-option>
                <a-select-option value="1小时前">{{ t('schedule.reminder.hour1') }}</a-select-option>
                <a-select-option value="1天前">{{ t('schedule.reminder.day1') }}</a-select-option>
            </a-select>
        </div>

        <!-- 时区 -->
        <div class="form-item">
            <div class="form-label">
                <global-outlined />
                <span>{{ t('schedule.field.timezone') }}</span>
            </div>
            <a-select
                v-model:value="localData.timezone"
                :options="timezoneOptions"
                :filter-option="filterTimezone"
                :placeholder="t('schedule.placeholder.searchTimezone')"
                show-search
                style="width: 100%"
                @change="emitUpdate"
            />
        </div>

        <!-- 重复 -->
        <div class="form-item">
            <div class="form-label">
                <sync-outlined />
                <span>{{ t('schedule.field.repeat') }}</span>
            </div>
            <a-select v-model:value="localData.repeat" style="width: 100%" @change="emitUpdate">
                <a-select-option value="none">{{ t('schedule.repeat.none') }}</a-select-option>
                <a-select-option value="daily">{{ t('schedule.repeat.daily') }}</a-select-option>
                <a-select-option value="weekly">{{ t('schedule.repeat.weekly') }}</a-select-option>
                <a-select-option value="monthly">{{ t('schedule.repeat.monthly') }}</a-select-option>
                <a-select-option value="yearly">{{ t('schedule.repeat.yearly') }}</a-select-option>
            </a-select>
        </div>

        <!-- 位置 -->
        <div class="form-item">
            <div class="form-label">
                <environment-outlined />
                <span>{{ t('schedule.field.locationOptional') }}</span>
            </div>
            <a-input
                v-model:value="localData.location"
                :placeholder="t('schedule.placeholder.location')"
                @change="emitUpdate"
            />
        </div>

        <!-- 备注 -->
        <div class="form-item">
            <div class="form-label">
                <file-text-outlined />
                <span>{{ t('schedule.field.noteOptional') }}</span>
            </div>
            <a-textarea
                v-model:value="localData.note"
                :rows="3"
                :placeholder="t('schedule.placeholder.note')"
                @change="emitUpdate"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import dayjs from 'dayjs';
import {
    CheckSquareOutlined,
    ClockCircleOutlined,
    BellOutlined,
    GlobalOutlined,
    SyncOutlined,
    EnvironmentOutlined,
    FileTextOutlined
} from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { appTimeZone, timeZoneOptions } from '../../utils/timezone';

const { t } = useI18n();

// 旧版本写死的时区值，不是合法 IANA 名
const LEGACY_BEIJING_TZ = 'GMT+8:00';

const props = defineProps({
    formData: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

const localData = reactive({
    title: '',
    isAllDay: false,
    isLunar: false,
    reminder: '开始时',
    timezone: appTimeZone.value,
    repeat: 'none',
    location: '',
    note: ''
});

const timezoneOptions = computed(() =>
    timeZoneOptions([localData.timezone])
        .map((opt) =>
            opt.value === LEGACY_BEIJING_TZ ? { ...opt, label: t('schedule.legacyBeijing'), offset: 480 } : opt
        )
        .sort((a, b) => a.offset - b.offset)
);

function filterTimezone(input, option) {
    const keyword = input.trim().toLowerCase();
    return `${option.label} ${option.value}`.toLowerCase().includes(keyword);
}

// 日期时间
const startDate = ref(dayjs());
const startTime = ref(dayjs().hour(18).minute(0));
const endDate = ref(dayjs());
const endTime = ref(dayjs().hour(19).minute(0));

// 监听 props 变化
watch(
    () => props.formData,
    (data) => {
        Object.assign(localData, data);
        if (!localData.timezone) {
            localData.timezone = appTimeZone.value;
        }
        if (data.date) {
            startDate.value = dayjs(data.date);
        }
        if (data.time) {
            startTime.value = dayjs(data.time, 'HH:mm');
        }
        if (data.endDate) {
            endDate.value = dayjs(data.endDate);
        }
        if (data.endTime) {
            endTime.value = dayjs(data.endTime, 'HH:mm');
        }
    },
    { immediate: true, deep: true }
);

// 处理日期时间变化
function handleStartDateChange() {
    emitUpdate();
}

function handleStartTimeChange() {
    emitUpdate();
}

function handleEndDateChange() {
    emitUpdate();
}

function handleEndTimeChange() {
    emitUpdate();
}

// 发送更新
function emitUpdate() {
    emit('update', {
        ...localData,
        date: startDate.value.format('YYYY-MM-DD'),
        time: startTime.value.format('HH:mm'),
        endDate: endDate.value.format('YYYY-MM-DD'),
        endTime: endTime.value.format('HH:mm')
    });
}
</script>

<style scoped>
.event-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    color: #333;
}

.form-label .anticon {
    color: #666;
}
</style>
