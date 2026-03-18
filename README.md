# DUMB Personal Website

一个带有电影感视觉风格的个人博客落地页项目，支持：

- 首页视频背景 + 玻璃质感卡片
- Flatland 卡片分页展示（仅显示日期/标题/分类）
- 文章详情页（支持文字、图片、视频、音频、链接内容块）
- Studio 发布后台（登录后可增删改查）
- 本地图片/视频上传并回填到内容块

---

## 技术栈

### Frontend

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui（基础 Button 与样式体系）
- React Router

### Backend

- Node.js + Express + TypeScript
- Prisma + SQLite
- JWT 鉴权（管理员登录）
- Multer 本地媒体上传

---

## 项目结构

```text
.
├─ src/                     # 前端应用
│  ├─ pages/                # 页面（详情、Studio）
│  ├─ lib/                  # API 与鉴权工具
│  └─ content/              # 内容类型定义（前端类型）
├─ backend/                 # 后端服务
│  ├─ src/routes/           # auth/posts/uploads 接口
│  ├─ prisma/               # 数据模型与迁移
│  └─ uploads/              # 上传文件目录（运行时生成）
└─ deploy/                  # 服务器部署模板（Nginx/脚本）
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

### 2) 配置后端环境变量

```bash
cd backend
cp .env.example .env
```

建议至少修改：

- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FRONTEND_ORIGIN`

### 3) 初始化数据库

```bash
cd backend
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 4) 启动服务

```bash
# 终端 1：后端
cd backend
npm run dev

# 终端 2：前端
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

## 生产部署

仓库内已提供部署模板：

- 说明文档：`deploy/README.md`
- Nginx 模板：`deploy/nginx/dumb.conf`
- 服务器初始化：`deploy/scripts/server-bootstrap.sh`
- 一键部署脚本：`deploy/scripts/deploy.sh`
- PM2 配置：`backend/ecosystem.config.cjs`

推荐部署形态：`Nginx + PM2 + Node API + SQLite + 本地上传目录备份`。

---

## 安全与运维建议

- 不要在生产环境使用弱密码
- `JWT_SECRET` 必须使用高强度随机值
- 定期备份：
  - `backend/prisma/dev.db`
  - `backend/uploads/`
- 为站点启用 HTTPS（Certbot + Nginx）

---

## License

MIT
