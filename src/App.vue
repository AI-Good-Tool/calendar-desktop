<template>
    <a-config-provider :locale="antdLocale">
        <div class="app-layout">
            <!-- Header -->
            <header class="app-header" data-tauri-drag-region>
                <div class="header-left">
                    <div class="window-controls">
                        <span class="dot red" @click="closeWindow" :title="t('app.window.close')">
                            <close-outlined class="dot-icon" />
                        </span>
                        <span class="dot yellow" @click="minimizeWindow" :title="t('app.window.minimize')">
                            <minus-outlined class="dot-icon" />
                        </span>
                        <span class="dot green" @click="toggleMaximize" :title="t('app.window.maximize')">
                            <border-outlined class="dot-icon" />
                        </span>
                    </div>
                    <div class="logo">
                        <img src="/logo.png" alt="logo" class="logo-img" />
                        <span class="logo-text">{{ t('common.appName') }}</span>
                    </div>
                    <div class="nav-tabs">
                        <div class="nav-item" :class="{ active: activeTab === 'calendar' }" @click="goToCalendar">
                            <check-square-outlined style="margin-right: 4px" /> {{ t('app.nav.calendar') }}
                        </div>
                        <div
                            class="nav-item"
                            :class="{ active: activeTab === 'subscription' }"
                            @click="goToSubscription"
                        >
                            <star-outlined style="margin-right: 4px" /> {{ t('app.nav.subscription') }}
                        </div>
                        <div class="nav-item" :class="{ active: activeTab === 'tools' }" @click="openTools">
                            <tool-outlined style="margin-right: 4px" /> {{ t('app.nav.tools') }}
                        </div>
                    </div>
                </div>
                <div class="header-right">
                    <search-outlined class="header-icon" />
                    <a-popover placement="bottomRight" trigger="click" :overlayStyle="{ paddingTop: '10px' }">
                        <template #content>
                            <div class="notification-popover">
                                <div class="notif-header">
                                    <span>{{ t('app.notif.center') }}</span>
                                    <a v-if="notifications.length > 0" @click="clearAllNotifs" style="font-size: 12px"
                                        >{{ t('app.notif.clear') }}</a
                                    >
                                </div>
                                <div v-if="notifications.length === 0" class="notif-empty">
                                    <bell-outlined style="font-size: 24px; color: #bfbfbf; margin-bottom: 8px" />
                                    <div>{{ t('app.notif.empty') }}</div>
                                </div>
                                <div v-else class="notif-list">
                                    <div
                                        v-for="notif in notifications"
                                        :key="notif.id"
                                        class="notif-item"
                                        :class="{ unread: !notif.read }"
                                        @click="handleNotifClick(notif)"
                                    >
                                        <div class="notif-title">
                                            <span class="dot" v-if="!notif.read"></span>
                                            {{ notif.title }}
                                            <span class="notif-time">{{ notif.time }}</span>
                                        </div>
                                        <div class="notif-content">{{ notif.content }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <a-badge :count="unreadCount" :overflow-count="99" :offset="[-2, 2]">
                            <bell-outlined class="header-icon bell-icon" />
                        </a-badge>
                    </a-popover>
                    <user-outlined class="header-icon user-avatar" @click="showSettings" />
                </div>
            </header>

            <!-- Content -->
            <main class="app-content">
                <div
                    class="main-view-area"
                    :class="{
                        'full-width':
                            route.path === '/tools' || route.path === '/settings' || route.path === '/subscription'
                    }"
                >
                    <router-view v-slot="{ Component }">
                        <component
                            :is="Component"
                            ref="viewRef"
                            @select="handleDateSelect"
                            @open-tool="handleOpenTool"
                        />
                    </router-view>
                </div>
                <div
                    v-if="route.path !== '/tools' && route.path !== '/settings' && route.path !== '/subscription'"
                    class="side-panel-area"
                >
                    <RightPanel
                        ref="sidePanelRef"
                        :selectedDate="selectedDate"
                        @refresh-calendar="refreshCalendar"
                        @edit-subscription="onEditSubscription"
                    />
                </div>
            </main>

            <!-- 通知详情对话框 -->
            <a-modal v-model:open="notifDetailVisible" :title="t('app.detail.title')" :footer="null" centered>
                <div v-if="selectedNotif" class="notif-detail-view">
                    <div class="detail-header">
                        <span class="detail-type-tag">{{
                            selectedNotif.schedule ? getTypeName(selectedNotif.schedule.type) : t('app.types.event')
                        }}</span>
                        <h3 class="detail-title">{{ selectedNotif.fullTitle }}</h3>
                    </div>
                    <div class="detail-body">
                        <div class="detail-row">
                            <clock-circle-outlined />
                            <span class="label">{{ t('app.detail.time') }}</span>
                            <span class="value"
                                >{{ selectedNotif.schedule?.date }}
                                {{
                                    selectedNotif.schedule?.isAllDay ? t('common.allDay') : selectedNotif.schedule?.time
                                }}</span
                            >
                        </div>
                        <div v-if="selectedNotif.location" class="detail-row">
                            <environment-outlined />
                            <span class="label">{{ t('app.detail.location') }}</span>
                            <span class="value">{{ selectedNotif.location }}</span>
                        </div>
                        <div v-if="selectedNotif.note" class="detail-row note-row">
                            <file-text-outlined />
                            <span class="label">{{ t('app.detail.note') }}</span>
                            <div class="value note-content">{{ selectedNotif.note }}</div>
                        </div>
                    </div>
                </div>
            </a-modal>
        </div>
    </a-config-provider>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import updater from './utils/updater';
