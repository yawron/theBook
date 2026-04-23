# YAWRON Space 使用与云端部署指南

这个项目采用经典的2000年代初代Web社交平台质感设计，安静、专注、克制。采用基于 React + Vite 架构，支持浏览器本地离线存储与 GitHub Gist 极客云端同步，完全无需任何后端数据库服务器。

## 📝 如何发布和管理日记？

目前系统已全面采用**纯可视化在线发帖**，日记发布后默认会安全、极速地保存在你当前设备的浏览器本地缓存（LocalStorage）中。

- **撰写文章**：在主页顶部的 `Update Status` 区域，输入标题、标签和正文（全面支持 Markdown / HTML）。
- **无缝预览**：点击输入框上方的 `Write` 和 `Preview` 标签可随意切换原稿与实时排版效果。
- **时间追踪**：系统会自动记录精确到几点几分几秒的发布瞬间，左侧的主题日历也会自动响应进行蓝框高亮。

---

## ☁️ 开启极客云端同步 (GitHub Gist API)

由于默认的离线模式一旦清理浏览器缓存数据就会丢失，且无法跨设备（如：手机与电脑之间）同步。为此，系统内置了优雅的 **GitHub Gist 云端暗盒引擎**。一旦开启，您的日记将被打包成私密数据同步至您自己的 GitHub 云端！

### 第一步：获取你的 GitHub Token
1. 登录你的 Github 账号，访问右上角头像：`Settings` -> 最下方的 `Developer settings` -> `Personal access tokens` -> `Tokens (classic)`。
2. 点击 `Generate new token (classic)`。
3. 随便填写一个 Note 名称（比如：YawronBlogSync），**必须勾选 `gist` (Create gists) 这个权限选项**。
4. 拉到最下方生成，并复制这串类似 `ghp_xxxxx` 的 Token。

### 第二步：在独立设备上绑定系统
1. 打开应用的主页，在左侧边栏最底部的 `System` 模块中，点击 **⚙️ Setup Cloud DB**。
2. 将刚才获取的 Token 粘贴进第一个输入框内。
3. **初次构建云端数据库：**
   直接点击第二个输入框旁边的 **「Initialize New」** 按钮！系统会通过 API 在云端自动静默创建一个你的私密日记文件，并为你填好专属的 `Gist ID`。
4. 点击右下角的 **「Save Config」**。
*恭喜你，你的发布框右上方将出现“☁️ Cloud Mode”标志，日后点击 Post 时，日记将向云端自动推送备份！*

### 第三步：在其他设备上拉取同步
如果你换了一台电脑或使用手机浏览时，界面默认是空空如也的初装状态（保护隐私）。
你只需再次点击 `⚙️ Setup Cloud DB`：
1. 填入你的 `Token`。
2. **粘贴你在原设备第二步生成的那个 `Gist ID`**。
3. 点击保存后，云端的历史日记将会在几秒内瞬间拉取并渲染完毕！此时双端也就完成了同步打通！

*(⚠️ 安全警告：您的令牌将只存储于设备当前的本地浏览器中，绝对不会写入代码或发送到任何第三方服务器，以确保极致安全。如果您在公用设备上使用，随时可点击面板内的 `Disconnect` 来彻除连接痕迹。)*

---

## 🚀 部署到 Vercel (向全网免费公开应用)

这个项目是纯前端的单页应用，在 Vercel 上的发布极其简单。

1. **导出代码**: 在 AI Studio 中点击右上角的 “Share & Export”，选择导出到 **GitHub** 或下载 **ZIP代码包**。
2. **新建 Vercel 项目**:
   - 登录 [Vercel](https://vercel.com/)。
   - 导入你的 Git 仓库或直接上传 ZIP。
3. **设置构建配置**:
   - Framework Preset 选择 `Vite`。
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 **Deploy**，等待几十秒即可全网上线！任何人访问你的域名，都能拥有一个能离线使用和自己挂接 Github 账号的克隆版复古极客空间。
