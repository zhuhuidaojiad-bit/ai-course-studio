# Atelier AI Course Studio

这是一个已经接上 `Supabase` 真实登录、邀请码入库和会员权限控制的课程网站骨架，适合你做：

- 课程官网展示
- 用户注册 / 登录
- 激活码开通权限
- 会员专属 AI 助教页面
- 文案、图片、视频三种模型能力

## 当前包含

- 高级感首页
- Supabase 邮箱注册 / 登录
- 邮箱确认回跳
- 激活码兑换接口
- 文案模型：DeepSeek
- 图片模型：OpenAI GPT Image 1.5
- 视频模型：Grok
- 管理后台预览页

## 启动方式

1. 安装依赖
2. 复制 `.env.example` 为 `.env.local`
3. 在 Supabase 新建项目
4. 把 `supabase/schema.sql` 整段贴进 Supabase SQL Editor 执行
5. 把 Supabase 地址和匿名公钥填进 `.env.local`
6. 运行开发环境

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`

## 必填环境变量

```bash
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的_supabase_anon_key
AI_DAILY_LIMIT=12
APP_TIMEZONE=Asia/Shanghai
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
OPENAI_IMAGE_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=medium
XAI_API_KEY=
XAI_BASE_URL=https://api.x.ai/v1
XAI_VIDEO_MODEL=grok-imagine-video
XAI_VIDEO_DURATION=8
```

## Supabase 里要做的事

### 1. 开启邮箱登录

进入 Supabase 控制台的 Authentication，启用 Email 登录。

### 2. 配置邮箱回跳地址

本地开发时至少加入：

- `http://localhost:3000/auth/confirm`

正式上线后再加入你的正式域名，例如：

- `https://yourdomain.com/auth/confirm`

### 3. 初始化数据库结构

执行 [supabase/schema.sql](/Users/luan/Documents/Codex/2026-06-07/ai-api/supabase/schema.sql)

它会创建：

- `admin_users`
- `ai_usage_logs`
- `redeem_codes`
- `redemption_events`
- `user_permissions`
- `redeem_code()` 数据库函数
- `get_ai_quota_status()` 和 `consume_ai_quota()`
- RLS 权限策略

### 4. 把你自己设为后台管理员

先去网站注册一个账号，然后在 SQL Editor 里执行：

```sql
insert into public.admin_users (user_id, note)
select id, 'site owner'
from auth.users
where email = '你的登录邮箱';
```

### 5. 先插入几条邀请码

```sql
insert into public.redeem_codes (code, course_type, max_redemptions, expires_at)
values
  ('AI-FOUNDER-100', '旗舰训练营', 1, '2026-12-31 23:59:59+00'),
  ('AI-VIP-ENTRY', 'VIP 咨询室', 5, '2026-12-31 23:59:59+00');
```

## 现在已经接好的流程

### 用户系统

当前 `/auth` 页面已经支持：

- 注册
- 登录
- 邮箱确认回跳
- 退出登录

### 激活码逻辑

当前 `/api/redeem` 已经接到 Supabase 的 `redeem_code()` 函数。它会：

- 校验当前是否登录
- 检查邀请码是否存在
- 检查是否禁用或过期
- 检查可兑换次数是否已用完
- 记录兑换事件
- 给当前用户写入课程权限

### 会员权限校验

当前这些位置已经会卡权限：

- `/workspace` 页面：没登录会跳登录，没权限会跳激活码页
- `/api/ai/chat`：没登录或没权限不会放行

### 后台邀请码生成

当前 `/admin` 页面已经支持：

- 只允许管理员进入
- 批量生成邀请码
- 设置课程名称
- 设置每个邀请码可用次数
- 设置过期时间
- 查看最近 50 条邀请码

### AI 每日次数限制

当前 AI 接口已经支持：

- 每个学员每天单独计数
- 成功返回后才计入次数
- 超出额度后拒绝继续调用
- 会员区展示今日总额度、已使用和剩余次数

### 三种模型能力

当前工作台已经拆成：

- `/api/ai/copy`：文案模型，默认接 DeepSeek
- `/api/ai/image`：图片模型，默认接 OpenAI GPT Image 1.5
- `/api/ai/video`：视频任务提交，默认接 Grok
- `/api/ai/video/[requestId]`：视频任务状态查询

视频生成是异步任务流，所以提交后会先得到任务 ID，再查询状态。

## 你后面继续补的内容

- AI 提问日志
- 支付和订单系统

## 环境变量说明

- 不填 `DEEPSEEK_API_KEY` 时，文案模块走演示回复
- 不填 `OPENAI_IMAGE_API_KEY` 时，图片模块走演示图片
- 不填 `XAI_API_KEY` 时，视频模块走演示任务

## 推荐上线组合

- 前端和接口：`Next.js`
- 登录和数据库：`Supabase`
- 部署：`Vercel`

这套对 100 人规模完全够用，而且很好继续扩展。
