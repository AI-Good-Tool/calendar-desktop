import { reactive } from 'vue';

// 独立控制器方便验证下载/安装顺序；资源句柄保持原始对象，不放入 reactive。
export function createUpdateController({ check, relaunch, supported = () => true }) {
    const state = reactive({ status: 'idle', version: '', notes: '', downloaded: 0, total: 0, error: '', checkedAt: null });
    let pending = null;
    let checking = null;
    let installing = null;

    async function checkForUpdates() {
        if (installing) return;
        if (checking) return checking;
        if (!supported()) { state.status = 'unsupported'; return; }
        checking = (async () => {
            state.status = 'checking';
            state.error = '';
            try {
                if (pending) { await pending.close(); pending = null; }
                pending = await check({ timeout: 20000 });
                state.version = pending?.version || '';
                state.notes = pending?.body || '';
                state.checkedAt = new Date();
                state.status = pending ? 'available' : 'latest';
                return Boolean(pending);
            } catch (error) {
                state.error = String(error);
                state.status = 'error';
                return false;
            }
        })();
        try { return await checking; } finally { checking = null; }
    }

    async function installUpdate() {
        if (installing) return installing;
        if (!pending || checking) return;
        const update = pending;
        installing = (async () => {
            state.status = 'downloading';
            state.error = '';
            state.downloaded = 0;
            state.total = 0;
            try {
                await update.download((event) => {
                    if (event.event === 'Started') state.total = event.data.contentLength || 0;
                    if (event.event === 'Progress') state.downloaded += event.data.chunkLength;
                }, { timeout: 120000 });
                state.status = 'installing';
                // Windows 安装器接管进程并重启；macOS 安装结束后由 relaunch 重启。
                await update.install({ restartAfterInstall: true });
                pending = null;
                state.status = 'restarting';
                await relaunch();
            } catch (error) {
                state.error = String(error);
                state.status = 'error';
                // 重新检查以获取全新下载资源，避免重试使用过期/已消费的句柄。
                pending = null;
                await update.close().catch(() => {});
            }
        })();
        try { await installing; } finally { installing = null; }
    }
    return { state, checkForUpdates, installUpdate };
}
