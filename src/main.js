/*
 * @Author: DaLong Li
 * @Date: 2026-02-05 15:45:33
 * @LastEditTime: 2026-02-09 10:03:35
 * @LastEditors: DaLong Li
 * @Description:
 * 生命在于运动，代码在于抽动。
 */
import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './style.css';
import i18n, { initLocale } from './i18n';
import './utils/timezone';

import router from './router';

const app = createApp(App);
app.use(Antd);
app.use(i18n);
app.use(router);

// 先确定语言（跟随系统 / 应用级语言设置）再挂载，避免首屏闪现另一种语言
initLocale().finally(() => app.mount('#app'));
