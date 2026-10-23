<template>
    <div class="holiday-list">
        <div style="max-height: 500px; overflow-y: auto">
            <a-tabs v-model:active-key="holidayTab">
                <a-tab-pane key="legal" :tab="t('tools.holidayList.tabLegal')">
                    <a-list :data-source="legalHolidays" size="small">
                        <template #renderItem="{ item }">
                            <a-list-item>
                                <a-list-item-meta>
                                    <template #title>
                                        <span style="color: #ff4d4f; font-weight: 500">{{
                                            translateHolidayName(item.name)
                                        }}</span>
                                    </template>
                                    <template #description>
                                        {{ item.date }}
                                        <span v-if="item.days" style="margin-left: 8px; color: #52c41a">
                                            {{ t('tools.holidayList.daysOff', { n: item.days }, item.days) }}
                                        </span>
                                    </template>
                                </a-list-item-meta>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-tab-pane>
                <a-tab-pane key="traditional" :tab="t('tools.holidayList.tabTraditional')">
                    <a-list :data-source="traditionalHolidays" size="small">
                        <template #renderItem="{ item }">
                            <a-list-item>
                                <a-list-item-meta>
                                    <template #title>{{ item.name }}</template>
                                    <template #description>{{ item.lunarDate }}</template>
                                </a-list-item-meta>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-tab-pane>
                <a-tab-pane key="solar" :tab="t('tools.holidayList.tabSolarTerms')">
                    <a-list :data-source="solarTerms" :grid="{ gutter: 16, column: 2 }" size="small">
                        <template #renderItem="{ item }">
                            <a-card size="small">
                                <div style="text-align: center">
                                    <div style="font-weight: 500; margin-bottom: 4px">{{ item.name }}</div>
                                    <div style="color: #888; font-size: 12px">{{ item.date }}</div>
                                </div>
                            </a-card>
                        </template>
                    </a-list>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { I18n as LunarI18n } from 'lunar-javascript';
import { useI18n } from 'vue-i18n';
import { currentLocale, translateHolidayName, tList } from '../../i18n';

const { t } = useI18n();

const holidayTab = ref('legal');

// name 为假期接口同款中文名，显示时经 translateHolidayName 翻译
const legalHolidays = ref([
    { name: '元旦', date: '2026-01-01', days: 3 },
    { name: '春节', date: '2026-02-17~02-23', days: 7 },
    { name: '清明节', date: '2026-04-05~04-07', days: 3 },
    { name: '劳动节', date: '2026-05-01~05-03', days: 3 },
    { name: '端午节', date: '2026-06-25~06-27', days: 3 },
    { name: '中秋节', date: '2026-10-06~10-08', days: 3 },
    { name: '国庆节', date: '2026-10-01~10-07', days: 7 }
]);

const TRADITIONAL_KEYS = [
    'chuXi',
    'chunJie',
    'yuanXiao',
    'longTaiTou',
    'qingMing',
    'duanWu',
    'qiXi',
    'zhongYuan',
    'zhongQiu',
    'chongYang',
    'hanYi',
    'dongZhi',
    'laBa'
];

const traditionalHolidays = computed(() =>
    TRADITIONAL_KEYS.map((key) => ({
        name: t(`tools.holidayList.traditional.${key}.name`),
        lunarDate: t(`tools.holidayList.traditional.${key}.date`)
    }))
);

// key 对应 lunar-javascript I18n 的 jq.* 词条；日期为公历大致范围
const SOLAR_TERMS = [
    { key: 'liChun', month: 2, from: 3, to: 5 },
    { key: 'yuShui', month: 2, from: 18, to: 20 },
    { key: 'jingZhe', month: 3, from: 5, to: 7 },
    { key: 'chunFen', month: 3, from: 20, to: 22 },
    { key: 'qingMing', month: 4, from: 4, to: 6 },
    { key: 'guYu', month: 4, from: 19, to: 21 },
    { key: 'liXia', month: 5, from: 5, to: 7 },
    { key: 'xiaoMan', month: 5, from: 20, to: 22 },
    { key: 'mangZhong', month: 6, from: 5, to: 7 },
    { key: 'xiaZhi', month: 6, from: 21, to: 22 },
    { key: 'xiaoShu', month: 7, from: 6, to: 8 },
    { key: 'daShu', month: 7, from: 22, to: 24 },
    { key: 'liQiu', month: 8, from: 7, to: 9 },
    { key: 'chuShu', month: 8, from: 22, to: 24 },
    { key: 'baiLu', month: 9, from: 7, to: 9 },
    { key: 'qiuFen', month: 9, from: 22, to: 24 },
    { key: 'hanLu', month: 10, from: 8, to: 9 },
    { key: 'shuangJiang', month: 10, from: 23, to: 24 },
    { key: 'liDong', month: 11, from: 7, to: 8 },
    { key: 'xiaoXue', month: 11, from: 22, to: 23 },
    { key: 'daXue', month: 12, from: 6, to: 8 },
    { key: 'dongZhi', month: 12, from: 21, to: 23 },
    { key: 'xiaoHan', month: 1, from: 5, to: 7 },
    { key: 'daHan', month: 1, from: 20, to: 21 }
];

const solarTerms = computed(() => {
    // 依赖 currentLocale，语言切换后重新取 lunar 词条
    currentLocale.value;
    const monthNames = tList('common.monthsShort');
    return SOLAR_TERMS.map((term) => ({
        name: LunarI18n.getMessage(`jq.${term.key}`),
        date: t('tools.holidayList.termRange', {
            m: term.month,
            month: monthNames[term.month - 1],
            from: term.from,
            to: term.to
        })
    }));
});
</script>
