<template>
    <div class="lucky-day">
        <a-space direction="vertical" style="width: 100%" :size="16">
            <div>
                <div style="margin-bottom: 8px; font-weight: 500">{{ t('tools.shared.selectDate') }}</div>
                <a-date-picker v-model:value="luckyDate" style="width: 100%" />
            </div>
            <a-divider />
            <div v-if="luckyDate">
                <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                    {{ t('tools.luckyDay.title') }}
                </div>
                <div class="converter-result">
                    <div style="margin-bottom: 16px">
                        <div
                            style="
                                font-weight: 600;
                                color: #52c41a;
                                margin-bottom: 8px;
                                display: flex;
                                align-items: center;
                            "
                        >
                            <span
                                style="
                                    display: inline-block;
                                    width: 4px;
                                    height: 16px;
                                    background: #52c41a;
                                    margin-right: 8px;
                                "
                            ></span>
                            {{ t('tools.luckyDay.yi') }}
                        </div>
                        <div style="color: #333; line-height: 1.8; padding-left: 12px">
                            {{ getLuckyYi(luckyDate) }}
                        </div>
                    </div>
                    <div>
                        <div
                            style="
                                font-weight: 600;
                                color: #ff4d4f;
                                margin-bottom: 8px;
                                display: flex;
                                align-items: center;
                            "
                        >
                            <span
                                style="
                                    display: inline-block;
                                    width: 4px;
                                    height: 16px;
                                    background: #ff4d4f;
                                    margin-right: 8px;
                                "
                            ></span>
                            {{ t('tools.luckyDay.ji') }}
                        </div>
                        <div style="color: #333; line-height: 1.8; padding-left: 12px">
                            {{ getLuckyJi(luckyDate) }}
                        </div>
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
import { isZh } from '../../i18n';

const { t } = useI18n();

const luckyDate = ref(dayjs());

function getLuckyYi(date) {
    const lunar = Lunar.fromDate(date.toDate());
    const yi = lunar.getDayYi();
    return yi.length > 0 ? yi.join(isZh() ? ' ' : ', ') : t('tools.luckyDay.noYi');
}

function getLuckyJi(date) {
    const lunar = Lunar.fromDate(date.toDate());
    const ji = lunar.getDayJi();
    return ji.length > 0 ? ji.join(isZh() ? ' ' : ', ') : t('tools.luckyDay.noJi');
}
</script>

<style scoped>
.converter-result {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
}
</style>
