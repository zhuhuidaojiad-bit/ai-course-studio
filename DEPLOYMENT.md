# 上线清单

这份项目最适合先用 `Vercel + Supabase` 上线。

## 先做这 3 件事

1. 把你在聊天里发过的密钥全部重置一遍，再用新密钥上线
2. 确认 Supabase 的数据库已经执行过最新的 `supabase/schema.sql`
3. 确认你本地 `npm run build` 可以通过

## 推荐第一版开放内容

- 开放：登录 / 激活码 / 学习区 / 文字练习
- 暂缓：图片功能
- 暂缓：视频功能

这样更稳，也更适合先小范围内测。

## Vercel 上线步骤

1. 把代码上传到 GitHub
2. 登录 Vercel
3. 选择 `Add New Project`
4. 导入这个 GitHub 仓库
5. Framework 保持 `Next.js`
6. Build Command 保持默认
7. Output 也保持默认

## Vercel 里要填的环境变量

至少填这些：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
AI_DAILY_LIMIT=12
APP_TIMEZONE=Asia/Shanghai
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

如果你后面要重新打开图片和视频，再补：

```bash
OPENAI_IMAGE_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=medium
XAI_API_KEY=
XAI_BASE_URL=https://api.x.ai/v1
XAI_VIDEO_MODEL=grok-imagine-video
XAI_VIDEO_DURATION=8
```

## Supabase 上线前要改的地方

进入 `Authentication -> URL Configuration`

把本地地址保留着，同时加入你的正式域名：

- `https://你的域名/auth/confirm`

如果你先用 Vercel 默认域名，也要加：

- `https://你的-vercel-项目名.vercel.app/auth/confirm`

`Site URL` 也建议改成你的正式域名首页，例如：

- `https://你的域名`

## 上线后先测这几步

1. 打开首页
2. 测试注册 / 登录
3. 测试激活码
4. 测试学习区文案功能
5. 测试后台是否只有管理员能进
6. 测试你设置的开放时间是否生效

## 建议上线顺序

### 第一阶段

- 只给 3 到 10 个测试学员
- 收集登录、激活码、AI 使用反馈

### 第二阶段

- 再给第一批正式学员
- 稳定后再开放图片和视频

## 当前最稳的上线形态

- 品牌名：`AI 兴趣班学习中心`
- 学生入口：`登录 / 激活码 / 学习区`
- 功能主线：`文字练习`
- 图片和视频：保留为即将开放 / 内测中