import dayjs from 'dayjs';
import scheduleManager from './utils/scheduleManager';
import settingsManager from './utils/settingsManager';
import { message, Modal } from 'ant-design-vue';
import {
    CalendarFilled,
    CheckSquareOutlined,
    StarOutlined,
    ToolOutlined,
    SearchOutlined,
    BellOutlined,
    UserOutlined,
    CloseOutlined,
    MinusOutlined,
    BorderOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons-vue';
import { createVNode } from 'vue';
import RightPanel from './components/RightPanel.vue';
import weatherManager from './utils/weatherManager';
import { antdLocale } from './i18n';
import { onTimeZoneChange, appTimeZone, followSystemTimeZone, zoneCityName } from './utils/timezone';
import { localizeTrayFormat, localizeTray2Format, DEFAULT_TRAY_FORMAT, DEFAULT_TRAY2_FORMAT } from './utils/trayFormats';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// 计算当前激活的标签
const activeTab = computed(() => {
    if (route.path === '/subscription') return 'subscription';
    if (route.path === '/tools') return 'tools';
    return 'calendar';
});

const selectedDate = ref(null);
const viewRef = ref(null);
const sidePanelRef = ref(null);
const lastCheckedDate = ref(dayjs().format('YYYY-MM-DD'));

// 通知系统
const notifications = ref([]);
const notifiedIds = new Set();
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);
const notifDetailVisible = ref(false);
const selectedNotif = ref(null);

function showSettings() {
    router.push('/settings');
}

// 导航方法
function goToCalendar() {
    router.push('/');
}

function goToSubscription() {
    router.push('/subscription');
}

function onEditSubscription() {
    router.push('/subscription');
}

// 处理工具栏点击
function handleOpenTool(toolType) {
    if (sidePanelRef.value) {
        const toolMethodMap = {
            'calendar-converter': 'showCalendarConverter',
            'holiday-list': 'showHolidayList',
            'date-calculator': 'showDateCalculator'
        };

        const methodName = toolMethodMap[toolType];
        if (methodName && typeof sidePanelRef.value[methodName] === 'function') {
            sidePanelRef.value[methodName]();
        }
    }
}

// 检查日程提醒
async function checkSchedules() {
    const now = dayjs();
    const dateStr = now.format('YYYY-MM-DD');
    const timeStr = now.format('HH:mm');

    // 检查日期是否切换
    if (dateStr !== lastCheckedDate.value) {
        lastCheckedDate.value = dateStr;
        refreshCalendar();
        // 如果在首页，尝试让首页视图也知道日期变了（主要是今天高亮）
        if (viewRef.value && typeof viewRef.value.goToday === 'function') {
            viewRef.value.goToday();
        }
    }

    try {
        const todaySchedules = await scheduleManager.getSchedulesByDate(dateStr);
        for (const schedule of todaySchedules) {
            // 生成一个基于日期和ID的唯一提醒标识
            const notifyKey = `${schedule.id}_${dateStr}`;

            // 如果是全天日程，且今天还没提醒过
            if (schedule.isAllDay) {
                if (!notifiedIds.has(notifyKey)) {
                    addNotification(schedule, t('app.notif.allDayTitle'), now.format('HH:mm'));
                    notifiedIds.add(notifyKey);
                }
                continue;
            }

            // 如果是普通日程，时间匹配且今天还没提醒过
            if (schedule.time === timeStr && !notifiedIds.has(notifyKey)) {
                addNotification(schedule, t('app.notif.startTitle'), timeStr);
                notifiedIds.add(notifyKey);

                // 顶部弹窗轻提示
                message.info({
                    content: t('app.notif.toast', { title: schedule.title }),
                    duration: 5
                });
            }
        }
    } catch (e) {
        console.error('检查日程失败:', e);
    }
}

