<template>
    <div class="settings-view-page">
        <div class="settings-header">
            <h2 class="title">{{ t('settings.title') }}</h2>
            <div class="header-ops">
                <a-button type="link" @click="goBack"> <left-outlined /> {{ t('settings.backToCalendar') }} </a-button>
            </div>
        </div>

        <div class="settings-content">
            <a-tabs v-model:active-key="activeTab" type="card">
                <a-tab-pane key="general" :tab="t('settings.tabs.general')">
                    <div class="settings-section">
                        <a-form layout="vertical">
                            <a-form-item :label="t('settings.autoLaunch.label')">
                                <template #extra>{{ t('settings.autoLaunch.extra') }}</template>
                                <div class="setting-item-row">
                                    <span>{{ t('settings.autoLaunch.toggle') }}</span>
                                    <a-switch
                                        v-model:checked="autoLaunch"
                                        :loading="autoLaunchLoading"
                                        @change="handleAutoLaunchToggle"
                                    />
                                </div>
                            </a-form-item>

                            <a-form-item :label="t('settings.timezone.label')">
                                <template #extra>{{ t('settings.timezone.extra') }}</template>
                                <div class="setting-item-row">
                                    <span>
                                        {{ t('settings.timezone.toggle') }}
                                        <span class="timezone-hint">{{ zoneLabel(systemTimeZone) }}</span>
                                    </span>
                                    <a-switch
                                        v-model:checked="settingsForm.followSystemTimeZone"
                                        @change="handleFollowSystemTimeZone"
                                    />
                                </div>
                                <div v-if="!settingsForm.followSystemTimeZone" class="timezone-select-row">
                                    <span class="timezone-select-label">{{ t('settings.timezone.select') }}</span>
                                    <a-select
                                        :value="appTimeZone"
                                        :options="zoneOptions"
                                        :filter-option="filterTimeZone"
                                        show-search
                                        style="flex: 1; min-width: 0"
                                        @change="handleCustomTimeZone"
                                    />
                                </div>
                            </a-form-item>

                            <a-form-item :label="t('settings.tray.label')">
                                <template #extra>{{ t('settings.tray.extra') }}</template>
                                <div class="setting-item-row">
                                    <span>{{ t('settings.tray.toggle') }}</span>
                                    <a-switch v-model:checked="settingsForm.showTrayTime" @change="handleTrayToggle" />
                                </div>
                                <a-alert
                                    v-if="trayIssue"
                                    type="warning"
                                    show-icon
                                    style="margin-top: 12px"
                                    :message="trayIssue.title"
                                >
                                    <template #description>
                                        <div>{{ trayIssue.desc }}</div>
                                        <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap">
                                            <a-button
                                                v-if="trayIssue.repairable"
                                                type="primary"
                                                size="small"
                                                :loading="trayRepairing"
                                                @click="handleTrayRepair"
                                            >
                                                {{ t('settings.tray.repair') }}
                                            </a-button>
                                            <a-button size="small" @click="openMenuBarSettings">{{
                                                t('settings.tray.openSystemSettings')
                                            }}</a-button>
                                            <a-button size="small" @click="checkTrayRegistration">{{
                                                t('settings.tray.recheck')
                                            }}</a-button>
                                        </div>
                                    </template>
                                </a-alert>
                            </a-form-item>

                            <a-form-item :label="t('settings.format.label')">
                                <template #extra>{{ t('settings.format.extra') }}</template>
                                <a-select
                                    v-model:value="settingsForm.trayDisplayFormat"
                                    @change="handleFormatChange"
                                    :placeholder="t('settings.format.placeholder')"
                                    style="width: 100%"
                                >
                                    <a-select-option v-for="p in TRAY_PRESETS" :key="p.id" :value="presetFormat(p)">
                                        {{ t(`settings.format.presets.${p.id}`) }}
                                    </a-select-option>
                                </a-select>
                                <a-input
                                    v-model:value="settingsForm.trayDisplayFormat"
                                    :placeholder="t('settings.format.customPlaceholder')"
                                    style="margin-top: 12px"
                                    @change="handleFormatInputChange"
                                />
                            </a-form-item>

                            <a-form-item :label="t('settings.tray2.label')">
                                <template #extra>{{ t('settings.tray2.extra') }}</template>
                                <div class="setting-item-row">
                                    <span>{{ t('settings.tray2.toggle') }}</span>
                                    <a-switch v-model:checked="settingsForm.showTray2" @change="handleTray2Toggle" />
                                </div>
                                <div v-if="settingsForm.showTray2" class="timezone-select-row">
                                    <span class="timezone-select-label">{{ t('settings.tray2.select') }}</span>
                                    <a-select
                                        :value="settingsForm.tray2TimeZone"
                                        :options="zoneOptions"
                                        :filter-option="filterTimeZone"
                                        show-search
                                        style="flex: 1; min-width: 0"
                                        @change="handleTray2TimeZone"
                                    />
                                </div>
                                <template v-if="settingsForm.showTray2">
                                    <a-select
                                        v-model:value="settingsForm.tray2Format"
                                        @change="handleTray2FormatChange"
                                        :placeholder="t('settings.format.placeholder')"
                                        style="width: 100%; margin-top: 12px"
                                    >
                                        <a-select-option v-for="p in TRAY2_PRESETS" :key="p.id" :value="presetFormat(p)">
                                            {{ t(`settings.format.presets.${p.id}`) }}
                                        </a-select-option>
                                    </a-select>
                                    <a-input
                                        v-model:value="settingsForm.tray2Format"
                                        :placeholder="t('settings.tray2.formatPlaceholder')"
                                        style="margin-top: 12px"
                                        @change="handleTray2FormatInput"
                                    />
                                </template>
                            </a-form-item>
                        </a-form>
                    </div>
                </a-tab-pane>
                <a-tab-pane key="api" :tab="t('settings.tabs.api')">
                    <div class="settings-section">
                        <a-form layout="vertical">
                            <a-form-item :label="t('settings.weather.label')">
                                <template #extra>{{ t('settings.weather.extra') }}</template>
                                <a-select
                                    v-model:value="settingsForm.weatherProvider"
                                    @change="handleWeatherProviderChange"
                                    style="width: 100%"
                                >
                                    <a-select-option v-for="p in weatherProviders" :key="p.id" :value="p.id">
                                        {{ p.needKey ? '🔑 ' : '' }}{{ p.name }}
                                    </a-select-option>
                                </a-select>
                                <template v-if="currentProviderNeedKey">
                                    <a-input
                                        v-model:value="settingsForm.weatherKeys[settingsForm.weatherProvider]"
                                        :placeholder="t('settings.weather.keyPlaceholder')"
                                        style="margin-top: 12px"
                                        @change="handleWeatherKeyChange"
                                    />
                                    <div style="margin-top: 6px; font-size: 12px">
                                    <a :href="currentProviderDoc" target="_blank">{{
                                        t('settings.weather.getKey', { name: currentProviderName })
                                    }}</a>
                                    </div>
                                </template>
                            </a-form-item>

                            <a-divider />

                            <a-form-item :label="t('settings.zodiac.label')">
                                <template #extra>
                                    {{ t('settings.zodiac.extra') }}
                                    <a href="https://xxapi.cn/doc/horoscope" target="_blank">{{ t('settings.zodiac.doc') }}</a>
                                </template>
                                <a-input
                                    v-model:value="settingsForm.zodiacApi"
                                    :placeholder="t('settings.zodiac.apiPlaceholder')"
                                />
                                <a-input
                                    v-model:value="settingsForm.zodiacKey"
                                    placeholder="API Key"
                                    style="margin-top: 12px"
                                />
                            </a-form-item>

                            <a-divider />

                            <a-form-item :label="t('settings.holiday.label')">
                                <template #extra>
                                    {{ t('settings.holiday.extra') }}
                                    <a href="https://timor.tech/api/holiday/" target="_blank">{{ t('settings.holiday.doc') }}</a>
                                </template>
                                <a-input
                                    v-model:value="settingsForm.holidayApi"
                                    :placeholder="t('settings.holiday.apiPlaceholder')"
                                />
                            </a-form-item>

                            <div class="form-actions">
                                <a-button type="primary" size="large" @click="saveSettings">{{
                                    t('settings.actions.save')
                                }}</a-button>
                                <a-button style="margin-left: 12px" @click="resetSettings">{{
                                    t('settings.actions.reset')
                                }}</a-button>
                            </div>
                        </a-form>
                    </div>
                </a-tab-pane>

                <a-tab-pane key="data" :tab="t('settings.tabs.data')">
                    <div class="settings-section data-section">
                        <div class="data-card danger">
                            <div class="card-info">
                                <div class="card-title">{{ t('settings.data.dbTitle') }}</div>
                                <div class="card-desc">{{ t('settings.data.dbDesc') }}</div>
                            </div>
                            <a-button danger @click="clearDatabase">{{ t('settings.data.dbButton') }}</a-button>
                        </div>

                        <a-divider />

                        <div class="data-card">
                            <div class="card-info">
                                <div class="card-title">{{ t('settings.data.cacheTitle') }}</div>
                                <div class="card-desc">{{ t('settings.data.cacheDesc') }}</div>
                            </div>
                            <a-button danger ghost @click="clearCache">{{ t('settings.data.cacheButton') }}</a-button>
                        </div>
                    </div>
                </a-tab-pane>

                <a-tab-pane key="about" :tab="t('settings.tabs.about')">
                    <AboutPanel v-if="activeTab === 'about'" />
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, createVNode, computed, watch } from 'vue';
import AboutPanel from '../components/AboutPanel.vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message, Modal } from 'ant-design-vue';
import { LeftOutlined, ExclamationCircleOutlined, CalendarFilled } from '@ant-design/icons-vue';
import settingsManager from '../utils/settingsManager';
import scheduleManager from '../utils/scheduleManager';
import { enable as enableAutostart, disable as disableAutostart, isEnabled as isAutostartEnabled } from '@tauri-apps/plugin-autostart';
import { invoke } from '@tauri-apps/api/core';
import { WEATHER_PROVIDERS } from '../utils/weatherManager';
import { TRAY_PRESETS, TRAY2_PRESETS, presetFormat, localizeTrayFormat } from '../utils/trayFormats';
import {
    appTimeZone,
    systemTimeZone,
    followSystemTimeZone,
    customTimeZone,
    setFollowSystemTimeZone,
    setCustomTimeZone,
    timeZoneOptions,
    zoneOffsetMinutes,
    formatGmtOffset,
    zoneCityName
} from '../utils/timezone';

