# 应用在线更新

应用启动和每次进入“设置 → 关于”时检查 GitHub Releases 的 latest.json。点击“立即更新”后下载并校验签名，安装成功才重启。macOS 使用 .app.tar.gz，Windows 使用 NSIS 安装器（passive 模式显示安装进度，安装后自动启动）。首次使用更新功能需要手动安装包含 updater 的版本；旧版本没有更新入口，无法自动升级到此版本。

## 首次发布配置

公钥已写入 src-tauri/tauri.conf.json。对应私钥保存在本机仓库外：

`~/.config/calendar-desktop/signing/updater.key`

请备份该私钥；后续版本必须使用同一密钥签名。不要提交私钥到 Git，也不要更换公钥来修复签名错误。

在 GitHub 仓库 vs2pk0/calendar-desktop 的 Settings → Secrets and variables → Actions 中配置：

- `TAURI_SIGNING_PRIVATE_KEY`：私钥文件的完整内容。
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`：本次生成时未设置密码，保持为空。

工作流会为 Apple Silicon、Intel Mac 和 Windows x64 构建，签名并上传更新包与 latest.json。发布前同步增加 package.json、src-tauri/Cargo.toml、src-tauri/tauri.conf.json 的版本号；同版本不会触发升级。

没有签名密钥时，发布构建会失败；尚未发布 latest.json 时，应用显示检查失败，可查看错误详情并重试，不会误报为最新版本。

## 本地验证

- `npm run build`
- `node --test tests/updateController.test.js`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- 运行 Vite 后访问 `/tests/about-preview.html` 可单独预览关于页；浏览器不执行原生更新。

完整升级验收需要两个已签名版本：安装旧版本，发布更高版本及其 latest.json，在 macOS 和 Windows 分别检查、点击更新、确认进度和重启后版本号。还需验证断网、签名不匹配及无写入权限时保持旧版可用。不要以模拟控制器测试代替真实安装器验收。