function addNotification(schedule, title, time) {
    notifications.value.unshift({
        id: Date.now() + Math.random(),
        scheduleId: schedule.id,
        title: title,
        content: t(schedule.isAllDay ? 'app.notif.allDayContent' : 'app.notif.startContent', {
            title: schedule.title
        }),
        time: time,
        read: false,
        fullTitle: schedule.title,
        location: schedule.location,
        note: schedule.note,
        schedule: schedule
    });
}

function handleNotifClick(notif) {
    notif.read = true;
    selectedNotif.value = notif;
    notifDetailVisible.value = true;
}

function getTypeName(type) {
    const known = ['todo', 'event', 'birthday', 'anniversary', 'countdown'];
    return t(`app.types.${known.includes(type) ? type : 'event'}`);
}

function clearAllNotifs() {
    notifications.value = [];
    notifiedIds.clear();
}

let checkTimer = null;
let trayTimer = null;
let lastTrayTemplate = null;
let lastTray2Key = null;

// 第二状态栏（菜单2）：独立开关 + 时区 + 格式，只显示时间不含天气
async function syncTray2() {
    const show = !!settingsManager.get('showTray2');
    const tz = settingsManager.get('tray2TimeZone') || 'America/New_York';
    const format = localizeTray2Format(settingsManager.get('tray2Format') || DEFAULT_TRAY2_FORMAT);
    // dayjs 时间 token 转 {TOKEN} 占位符，交给 Rust 端每秒渲染；城市前缀便于区分两个时钟
    const body = format.replace(TRAY_TOKEN_REGEX, (t, literal) => (literal !== undefined ? literal : `{${t}}`));
    const template = show ? `${zoneCityName(tz)} ${body}` : '';
    const key = show ? `${tz}|${template}` : '';
    if (key === lastTray2Key) return;
    try {
        await invoke('sync_tray2_config', { show, template, timeZone: show ? tz : null });
        lastTray2Key = key;
    } catch (e) {
        // 忽略非 macOS 平台的错误
    }
}

// dayjs 格式 token → 占位符（长 token 必须排在短 token 前面）
// 真正的按秒计时在 Rust 原生后台线程执行：macOS 窗口隐藏后 WebView 会被系统挂起，
// 前端 setInterval 会停止，导致状态栏时间/日期不走，因此这里只负责同步模板。
// [..] 内为字面文本（城市/天气等），不做 token 替换且去掉括号
const TRAY_TOKEN_REGEX = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|dddd|ddd|MM|DD|HH|hh|mm|ss|M|D|H|h|m|s|A|a/g;

async function updateTrayTitle() {
    // 菜单2 与主状态栏开关互相独立，先同步它
    syncTray2();
    const showTray = settingsManager.get('showTrayTime');
    const format = localizeTrayFormat(settingsManager.get('trayDisplayFormat') || DEFAULT_TRAY_FORMAT);

    if (!showTray) {
        if (lastTrayTemplate !== '') {
            try {
                await invoke('sync_tray_config', { show: false, template: '', timeZone: null });
                lastTrayTemplate = '';
            } catch (e) {
                /* 忽略 */
            }
        }
        return;
    }

    const weather = weatherManager.getToday();
    const weatherCityName = weatherManager.getCityDisplayName(localStorage.getItem('weather_city_name') || '北京');

    let titleFormat = format;
    if (weather) {
        titleFormat = titleFormat
            .replace('{city}', `[${weatherCityName}]`)
            .replace('{temp}', `[${weather.temp_day || ''}]`)
            .replace('{weather}', `[${weather.weather || ''}]`);
    } else {
        titleFormat = titleFormat
            .replace('{city}', '')
            .replace('{temp}', '')
            .replace('{weather}', '')
            .replace('°C', '')
            .trim();
        titleFormat = titleFormat.replace(/-\s*$/, '').replace(/^\s*-/, '').trim();
    }

    // 把 dayjs 时间 token 转成 {TOKEN} 占位符，交给 Rust 端每秒渲染
    const template = titleFormat.replace(TRAY_TOKEN_REGEX, (t, literal) => (literal !== undefined ? literal : `{${t}}`));

    // 跟随系统时由 Rust 使用系统本地时区（可感知系统时区切换）；否则按应用时区渲染
    const timeZone = followSystemTimeZone.value ? null : appTimeZone.value;
    const syncKey = `${timeZone || ''}|${template}`;

    try {
        // 只有模板或时区变化（设置/天气更新）时才同步，时间走动由 Rust 端负责
        if (syncKey !== lastTrayTemplate) {
            await invoke('sync_tray_config', { show: true, template, timeZone });
            lastTrayTemplate = syncKey;
        }
    } catch (e) {
        // 忽略非 macOS 平台的错误
    }
}