const router = useRouter();
const { t } = useI18n();
const route = useRoute();
const activeTab = ref(route.query.tab === 'about' ? 'about' : 'api');
watch(() => route.query.tab, (tab) => { if (tab === 'about') activeTab.value = 'about'; });
watch(activeTab, (tab) => router.replace({ query: { ...route.query, tab } }));

// 天气数据源切换
const weatherProviders = WEATHER_PROVIDERS;
const currentProvider = computed(
    () => weatherProviders.find((p) => p.id === settingsForm.value.weatherProvider) || weatherProviders[0]
);
const currentProviderNeedKey = computed(() => currentProvider.value.needKey);
const currentProviderDoc = computed(() => currentProvider.value.doc);
const currentProviderName = computed(() => currentProvider.value.name);

function handleWeatherProviderChange(value) {
    settingsManager.set('weatherProvider', value);
    const p = weatherProviders.find((x) => x.id === value);
    message.success(t('settings.weather.switched', { name: p ? p.name : value }));
}

function handleWeatherKeyChange() {
    settingsManager.set('weatherKeys', { ...settingsForm.value.weatherKeys });
    message.success(t('settings.weather.keySaved'));
}

// 时区：跟随系统，或使用固定时区（未手动选择时按语言默认：中文上海、英文纽约）
const zoneOptions = computed(() => timeZoneOptions());

