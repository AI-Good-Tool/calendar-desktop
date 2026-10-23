import { isTauri } from '@tauri-apps/api/core';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { createUpdateController } from './updateController';

export default createUpdateController({ check, relaunch, supported: isTauri });