async function refreshWeather() {
    const city = localStorage.getItem('weather_city_name') || '北京';
    await weatherManager.fetchWeather(city);
    updateTrayTitle();
}

let weatherTimer = null;
let offTimeZoneChange = null;
let unlistenTrayAction = null;

// macOS 状态栏右键菜单动作
async function handleTrayAction(action) {
    if (action === 'settings') {
        router.push('/settings');
    } else if (action === 'add-schedule') {
        if (route.path !== '/') {
            router.push('/');
        }
        // 等 RightPanel 挂载/可见后打开新建日程弹窗
        setTimeout(() => {
            if (sidePanelRef.value && sidePanelRef.value.showScheduleModal) {
                sidePanelRef.value.showScheduleModal();
            }
        }, 100);
    } else if (action === 'about') {
        router.push({ path: '/settings', query: { tab: 'about' } });
    }
}

onMounted(async () => {
    // 自动检查仅获取元数据，下载和安装由用户点击触发。
    updater.checkForUpdates().then((available) => {
        if (available) message.info({ content: t('about.status.available', { version: updater.state.version }), duration: 8 });
    });
    // 状态栏右键菜单事件
    unlistenTrayAction = await listen('tray-action', (e) => handleTrayAction(e.payload));

    // 应用时区变化（系统时区切换，或设置里切换时区）：立即重新判断"今天"、刷新日历、提醒和状态栏
    offTimeZoneChange = onTimeZoneChange(() => {
        updateTrayTitle();
        checkSchedules();
        refreshCalendar();
    });

    // 立即检查一次
    checkSchedules();
    // 每分钟检查一次 (30s 检查一次防止跳过分钟)
    checkTimer = setInterval(checkSchedules, 30000);

    // 状态栏时间更新
    updateTrayTitle();
    // 提高到 500ms 刷新一次，确保秒级更新平滑（防止因为 1000ms 漂移导致跳秒）
    trayTimer = setInterval(updateTrayTitle, 500);

    // 定时刷新天气数据 (每 30 分钟)
    refreshWeather();
    weatherTimer = setInterval(refreshWeather, 30 * 60 * 1000);
});

onUnmounted(() => {
    if (checkTimer) clearInterval(checkTimer);
    if (trayTimer) clearInterval(trayTimer);
    if (weatherTimer) clearInterval(weatherTimer);
    if (offTimeZoneChange) offTimeZoneChange();
    if (unlistenTrayAction) unlistenTrayAction();
});

function handleDateSelect(date) {
    selectedDate.value = date;
}

function refreshCalendar() {
    if (viewRef.value && viewRef.value.refresh) {
        viewRef.value.refresh();
    }
}

function openTools() {
    router.push('/tools');
}

// 窗口控制函数
const appWindow = getCurrentWindow();

// 是否 macOS 平台
const isMacOS = /Mac OS X|Macintosh/.test(navigator.userAgent);

async function closeWindow() {
    // macOS：红点 × 隐藏窗口到系统状态栏（Accessory 模式，Dock 中彻底隐藏），
    // 点击状态栏图标或 Dock 图标（Reopen）即可恢复显示
    if (isMacOS) {
        try {
            await invoke('hide_window_to_tray');
        } catch (e) {
            console.error('隐藏窗口失败:', e);
        }
        return;
    }
    Modal.confirm({
        title: t('app.quit.title'),
        icon: createVNode(ExclamationCircleOutlined),
        content: t('app.quit.content'),
        okText: t('app.quit.ok'),
        cancelText: t('common.cancel'),
        centered: true,
        onOk: async () => {
            try {
                await appWindow.close();
            } catch (e) {
                console.error('关闭窗口失败:', e);
            }
        }
    });
}

async function minimizeWindow() {
    // macOS：黄点 - 标准最小化，窗口缩到 Dock 右侧（废纸篓旁），点击即可恢复
    try {
        await appWindow.minimize();
    } catch (e) {
        console.error('最小化窗口失败:', e);
    }
}

