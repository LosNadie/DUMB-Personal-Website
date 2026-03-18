# DUMB Personal Website

一个带有电影感视觉风格的个人博客落地页项目，现已改造为 **Vercel 一体化部署**，支持：

- 首页视频背景 + 玻璃质感卡片
- Flatland 卡片分页展示（仅显示日期/标题/分类）
- 文章详情页（支持文字、图片、视频、音频、链接内容块）
- Studio 发布后台（登录后可增删改查）
- Cloudinary 图片/视频上传并回填到内容块

---

## 技术栈

### Frontend

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui（基础 Button 与样式体系）
- React Router

### Backend

- Node.js + Express + TypeScript
- Prisma + PostgreSQL（Neon / Supabase）
- JWT 鉴权（管理员登录）
- Multer + Cloudinary 对象存储上传

---

## 项目结构

```text
.
├─ src/                     # 前端应用
│  ├─ pages/                # 页面（详情、Studio）
│  ├─ lib/                  # API 与鉴权工具
│  └─ content/              # 内容类型定义（前端类型）
├─ api/                     # Vercel Serverless Function 入口
├─ backend/                 # 后端逻辑（Express 路由与业务）
│  ├─ src/routes/           # auth/posts/uploads 接口
├─ prisma/                  # Prisma Schema 与 Seed（Vercel 使用）
└─ vercel.json              # Vercel 构建配置
```

---

## 本地开发

### 1) 安装依赖

```bash
# 前端
npm install

# 后端
cd backend
npm install
```

### 2) 配置环境变量

```bash
cp .env.example .env.local
```

建议至少修改：

- `VITE_API_BASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 3) 初始化数据库（Postgres）

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4) 启动服务（本地）

```bash
# 终端 1：后端
cd backend
npm run dev

# 终端 2：前端
set VITE_API_BASE_URL=http://localhost:4000
npm run dev
```

- 前端默认：`http://localhost:5173`
- 后端默认：`http://localhost:4000`
- 发布后台：`/studio`

---

## Studio 发布能力（当前）

- 登录鉴权（管理员邮箱密码）
- 文章 CRUD（增删改查）
- 内容块支持：
  - `text`
  - `image`（本地上传或外链）
  - `video`（本地上传或外链）
  - `audio`（链接）
  - `link`

---

## Vercel 部署（全栈）

1. 把仓库导入 Vercel
2. 在 Vercel 项目里配置环境变量（与 `.env.example` 保持一致）
3. Build Command 使用仓库内默认配置（`vercel.json` 已指定）
4. 首次部署前，确保 Postgres 数据库可连通
5. 部署后访问 `/studio` 登录发布

部署后接口路径统一为 `/api/*`，例如：
- `/api/auth/login`
- `/api/posts`
- `/api/media/upload`

---

## 安全与运维建议

- 不要在生产环境使用弱密码
- `JWT_SECRET` 必须使用高强度随机值
- 请仅在服务端环境变量中保存 Cloudinary 密钥
- Postgres 建议启用自动备份与只读账号

---

## License

MIT
