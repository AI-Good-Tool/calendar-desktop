<template>
    <div class="date-calculator">
        <a-space direction="vertical" style="width: 100%" :size="16">
            <div>
                <div style="margin-bottom: 8px; font-weight: 500">{{ t('tools.dateCalc.startDate') }}</div>
                <a-date-picker v-model:value="calcStartDate" style="width: 100%" />
            </div>
            <div>
                <div style="margin-bottom: 8px; font-weight: 500">{{ t('tools.dateCalc.endDate') }}</div>
                <a-date-picker v-model:value="calcEndDate" style="width: 100%" />
            </div>
            <a-divider />
            <div v-if="calcStartDate && calcEndDate">
                <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                    {{ t('tools.dateCalc.result') }}
                </div>
                <div class="converter-result">
                    <div class="result-item">
                        <span class="label">{{ t('tools.dateCalc.daysDiff') }}</span>
                        <span class="value" style="color: #52c41a; font-size: 20px; font-weight: 600">
                            {{ tUnit('day', Math.abs(calcEndDate.diff(calcStartDate, 'day'))) }}
                        </span>
                    </div>
                    <div class="result-item">
                        <span class="label">{{ t('tools.dateCalc.weeksDiff') }}</span>
                        <span class="value">{{
                            tUnit('week', Math.floor(Math.abs(calcEndDate.diff(calcStartDate, 'day')) / 7))
                        }}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">{{ t('tools.dateCalc.monthsDiff') }}</span>
                        <span class="value">{{
                            tUnit('month', Math.abs(calcEndDate.diff(calcStartDate, 'month')))
                        }}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">{{ t('tools.dateCalc.yearsDiff') }}</span>
                        <span class="value">{{ tUnit('year', Math.abs(calcEndDate.diff(calcStartDate, 'year'))) }}</span>
                    </div>
                </div>
            </div>
        </a-space>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { tUnit } from '../../i18n';

const { t } = useI18n();

const calcStartDate = ref(dayjs());
const calcEndDate = ref(dayjs().add(30, 'day'));
</script>

<style scoped>
.converter-result {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
}
.result-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}
.result-item:last-child {
    margin-bottom: 0;
}
.result-item .label {
    min-width: 80px;
    font-weight: 500;
    color: #666;
}
.result-item .value {
    color: #333;
    font-size: 15px;
}
</style>