function zoneLabel(tz) {
    return `(${formatGmtOffset(zoneOffsetMinutes(tz))}) ${zoneCityName(tz)}`;
}

function filterTimeZone(input, option) {
    const q = input.trim().toLowerCase();
    return option.label.toLowerCase().includes(q) || String(option.value).toLowerCase().includes(q);
}

function handleFollowSystemTimeZone(checked) {
    setFollowSystemTimeZone(checked);
    message.success(
        checked
            ? t('settings.timezone.followOn')
            : t('settings.timezone.followOff', { zone: zoneLabel(appTimeZone.value) })
    );
}

function handleCustomTimeZone(tz) {
    setCustomTimeZone(tz);
    settingsForm.value.customTimeZone = tz;
    message.success(t('settings.timezone.changed', { zone: zoneLabel(tz) }));
}

// 开机自启动（状态直接读取系统，不存 localStorage）
const autoLaunch = ref(false);
const autoLaunchLoading = ref(false);

async function loadAutoLaunchState() {
    try {
        autoLaunch.value = await isAutostartEnabled();
    } catch (e) {
        console.error('读取自启动状态失败:', e);
    }
}

async function handleAutoLaunchToggle(checked) {
    autoLaunchLoading.value = true;
    try {
        if (checked) {
            await enableAutostart();
        } else {
            await disableAutostart();
        }
        message.success(checked ? t('settings.autoLaunch.enabled') : t('settings.autoLaunch.disabled'));
    } catch (e) {
        console.error('设置自启动失败:', e);
        autoLaunch.value = !checked; // 失败回滚
        message.error(t('settings.autoLaunch.failed'));
    } finally {
        autoLaunchLoading.value = false;
    }
}

