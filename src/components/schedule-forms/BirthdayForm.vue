<template>
    <div class="birthday-form">
        <div class="form-item">
            <div class="form-label">{{ t('schedule.field.name') }}</div>
            <a-input
                v-model:value="localData.title"
                :placeholder="t('schedule.placeholder.birthdayName')"
                @change="emitUpdate"
            />
        </div>
        <div class="form-item">
            <div class="form-label">{{ t('schedule.field.time') }}</div>
            <a-radio-group v-model:value="localData.isLunar" @change="emitUpdate">
                <a-radio :value="false">{{ t('schedule.field.solar') }}</a-radio>
                <a-radio :value="true">{{ t('schedule.field.lunar') }}</a-radio>
            </a-radio-group>
        </div>
        <div class="form-item">
            <a-date-picker
                v-model:value="birthDate"
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
                <a-select-option value="3天前">{{ t('schedule.reminder.day3') }}</a-select-option>
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

const localData = reactive({ title: '', isLunar: false, reminder: '1天前' });
const birthDate = ref(dayjs());

watch(
    () => props.formData,
    (data) => {
        Object.assign(localData, data);
        if (data.date) birthDate.value = dayjs(data.date);
    },
    { immediate: true, deep: true }
);

function handleDateChange() {
    emitUpdate();
}

function emitUpdate() {
    emit('update', { ...localData, date: birthDate.value.format('YYYY-MM-DD'), isAllDay: true });
}
</script>

<style scoped>
.birthday-form {
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
