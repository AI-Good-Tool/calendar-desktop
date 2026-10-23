<template>
    <div class="calendar-converter">
        <a-space direction="vertical" style="width: 100%" :size="16">
            <div>
                <div style="margin-bottom: 8px; font-weight: 500">{{ t('tools.converter.selectSolarDate') }}</div>
                <a-date-picker v-model:value="converterDate" style="width: 100%" />
            </div>
            <a-divider />
            <div v-if="converterDate">
                <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                    {{ t('tools.converter.result') }}
                </div>
                <div class="converter-result">
                    <div class="result-item">
                        <span class="label">{{ t('tools.shared.solar') }}</span>
                        <span class="value">{{ converterDate.format(t('common.fmt.fullDate')) }}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">{{ t('tools.shared.lunar') }}</span>
                        <span class="value">{{ getLunarDate(converterDate) }}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">{{ t('tools.shared.ganZhi') }}</span>
                        <span class="value">{{ getLunarGanZhi(converterDate) }}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">{{ t('tools.shared.zodiac') }}</span>
                        <span class="value">{{
                            t('tools.shared.zodiacValue', { zodiac: getLunarZodiac(converterDate) })
                        }}</span>
                    </div>
                    <div class="result-item" v-if="getLunarFestival(converterDate)">
                        <span class="label">{{ t('tools.shared.festival') }}</span>
                        <span class="value" style="color: #ff4d4f">{{ getLunarFestival(converterDate) }}</span>
                    </div>
                </div>
            </div>
        </a-space>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { Lunar } from 'lunar-javascript';
import { useI18n } from 'vue-i18n';
import { isZh, lunarMonthDayText } from '../../i18n';

const { t } = useI18n();

const converterDate = ref(dayjs());

function getLunarDate(date) {
    const lunar = Lunar.fromDate(date.toDate());
    if (!isZh()) return `${lunarMonthDayText(lunar)}, ${lunar.getYear()}`;
    return `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
}

function getLunarGanZhi(date) {
    const lunar = Lunar.fromDate(date.toDate());
    return t('tools.shared.ganZhiValue', {
        year: lunar.getYearInGanZhi(),
        month: lunar.getMonthInGanZhi(),
        day: lunar.getDayInGanZhi()
    });
}

function getLunarZodiac(date) {
    const lunar = Lunar.fromDate(date.toDate());
    return lunar.getYearShengXiao();
}

function getLunarFestival(date) {
    const lunar = Lunar.fromDate(date.toDate());
    const festivals = lunar.getFestivals();
    return festivals.length > 0 ? festivals.join(isZh() ? '、' : ', ') : null;
}
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
