<template>
    <section class="about-panel">
        <div class="about-hero">
            <div class="about-logo"><img src="/logo.png" :alt="t('common.appName')" /></div>
            <p class="about-eyebrow">{{ t('about.tagline') }}</p>
            <h1>{{ t('common.appName') }}</h1>
            <div class="about-badge"><span>v{{ version }}</span><button @click="open(repo)"><GithubOutlined /> GitHub</button></div>
            <p class="about-description">{{ t('settings.about.desc') }}</p>
        </div>
        <div class="about-links">
            <button v-for="link in links" :key="link.key" class="about-card" @click="open(link.url)">
                <span class="card-icon" :class="link.key"><component :is="link.icon" /></span>
                <span><strong>{{ t(`about.${link.key}`) }}</strong><small>{{ t(`about.${link.key}Desc`) }}</small></span>
                <ExportOutlined class="link-arrow" />
            </button>
        </div>
        <div class="update-card" role="status" aria-live="polite">
            <div class="update-heading"><span class="card-icon update"><SyncOutlined :spin="busy" /></span>
                <div><strong>{{ t('about.updates') }}</strong><p>{{ statusText }}</p></div>
                <a-button v-if="state.status === 'available'" type="primary" @click="installUpdate">{{ t('about.install') }}</a-button>
                <a-button v-else :loading="busy" :disabled="busy" @click="checkForUpdates">{{ t('about.check') }}</a-button>
            </div>
            <div v-if="state.status === 'downloading'" class="update-progress">
                <a-progress :percent="percent" :show-info="state.total > 0" :status="state.total ? 'normal' : 'active'" />
                <small>{{ size(state.downloaded) }}<template v-if="state.total"> / {{ size(state.total) }}</template></small>
            </div>
            <p class="update-hint">{{ t('about.updateHint') }}</p>
            <p v-if="state.checkedAt" class="update-time">{{ t('about.checkedAt') }} {{ state.checkedAt.toLocaleTimeString() }}</p>
            <details v-if="state.notes" class="release-notes"><summary>{{ t('about.notes') }}</summary><pre>{{ state.notes }}</pre></details>
            <details v-if="state.error" class="update-error"><summary>{{ t('about.errorDetails') }}</summary><pre>{{ state.error }}</pre></details>
        </div>
        <p v-if="linkError" class="update-error">{{ linkError }}</p>
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isTauri } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { GithubOutlined, UserOutlined, CodeOutlined, MessageOutlined, SyncOutlined, ExportOutlined } from '@ant-design/icons-vue';
import config from '../../package.json';
import updater from '../utils/updater';

const { t } = useI18n();
const { state, checkForUpdates, installUpdate } = updater;
const version = ref(config.version);
const linkError = ref('');
const repo = 'https://github.com/vs2pk0/calendar-desktop';
const links = [
    { key: 'author', url: 'https://github.com/vs2pk0', icon: UserOutlined },
    { key: 'repository', url: repo, icon: CodeOutlined },
    { key: 'feedback', url: `${repo}/issues`, icon: MessageOutlined },
    { key: 'releases', url: `${repo}/releases`, icon: GithubOutlined }
];
const busy = computed(() => ['checking', 'downloading', 'installing', 'restarting'].includes(state.status));
const percent = computed(() => state.total ? Math.min(100, Math.floor(state.downloaded / state.total * 100)) : 0);
const statusText = computed(() => t(`about.status.${state.status}`, { version: state.version }));
const size = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
async function open(url) {
    linkError.value = '';
    try { if (isTauri()) await openUrl(url); else window.open(url, '_blank', 'noopener,noreferrer'); }
    catch (error) { linkError.value = String(error); }
}
onMounted(async () => {
    if (isTauri()) version.value = await getVersion().catch(() => config.version);
    checkForUpdates();
});
</script>

<style scoped>
.about-panel { padding: 36px 24px; border-radius: 20px; background: radial-gradient(ellipse at 80% 100%, #eaf8f5 0, transparent 55%), #f5f8ff; color: #172033; }
.about-hero { text-align: center; max-width: 650px; margin: 0 auto 32px; }
.about-logo { display: grid; place-items: center; width: 92px; height: 92px; margin: auto; border: 1px solid #e6ebf3; border-radius: 28px; background: #fff; box-shadow: 0 12px 32px #3968ba12; }
.about-logo img { width: 68px; height: 68px; object-fit: contain; }
.about-eyebrow { color: #496dff; font-size: 13px; font-weight: 600; margin: 16px 0 6px; }
h1 { font-size: 32px; line-height: 1.3; margin: 0 0 16px; font-weight: 750; letter-spacing: -1px; }
.about-badge { display: inline-flex; align-items: center; padding: 5px; background: #ffffffc9; border: 1px solid #e4eaf4; border-radius: 30px; }
.about-badge > span { padding: 5px 18px; background: white; border: 1px solid #dce5ff; border-radius: 24px; font-weight: 600; }
.about-badge button { border: 0; background: transparent; color: #526077; padding: 5px 16px; cursor: pointer; }
.about-description { color: #77879f; margin: 20px 0 0; line-height: 1.8; }
.about-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.about-card, .update-card { background: #ffffffd9; border: 1px solid #dfe6f1; border-radius: 13px; box-shadow: 0 10px 25px #293c5e06; }
.about-card { display: flex; align-items: center; gap: 14px; padding: 22px 18px; text-align: left; cursor: pointer; color: inherit; font: inherit; transition: border-color .2s, transform .2s; }
.about-card:hover { transform: translateY(-2px); border-color: #a8baff; }
.about-card:focus-visible, .about-badge button:focus-visible { outline: 3px solid #9bb1ff; outline-offset: 3px; }
.card-icon { display: grid; flex-shrink: 0; place-items: center; width: 46px; height: 46px; border-radius: 13px; font-size: 23px; background: #eaf0fa; color: #455773; }
.author { background: #e3edff; color: #315de4; }.feedback { background: #dff9f3; color: #188a7c; }.update { background: #f0eaff; color: #8a4aef; }
strong { display: block; font-size: 16px; font-weight: 650; }small, .about-card small { display: block; font-size: 12px; color: #7d8aa0; margin-top: 5px; line-height: 1.6; }
.link-arrow { margin-left: auto; color: #a2aec1; }
.update-card { margin-top: 14px; padding: 22px 18px; }.update-heading { display: flex; align-items: center; gap: 14px; }.update-heading > div { flex: 1; }.update-heading p { margin: 5px 0 0; color: #66758c; font-size: 13px; }
.update-hint, .update-time { font-size: 12px; color: #8794a9; margin: 14px 0 0; }.update-time { margin-top: 5px; }.update-progress { margin-top: 14px; }
.release-notes, .update-error { margin-top: 16px; font-size: 13px; }.update-error { color: #b34a46; }pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; line-height: 1.7; }
@media (max-width: 700px) { .about-panel { padding: 24px 16px; }.about-links { grid-template-columns: 1fr; }.update-heading { flex-wrap: wrap; } }
</style>