const settingsForm = ref({
    weatherProvider: 'open-meteo',
    weatherKeys: { openweathermap: '', weatherapi: '', weatherbit: '' },
    zodiacApi: '',
    zodiacKey: '',
    holidayApi: '',
    showTrayTime: true,
    showTray2: false,
    tray2TimeZone: 'America/New_York',
    tray2Format: 'HH:mm:ss',
    followSystemTimeZone: true,
    customTimeZone: '',
    trayDisplayFormat: ''
});

function loadSettings() {
    const all = settingsManager.getAll();
    // 预设格式需换成当前语言版本，下拉才能选中
    all.trayDisplayFormat = localizeTrayFormat(all.trayDisplayFormat);
    settingsForm.value = all;
}

function saveSettings() {
    settingsManager.setAll(settingsForm.value);
    message.success(t('settings.actions.saved'));
}

function handleTrayToggle(checked) {
    settingsManager.set('showTrayTime', checked);
    message.success(checked ? t('settings.tray.enabled') : t('settings.tray.disabled'));
    if (checked) {
        // ControlCenter 需要一点时间完成登记判定
        setTimeout(checkTrayRegistration, 1500);
    } else {
        trayIssue.value = null;
    }
}

// 第二状态栏（菜单2）：第二时区时间
async function handleTray2Toggle(checked) {
    settingsManager.set('showTray2', checked);
    if (checked && isMacOS) {
        // macOS 26 只显示"随应用启动创建"的状态栏项；本次启动没带菜单2 时需重启才能显示
        let displayable = true;
        try {
            displayable = await invoke('tray2_displayable');
        } catch (e) {
            /* 非 macOS 忽略 */
        }
        if (!displayable) {
            Modal.confirm({
                title: t('settings.tray2.restartTitle'),
                content: t('settings.tray2.restartContent'),
                okText: t('settings.tray2.restartNow'),
                cancelText: t('settings.tray2.restartLater'),
                centered: true,
                onOk: async () => {
                    try {
                        await invoke('restart_app');
                    } catch (e) {
                        console.error('重启失败:', e);
                    }
                }
            });
            return;
        }
    }
    message.success(checked ? t('settings.tray2.enabled') : t('settings.tray2.disabled'));
    if (checked) {
        setTimeout(checkTrayRegistration, 1500);
    }
}

function handleTray2TimeZone(tz) {
    settingsForm.value.tray2TimeZone = tz;
    settingsManager.set('tray2TimeZone', tz);
    message.success(t('settings.timezone.changed', { zone: zoneLabel(tz) }));
}

function handleTray2FormatChange(value) {
    settingsManager.set('tray2Format', value);
    message.success(t('settings.format.updated'));
}

function handleTray2FormatInput(e) {
    settingsManager.set('tray2Format', e.target.value);
    message.success(t('settings.format.updated'));
}

// macOS 26（Tahoe）状态栏归属诊断：
// 状态栏项由 ControlCenter 统一托管，若本应用在"系统设置 → 菜单栏"中被关闭，
// 或被归属到了另一个已关闭的应用（从终端/IDE 直接启动应用时会发生），状态栏项会创建成功但永远不显示。
const isMacOS = /Mac OS X|Macintosh/.test(navigator.userAgent);
const trayIssue = ref(null);
const trayRepairing = ref(false);

