<template>
    <div class="home-view-container">
        <div class="calendar-wrapper">
            <CalendarView ref="calendarRef" v-model="currentDate" @select="handleDateSelect" />
        </div>

        <!-- 底部工具栏 -->
        <div class="bottom-tools">
            <div class="tools-left">
                <div class="tool-item" @click="openTool('calendar-converter')">
                    <div class="tool-icon" style="background: #ff7875">
                        <calendar-outlined style="color: white" />
                    </div>
                    <span>{{ t('home.converter') }}</span>
                </div>
                <div class="tool-item" @click="openTool('holiday-list')">
                    <div class="tool-icon" style="background: #ff9c6e">
                        <gift-outlined style="color: white" />
                    </div>
                    <span>{{ t('home.holidays') }}</span>
                </div>
                <div class="tool-item" @click="openTool('date-calculator')">
                    <div class="tool-icon" style="background: #9254de">
                        <calculator-outlined style="color: white" />
                    </div>
                    <span>{{ t('home.dateCalc') }}</span>
                </div>
            </div>
            <div class="tool-item" @click="openAllTools">
                <div class="tool-icon custom-more">...</div>
                <span>{{ t('home.all') }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import CalendarView from '../components/CalendarView.vue';
import { CalendarOutlined, GiftOutlined, CalculatorOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

const currentDate = ref(dayjs());
const calendarRef = ref(null);
const router = useRouter();
const { t } = useI18n();

const emit = defineEmits(['select', 'open-tool']);

function handleDateSelect(date) {
    emit('select', date);
}

function openTool(toolType) {
    emit('open-tool', toolType);
}

function openAllTools() {
    router.push('/tools');
}

function refresh() {
    if (calendarRef.value) {
        calendarRef.value.refresh();
    }
}

defineExpose({ refresh });
</script>

<style scoped>
.home-view-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.calendar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    /* 隐藏滚动条但保留滚动功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
}

/* 隐藏 WebKit 浏览器(Chrome, Safari)的滚动条 */
.calendar-wrapper::-webkit-scrollbar {
    display: none;
}

/* 底部工具 */
.bottom-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 32px;
    background: white;
    border-top: 1px solid #f0f0f0;
    border-radius: 0 0 12px 12px;
}
.tools-left {
    display: flex;
    gap: 24px;
}
.tool-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
}
.tool-item:hover {
    transform: translateY(-2px);
}
.tool-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 26px;
    margin-bottom: 0;
}
.tool-icon :deep(.anticon) {
    font-size: 26px !important;
}
.custom-more {
    background: #f0f0f0;
    color: #999;
}

.tool-item span {
    font-size: 13px;
    color: #666;
    font-weight: 500;
    white-space: nowrap;
}
</style>
