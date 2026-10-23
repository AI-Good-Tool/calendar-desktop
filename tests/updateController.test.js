import test from 'node:test';
import assert from 'node:assert/strict';
import { createUpdateController } from '../src/utils/updateController.js';

const make = (overrides = {}) => createUpdateController({ check: async () => null, relaunch: async () => {}, ...overrides });
test('no update is reported as latest; network errors remain errors', async () => {
    const latest = make(); await latest.checkForUpdates(); assert.equal(latest.state.status, 'latest');
    const failed = make({ check: async () => { throw Error('offline'); } });
    await failed.checkForUpdates(); assert.equal(failed.state.status, 'error'); assert.match(failed.state.error, /offline/);
});
test('deduplicates checks and closes the old update before rechecking', async () => {
    let calls = 0, closed = 0, resolve;
    const app = make({ check: () => { calls++; return new Promise(r => { resolve = r; }); } });
    const one = app.checkForUpdates(); const two = app.checkForUpdates();
    resolve({ version: '2.0.0', close: async () => { closed++; } }); await Promise.all([one, two]);
    assert.equal(calls, 1); const three = app.checkForUpdates(); await Promise.resolve(); resolve(null); await three;
    assert.equal(closed, 1);
});
test('downloads with progress, installs once and only then restarts', async () => {
    const order = []; let finish;
    const app = make({ check: async () => ({ version: '2.0.0', close: async () => {},
        download: async (onEvent) => { order.push('download'); onEvent({ event: 'Started', data: { contentLength: 20 } }); onEvent({ event: 'Progress', data: { chunkLength: 20 } }); await new Promise(r => { finish = r; }); },
        install: async (options) => { assert.equal(options.restartAfterInstall, true); order.push('install'); }
    }), relaunch: async () => order.push('restart') });
    await app.checkForUpdates(); const one = app.installUpdate(); const two = app.installUpdate();
    assert.equal(app.state.downloaded, 20); assert.equal(app.state.total, 20); finish(); await Promise.all([one, two]);
    assert.deepEqual(order, ['download', 'install', 'restart']);
});
test('download/signature or installation failures never restart; check can retry', async () => {
    for (const stage of ['download', 'install']) {
        let restarts = 0, closed = 0;
        const app = make({ check: async () => ({ version: '2', close: async () => closed++,
            download: async () => { if (stage === 'download') throw Error('signature rejected'); },
            install: async () => { if (stage === 'install') throw Error('permission denied'); }
        }), relaunch: async () => restarts++ });
        await app.checkForUpdates(); await app.installUpdate();
        assert.equal(restarts, 0); assert.equal(closed, 1); assert.equal(app.state.status, 'error');
        await app.checkForUpdates(); assert.equal(app.state.status, 'available');
    }
});
test('browser preview does not invoke native update commands', async () => {
    const app = make({ supported: () => false, check: () => { throw Error('must not run'); } });
    await app.checkForUpdates(); assert.equal(app.state.status, 'unsupported');
});