async function checkTrayRegistration() {
    trayIssue.value = null;
    if (!isMacOS || !settingsForm.value.showTrayTime) return;
    try {
        const reg = await invoke('tray_registration_status');
        if (!reg || !reg.available) return;
        if (reg.blocked_by && reg.blocked_by.length > 0) {
            trayIssue.value = {
                title: t('settings.tray.blockedTitle'),
                desc: t('settings.tray.blockedDesc', {
                    apps: reg.blocked_by.join(t('settings.tray.appSeparator'))
                }),
                repairable: true
            };
        } else if (reg.allowed === false) {
            trayIssue.value = {
                title: t('settings.tray.notAllowedTitle'),
                desc: t('settings.tray.notAllowedDesc'),
                repairable: true
            };
        }
    } catch (e) {
        console.error('检测状态栏登记失败:', e);
    }
}

async function handleTrayRepair() {
    trayRepairing.value = true;
    try {
        const result = await invoke('repair_tray_registration');
        message.success(result);
        setTimeout(checkTrayRegistration, 2000);
    } catch (e) {
        message.error(t('settings.tray.repairFailed', { error: String(e) }));
    } finally {
        trayRepairing.value = false;
    }
}

async function openMenuBarSettings() {
    try {
        await invoke('open_menu_bar_settings');
    } catch (e) {
        message.error(t('settings.tray.openSettingsFailed', { error: String(e) }));
    }
}

function handleFormatChange(value) {
    settingsManager.set('trayDisplayFormat', value);
    message.success(t('settings.format.updated'));
}

function handleFormatInputChange(e) {
    settingsManager.set('trayDisplayFormat', e.target.value);
}

function resetSettings() {
    Modal.confirm({
        title: t('settings.actions.resetTitle'),
        content: t('settings.actions.resetContent'),
        onOk() {
            settingsManager.reset();
            // 同步到时区模块的响应式状态，否则重置后界面仍按旧时区显示
            followSystemTimeZone.value = settingsManager.get('followSystemTimeZone') !== false;
            customTimeZone.value = settingsManager.get('customTimeZone') || '';
            loadSettings();
            message.success(t('settings.actions.resetDone'));
        }
    });
}

function goBack() {
    router.push('/');
}

function clearDatabase() {
    Modal.confirm({
        title: t('settings.data.dbConfirmTitle'),
        icon: createVNode(ExclamationCircleOutlined, { style: 'color: #ff4d4f' }),
        content: t('settings.data.dbConfirmContent'),
        okText: t('settings.data.dbConfirmOk'),
        okType: 'danger',
        onOk: async () => {
            try {
                await scheduleManager.clearAll();
                message.success(t('settings.data.dbCleared'));
            } catch (e) {
                message.error(t('settings.data.dbClearFailed'));
            }
        }
    });
}

function clearCache() {
    Modal.confirm({
        title: t('settings.data.cacheConfirmTitle'),
        icon: createVNode(ExclamationCircleOutlined, { style: 'color: #ff4d4f' }),
        content: t('settings.data.cacheConfirmContent'),
        okText: t('settings.data.cacheConfirmOk'),
        okType: 'danger',
        onOk() {
            localStorage.clear();
            window.location.reload();
        }
    });
}

onMounted(() => {
    loadSettings();
    loadAutoLaunchState();
    checkTrayRegistration();
});
</script>

<style scoped>
.settings-view-page {
    padding: 24px 32px;
    background: white;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-shrink: 0;
}

.settings-header .title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.settings-content {
    flex: 1;
    overflow-y: auto;
}

.settings-section {
    padding: 24px 0;
    max-width: 600px;
}

.form-actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
}

.setting-item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f9f9f9;
    border-radius: 8px;
}

.timezone-select-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
}

.timezone-select-label {
    flex-shrink: 0;
    color: #333;
}

.timezone-hint {
    margin-left: 8px;
    font-size: 12px;
    color: #999;
}

.data-section {
    max-width: 100%;
}

.data-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #fafafa;
    border-radius: 12px;
    border: 1px solid #f0f0f0;
}

.data-card.danger {
    background: #fff1f0;
    border-color: #ffa39e;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
}

.card-desc {
    font-size: 13px;
    color: #666;
    max-width: 600px;
}

.about-section {
    text-align: center;
    margin: 40px auto;
}

.app-name {
    font-size: 24px;
    margin: 16px 0 8px;
    color: #333;
}

.app-version {
    color: #999;
    margin-bottom: 24px;
}

.app-desc {
    color: #666;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
}

:deep(.ant-tabs-nav) {
    margin-bottom: 0;
}
</style>
