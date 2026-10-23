<!--
 * @Author: DaLong Li
 * @Date: 2026-02-06 09:45:00
 * @LastEditTime: 2026-02-06 09:45:00
 * @LastEditors: DaLong Li
 * @Description: 工具页面 - 展示所有日历工具
 * 生命在于运动,代码在于抽动。
-->
<template>
    <div class="tools-page">
        <div class="tools-container">
            <div class="tools-grid">
                <div class="tool-card" @click="openTool('calendar-converter')">
                    <div class="tool-icon" style="background: #ff7875">
                        <calendar-outlined />
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">{{ t('toolsView.converter.name') }}</h3>
                        <p class="tool-desc">{{ t('toolsView.converter.desc') }}</p>
                    </div>
                </div>

                <div class="tool-card" @click="openTool('holiday-list')">
                    <div class="tool-icon" style="background: #ff9c6e">
                        <gift-outlined />
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">{{ t('toolsView.holidays.name') }}</h3>
                        <p class="tool-desc">{{ t('toolsView.holidays.desc') }}</p>
                    </div>
                </div>

                <div class="tool-card" @click="openTool('date-calculator')">
                    <div class="tool-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                        <calculator-outlined />
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">{{ t('toolsView.dateCalc.name') }}</h3>
                        <p class="tool-desc">{{ t('toolsView.dateCalc.desc') }}</p>
                    </div>
                </div>

                <div class="tool-card" @click="openTool('countdown')">
                    <div class="tool-icon" style="background: #40a9ff">
                        <clock-circle-outlined />
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">{{ t('toolsView.countdown.name') }}</h3>
                        <p class="tool-desc">{{ t('toolsView.countdown.desc') }}</p>
                    </div>
                </div>

                <div class="tool-card" @click="openTool('perpetual-calendar')">
                    <div class="tool-icon" style="background: #73d13d">
                        <calendar-two-tone />
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">{{ t('toolsView.perpetual.name') }}</h3>
                        <p class="tool-desc">{{ t('toolsView.perpetual.desc') }}</p>
                    </div>
                </div>

                <div class="tool-card" @click="openTool('lucky-day')">
                    <div class="tool-icon" style="background: #ffd666">
                        <star-outlined />
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">{{ t('toolsView.luckyDay.name') }}</h3>
                        <p class="tool-desc">{{ t('toolsView.luckyDay.desc') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 工具详情弹窗 -->
        <a-modal v-model:open="toolModalVisible" :title="currentToolTitle" width="600px" :footer="null">
            <component :is="currentToolComponent" v-if="currentToolComponent" />
        </a-modal>
    </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
    CalendarOutlined,
    GiftOutlined,
    CalculatorOutlined,
    ClockCircleOutlined,
    CalendarTwoTone,
    StarOutlined
} from '@ant-design/icons-vue';

// Import tool components
import CalendarConverter from '../components/tools/CalendarConverter.vue';
import HolidayList from '../components/tools/HolidayList.vue';
import DateCalculator from '../components/tools/DateCalculator.vue';
import Countdown from '../components/tools/Countdown.vue';
import PerpetualCalendar from '../components/tools/PerpetualCalendar.vue';
import LuckyDay from '../components/tools/LuckyDay.vue';

const router = useRouter();
const { t } = useI18n();
const toolModalVisible = ref(false);
const currentToolTitle = ref('');
const currentToolComponent = shallowRef(null);

const openTool = (toolName) => {
    switch (toolName) {
        case 'calendar-converter':
            currentToolTitle.value = t('toolsView.converter.name');
            currentToolComponent.value = CalendarConverter;
            break;
        case 'holiday-list':
            currentToolTitle.value = t('toolsView.holidays.name');
            currentToolComponent.value = HolidayList;
            break;
        case 'date-calculator':
            currentToolTitle.value = t('toolsView.dateCalc.name');
            currentToolComponent.value = DateCalculator;
            break;
        case 'countdown':
            currentToolTitle.value = t('toolsView.countdown.name');
            currentToolComponent.value = Countdown;
            break;
        case 'perpetual-calendar':
            currentToolTitle.value = t('toolsView.perpetual.name');
            currentToolComponent.value = PerpetualCalendar;
            break;
        case 'lucky-day':
            currentToolTitle.value = t('toolsView.luckyDay.name');
            currentToolComponent.value = LuckyDay;
            break;
        default:
            currentToolComponent.value = null;
    }
    toolModalVisible.value = true;
};
</script>

<style scoped>
.tools-page {
    height: 100%;
    background: white;
    overflow-y: auto;
}

.tools-container {
    padding: 30px 40px;
    max-width: 900px;
    margin: 0 auto;
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.tool-card {
    background: white;
    border-radius: 10px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
}

.tool-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.tool-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    flex-shrink: 0;
}

.tool-info {
    flex: 1;
    min-width: 0;
}

.tool-name {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 3px 0;
}

.tool-desc {
    font-size: 12px;
    color: #999;
    margin: 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

@media (max-width: 1024px) {
    .tools-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .tools-container {
        padding: 20px;
    }

    .tools-grid {
        grid-template-columns: 1fr;
    }
}
</style>
