<template>
    <div class="countdown-form">
        <div class="form-item">
            <div class="form-label">{{ t('schedule.field.content') }}</div>
            <a-input
                v-model:value="localData.title"
                :placeholder="t('schedule.placeholder.countdownTitle')"
                @change="emitUpdate"
            />
        </div>
        <div class="form-item">
            <div class="form-label">{{ t('schedule.field.time') }}</div>
            <a-date-picker
                v-model:value="countdownDate"
                format="YYYY-MM-DD"
                style="width: 100%"
                @change="handleDateChange"
            />
        </div>
        <div class="form-item">
            <div class="form-label">{{ t('schedule.field.reminder') }}</div>
            <a-select v-model:value="localData.reminder" style="width: 100%" @change="emitUpdate">
                <a-select-option value="开始时">{{ t('schedule.reminder.atStart') }}</a-select-option>
                <a-select-option value="1天前">{{ t('schedule.reminder.day1') }}</a-select-option>
                <a-select-option value="7天前">{{ t('schedule.reminder.day7') }}</a-select-option>
            </a-select>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({ formData: { type: Object, required: true } });
const emit = defineEmits(['update']);

const localData = reactive({ title: '', reminder: '1天前' });
const countdownDate = ref(dayjs().add(30, 'day'));

watch(
    () => props.formData,
    (data) => {
        Object.assign(localData, data);
        if (data.date) countdownDate.value = dayjs(data.date);
    },
    { immediate: true, deep: true }
);

function handleDateChange() {
    emitUpdate();
}

function emitUpdate() {
    emit('update', { ...localData, date: countdownDate.value.format('YYYY-MM-DD'), isAllDay: true });
}
</script>

<style scoped>
.countdown-form {
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
    font-weight: 500;
    color: #333;
}
</style>