async function toggleMaximize() {
    try {
        const isMaximized = await appWindow.isMaximized();
        if (isMaximized) {
            await appWindow.unmaximize();
        } else {
            await appWindow.maximize();
        }
    } catch (e) {
        console.error('最大化窗口失败:', e);
    }
}
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f7fa;
    /* 配合窗口 transparent 实现四角圆角 */
    border-radius: 12px;
    overflow: hidden;
}

.app-header {
    height: 50px;
    background-color: #5b7cfa;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    color: white;
    -webkit-app-region: drag;
}

.header-left {
    display: flex;
    align-items: center;
}

.window-controls {
    display: flex;
    gap: 8px;
    margin-right: 24px;
    -webkit-app-region: no-drag;
}
.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.2s;
}
.dot:hover {
    filter: brightness(1.1);
}
.dot-icon {
    font-size: 8px;
    color: rgba(0, 0, 0, 0.6);
    opacity: 0;
    transition: opacity 0.2s;
}
.dot:hover .dot-icon {
    opacity: 1;
}
.red {
    background-color: #ff5f56;
}
.yellow {
    background-color: #ffbd2e;
}
.green {
    background-color: #27c93f;
}

.logo {
    margin-right: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    -webkit-app-region: no-drag;
}
.logo-img {
    height: 28px;
    width: 28px;
    object-fit: contain;
    border-radius: 6px;
}
.logo-text {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 1px;
}

.nav-tabs {
    display: flex;
    gap: 24px;
    -webkit-app-region: no-drag;
}
.nav-item {
    cursor: pointer;
    opacity: 0.8;
    font-size: 14px;
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
}
.nav-item:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
}
.nav-item.active {
    opacity: 1;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.2);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    -webkit-app-region: no-drag;
}
.header-icon {
    font-size: 18px;
    cursor: pointer;
    opacity: 0.9;
    color: white; /* 确保图标默认也是白色 */
}
.bell-icon {
    color: white !important;
    opacity: 1;
}
.user-avatar {
    background: rgba(255, 255, 255, 0.3);
    padding: 6px;
    border-radius: 50%;
    transition: background 0.2s;
}
.user-avatar:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* 设置面板样式 */
.settings-view {
    padding: 10px 0;
}
.data-manage-section {
    padding: 10px 0;
}
.data-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 8px;
}
.data-label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}
.data-desc {
    font-size: 12px;
    color: #8c8c8c;
}

/* 通知中心样式 */
.notification-popover {
    width: 300px;
}
.notif-header {
    padding: 8px 4px 12px 4px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.notif-empty {
    padding: 40px 0;
    text-align: center;
    color: #999;
}
.notif-list {
    max-height: 400px;
    overflow-y: auto;
}
.notif-item {
    padding: 12px 8px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: background 0.2s;
}
.notif-item:hover {
    background: #f9f9f9;
}
.notif-item.unread {
    background: #fffbe6;
}
.notif-title {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.notif-title .dot {
    width: 6px;
    height: 6px;
    background: #ff4d4f;
    border-radius: 50%;
}
.notif-time {
    margin-left: auto;
    font-size: 12px;
    color: #bfbfbf;
}
.notif-content {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
}

/* 详情弹窗样式 */
.notif-detail-view {
    padding: 10px 0;
}
.detail-header {
    margin-bottom: 20px;
}
.detail-type-tag {
    background: #e6f7ff;
    color: #1890ff;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    display: inline-block;
}
.detail-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #333;
}
.detail-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.detail-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: #666;
    font-size: 14px;
}
.detail-row .anticon {
    margin-top: 3px;
    color: #8c8c8c;
}
.detail-row .label {
    font-weight: 500;
    min-width: 50px;
}
.detail-row .value {
    color: #333;
    flex: 1;
}
.note-row {
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px dashed #f0f0f0;
}
.note-content {
    background: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
    white-space: pre-wrap;
    font-size: 13px;
    color: #555;
    width: 100%;
}

.app-content {
    flex: 1;
    display: flex;
    padding: 0;
    overflow: hidden;
}

.main-view-area {
    flex: 7;
    /* flex 子项默认 min-width:auto，右侧面板内容一长就会把左侧挤窄，导致日历格子宽度随右侧内容变化 */
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: transparent;
}

.main-view-area.full-width {
    flex: 1;
}

.side-panel-area {
    flex: 3;
    /* 严格按 7:3 分配宽度，内容不可撑开面板 */
    min-width: 0;
    padding: 16px;
    padding-left: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}
</style>
