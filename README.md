# 部署与使用指南

这个项目采用经典的2000年代初代Facebook质感设计，安静、专注、克制。为了实现最佳的响应性能并纯本地化管理，基于 React + Vite 架构，且完全无后端。

## 如何新增一篇日记？

纯静态、无数据库的极客维护流程，只需 3 步：

**第一步：写 Markdown 笔记文件**
在代码编辑器的 `src/data/` 目录中，右键新建一个文件，比如叫做 `my-story.md`，然后用 Markdown 语法把你的日记写在这个文件里。

**第二步：在数据系统引入它**
打开文件： `src/data/posts.ts` 
在最顶端加入一行引入代码：
```javascript
import myStory from './my-story.md?raw';
```
*(注意：`?raw` 允许我们将文件作为纯文本字符串导入，免去后端的麻烦)*

**第三步：将它登记进列表中**
仍然在 `posts.ts` 文件里，找到 `export const posts = [...]` 数组，在里面加一条记录：
```javascript
  {
    id: 'my-story-2026',
    title: '这是我今天新写的日记标题！',
    date: '2026-04-25',   // 写什么日期，日历上就会高亮哪一天
    tags: ['心情', '随笔'], // 想加什么标签随便写这里
    content: myStory
  }
```

保存后，首页就会自动置顶出现这篇新日记，右侧日历、左侧标签自动同步生效！

---

## 部署到 Vercel (免费)

这个项目是纯前端的单页应用，在 Vercel 上的部署极其简单。

1. **导出代码**: 在 AI Studio 中点击右上角的 “Share & Export”，选择导出到 **GitHub** 或下载 **ZIP代码包**。
2. **新建 Vercel 项目**:
   - 登录 [Vercel](https://vercel.com/)。
   - 如果你导出了 GitHub，直接在 Vercel 中 "Import Git Repository" 即可。
   - 如果是 ZIP 包，可以在本地解压后使用 Vercel CLI 执行 `vercel` 部署，或者推送到你的私有 GitHub 仓库再导入。
3. **设置构建命令**:
   - Framework Preset 选择 `Vite`。
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 **Deploy**，只需等待几十秒，你的个人纯粹博客就上线了！没有任何数据库配置和运维成本。
