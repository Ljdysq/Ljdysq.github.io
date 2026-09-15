# 个人主页

纯静态极简个人主页：冷调浅色纸感、科技蓝点缀、中文衬线 + 手写体标题。无构建工具、无框架，双击 `index.html` 即可预览，可直接部署到 GitHub Pages。

## 功能

- 亮色 / 暗色主题切换（localStorage 记忆，首次跟随系统偏好，支持键盘快捷键 `T`）
- 问候语随时间变化 + 一句话介绍打字机效果
- 关于我 / 项目 / 文章 / 动态 / 留言 板块
- 页脚金句（LOL / 王者荣耀台词 + 废话文学，本地随机轮换，点击可换一条）
- 不蒜子访问统计（第三方免费服务，可随时移除）
- giscus 评论区（基于 GitHub Discussions，零后端）
- AI 分身悬浮球（扣子 Coze Web SDK，访客免登录对话，纯前端嵌入）
- 点击涟漪、入场动画（均尊重系统「减少动效」设置）
- 响应式设计；自定义 404 页；社交分享卡片（OG meta）
- 字体走 jsDelivr CDN（国内可访问），按需只下载用到的中文字体子集，加载失败自动回退本地楷体 / 宋体

## 目录结构

```
.
├── index.html          # 页面结构（占位内容主要在这里）
├── 404.html            # 自定义 404 页（GitHub Pages 自动使用）
├── README.md
└── assets/
    ├── css/
    │   └── style.css   # 全部样式（配色在文件顶部的 CSS 变量里）
    └── js/
        └── main.js     # 全部交互脚本
```

## 替换占位内容

在编辑器中全局搜索「**你的**」，即可找到所有需要替换的占位符（昵称、介绍、GitHub 用户名、邮箱、OG 分享卡片、项目、文章、动态、giscus 配置）。

## 本地预览

```bash
# 方式一：直接双击 index.html 即可（所有功能均可用）
# 方式二：本地起一个静态服务器
python -m http.server 8000
# 然后浏览器打开 http://localhost:8000
# 方式三：VS Code 安装 Live Server 插件，右键 index.html → Open with Live Server
```

## 部署到 GitHub Pages

```bash
# 1. 进入项目目录并初始化仓库
git init
git add .
git commit -m "初始化个人主页"

# 2. 在 GitHub 上新建一个【公开】仓库（免费账户的 Pages 要求仓库公开）
#    推荐命名：你的用户名.github.io  ← 访问地址就是 https://你的用户名.github.io/
#    如果叫别的名字（如 homepage），访问地址是 https://你的用户名.github.io/homepage/

# 3. 关联远程仓库并推送（把地址换成你自己的）
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git branch -M main
git push -u origin main

# 4. 网页上开启 Pages：仓库 → Settings → Pages
#    Source 选 "Deploy from a branch"
#    Branch 选 main，目录选 / (root)，点 Save
#    等 1~2 分钟，访问 https://你的用户名.github.io/ 即可
```

## 评论区（giscus）

已配置完成（仓库 `Ljdysq/Ljdysq.github.io`）。首次部署后，打开页面在「留言」板块点「Sign in with GitHub」初始化 Discussion。

- 前提：仓库已勾选 Settings → **Discussions**，并已安装 [giscus GitHub App](https://github.com/apps/giscus)
- 想改动配置（分类、排序、输入框位置等）：打开 [giscus.app](https://giscus.app/zh-CN) 重新生成代码，整体替换 `index.html`「留言」板块里的 `<script>`
- 评论区主题会自动跟随本站亮暗模式（通过 postMessage 同步）

## AI 分身（扣子 Coze）

右下角悬浮球接入了扣子 Web SDK，访客免登录即可和「你的 AI 分身」聊天。智能体托管在 Coze，本站只嵌入官方 SDK，无后端。

- 架构：token 不写死在源码里，由 Cloudflare Worker 动态下发（`token.ljdysq.top/token`，自定义域名，国内网络可直连），PAT 加密存储在 Worker 的 Secret `COZE_PAT` 中；源码里只有 `bot_id` 和 Worker 地址
- 配置位置：`index.html` 底部「AI 分身」注释块里的 `bot_id` 和 `TOKEN_URL`（换 Worker 时改这里）
- 换令牌：扣子后台「扣子API」→「个人访问令牌」→ 撤销旧令牌 → 新建（建议最小权限：只勾「会话」「消息」）→ Cloudflare 控制台 Worker → 设置 → 变量和机密 → 覆盖 `COZE_PAT` → 重新部署
- 获取方法：
  1. 扣子后台：你的智能体 → 发布 → 勾选「Web SDK」→ 发布
  2. `bot_id`：发布页 URL 中 bot 后的数字（`https://www.coze.cn/console/bot/【这里】/publish/web`）
- ⚠️ token 经 Worker 下发后，浏览器运行时仍可能被开发者工具 Network 面板看到：请用最小权限令牌并 30 天一轮换；追求彻底安全可升级为 OAuth JWT 短期令牌方案
- 不想要悬浮球：删除 `index.html` 底部「AI 分身」整段注释和两个 `<script>` 即可
- 悬浮球不显示：先确认 Worker 的 `/token` 能返回 JSON、`ALLOWED_ORIGINS` 包含本站域名、智能体已发布，再看浏览器控制台（F12）报错

## 常见问题

- **字体想完全离线**：把 `https://cdn.jsdelivr.net/npm/@fontsource/…` 的 css 及字体文件下载到本地 `assets/fonts/`，把 `<link>` 改成本地路径即可
- **不想要访问统计**：删除 `index.html` 里的 `.footer-counters` 一行和底部 busuanzi 的 `<script>`
- **不想要页脚金句**：删除页脚的 `<blockquote id="daily-quote">` 和 `main.js` 中「页脚金句」段落
- **「最后更新」不准确**：GitHub Pages 上建议在 `assets/js/main.js` 的 `LAST_UPDATED` 手动填日期
