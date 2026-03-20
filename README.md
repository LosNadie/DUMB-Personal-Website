# DUMB Personal Website

一个电影感风格的个人博客落地页，采用 **无后端静态部署 + GitHub CMS 发布** 方案：

- 首页视频背景 + 玻璃质感视觉
- Flatland 卡片列表（每页 4 张，2 x 2 居中布局）
- 文章详情页（Markdown 渲染）
- Decap CMS 在线发布（写入 GitHub，Vercel 自动发布）

---

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- React Markdown
- Decap CMS（Git-based CMS）
- Vercel（静态托管 + 自动构建）

---

## 项目结构

```text
.
├─ public/
│  └─ admin/                  # Decap CMS 后台入口与配置
├─ src/
│  ├─ content/
│  │  └─ posts/               # Markdown 文章内容（frontmatter + body）
│  ├─ lib/
│  │  └─ content.ts           # 静态内容读取与分页/详情查询
│  ├─ pages/
│  │  ├─ PostDetailPage.tsx   # Markdown 详情页
│  │  └─ StudioPage.tsx       # CMS 入口说明页（跳转 /admin）
│  └─ App.tsx                 # 首页与 Flatland 列表
└─ vercel.json                # Vercel 构建配置
```

---

## 内容格式

文章文件位于：`src/content/posts/*.md`

示例：

```md
---
slug: "my-first-post"
title: "我的第一篇文章"
category: "随笔"
publishedAt: "2026-03-19"
---

这里是正文，支持 Markdown。
```

字段说明：

- `slug`：唯一标识，用于详情页路由
- `title`：标题
- `category`：`生活` / `随笔` / `工作`
- `publishedAt`：发布日期，格式 `YYYY-MM-DD`
- `body`：Markdown 正文（frontmatter 下面的内容）

---

## 本地开发

```bash
npm install
npm run dev
```

默认地址：`http://localhost:5173`

---

## Decap CMS 配置与使用

### 1) 访问后台

- 本地：`http://localhost:5173/admin`
- 线上：`https://你的域名/admin`

### 2) GitHub 授权（必须）

Decap 使用 GitHub 写入仓库，需配置 GitHub OAuth App + Vercel OAuth 函数：

- Homepage URL：`https://dumb-personal-website.vercel.app/admin/`
- Authorization callback URL：`https://dumb-personal-website.vercel.app/api/oauth/callback`

并在 Vercel 项目环境变量中配置：

- `ORIGIN=https://dumb-personal-website.vercel.app`
- `COMPLETE_URL=https://dumb-personal-website.vercel.app/api/oauth/callback`
- `ADMIN_PANEL_URL=https://dumb-personal-website.vercel.app/admin/`
- `OAUTH_PROVIDER=github`
- `OAUTH_CLIENT_ID=<你的 GitHub OAuth Client ID>`
- `OAUTH_CLIENT_SECRET=<你的 GitHub OAuth Client Secret>`
- `OAUTH_SCOPES=repo,user,read:org`

### 3) 发布流程

1. 在 `/admin` 新建或编辑文章
2. 保存并进入发布流（Editorial Workflow）
3. 合并到 `main`
4. Vercel 自动构建上线

---

## 常见问题排查

### 1) `No control for widget 'date'`

原因：Decap 在当前环境下对 `date` 控件兼容性不稳定。  
当前项目已改为 `datetime` + 仅日期格式输出。

### 2) 发布后显示 `1970-01-01`

原因：文章 `publishedAt` 为空或格式非法。  
当前项目已在前端内容解析中做兜底：当日期缺失/非法时自动使用当天日期。

### 3) 登录后报 `Your GitHub user account does not have access to this repo`

请依次检查：

- OAuth App 的 callback 是否为  
  `https://dumb-personal-website.vercel.app/api/oauth/callback`
- Vercel 环境变量是否包含 `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET`
- `OAUTH_SCOPES` 是否为：`repo user read:org`（空格分隔）
- 当前登录账号是否对仓库 `LosNadie/DUMB-Personal-Website` 有写权限

---

## Vercel 部署（无后端）

1. 将仓库导入 Vercel
2. 保持默认构建命令：`npm run build`
3. 输出目录：`dist`
4. 完成部署后访问 `/admin` 开始发布

---

## 注意事项

- 当前方案是“无后端”，不包含运行时数据库与上传 API。
- OAuth 登录依赖 Vercel Serverless Function：`/api/oauth` 与 `/api/oauth/callback`。
- 图片/视频建议用：
  - Markdown 外链（CDN/图床）
  - 或仓库内静态资源（`public/uploads`）
- 媒体文件过大可能导致仓库膨胀，建议压缩后再上传。

---

## License

MIT
