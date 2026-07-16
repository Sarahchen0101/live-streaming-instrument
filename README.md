# 直播排期填报系统

小红书电商文玩玉翠行业 · 直播扶持排期收集与管理工具

## 功能

- **商家端**：H5 页面，商家填写直播排期（店铺名称、联系方式、直播日期、开播时间、预估成交额）
- **管理端**：密码保护后台，查看所有提报数据，一键导出 Excel
- **自动标记**：预估成交额 ≥15 万自动标记为大场
- **本地缓存**：商家浏览器缓存店铺信息和已提报排期

## 技术栈

- Next.js 14（App Router）
- Supabase（PostgreSQL 数据库）
- Tailwind CSS（样式）
- SheetJS（Excel 导出）
- Vercel（部署）

## 快速开始

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)，注册并创建新项目
2. 在项目设置中获取：
   - `Project URL`（即 `NEXT_PUBLIC_SUPABASE_URL`）
   - `anon public key`（即 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
   - `service_role key`（即 `SUPABASE_SERVICE_ROLE_KEY`，在 Settings → API 中）
3. 在 SQL Editor 中运行 `lib/schema.sql` 创建表和策略

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

填入你的 Supabase 凭据和管理员密码：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=你的管理员密码
```

### 3. 本地开发

```bash
npm install
npm run dev
```

访问：
- 商家页面：http://localhost:3000
- 管理后台：http://localhost:3000/admin

### 4. 部署到 Vercel

#### 方式 A：通过 Vercel 网站（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com)，点击 "New Project"
3. 导入你的 GitHub 仓库
4. 在 Environment Variables 中添加上述环境变量
5. 点击 Deploy

#### 方式 B：通过 Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --env NEXT_PUBLIC_SUPABASE_URL=你的URL --env NEXT_PUBLIC_SUPABASE_ANON_KEY=你的KEY --env SUPABASE_SERVICE_ROLE_KEY=你的KEY --env ADMIN_PASSWORD=你的密码
```

## 页面说明

| 路径 | 说明 | 访问权限 |
|------|------|----------|
| `/` | 商家填写排期页面 | 公开 |
| `/admin` | 管理后台（查看+下载） | 需要密码 |

## 数据字段

| 字段 | 说明 | 类型 |
|------|------|------|
| shop_name | 店铺名称 | 文本 |
| phone | 联系方式 | 文本 |
| live_date | 直播日期 | 日期 |
| start_time | 开播时间 | 时间 |
| end_time | 结束时间（自动计算） | 时间 |
| estimated_gmv | 预估成交额（万元） | 数字 |
| is_big_shop | 是否大场（≥15万自动标记） | 布尔 |

## 定制修改

- **行业名称**：修改 `app/page.js` 中的 "文玩玉翠" 文字
- **大场阈值**：修改 `app/api/submit/route.js` 中的 `15` 数值
- **结束时间计算**：修改 `app/page.js` 中 `getEndTime` 函数的小时数
- **页面颜色**：修改 `tailwind.config.js` 中的 `brand` 颜色
