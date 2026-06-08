export type Benefit = {
  title: string;
  description: string;
};

export type PlanStat = {
  label: string;
  value: string;
};

export const benefits: Benefit[] = [
  {
    title: "课程入口更清晰",
    description: "学员可以直接从同一个入口进入登录、激活、学习区和 AI 助手，不用在多个链接里来回找。",
  },
  {
    title: "学习支持更集中",
    description: "登录后就能使用站内 AI 助手，进行提问、练习、整理思路和完成课堂任务。",
  },
  {
    title: "学习权限更明确",
    description: "不同课程和不同批次的学员都能按权限进入自己的内容区，学习过程更有秩序。",
  },
];

export const planStats: PlanStat[] = [
  { label: "适合学习形式", value: "学院 / 兴趣班 / 训练营" },
  { label: "学习入口", value: "账号登录 + 激活码" },
  { label: "课堂支持", value: "AI 助手 + 会员区" },
];

export const sampleCodes = [
  {
    code: "AI-FOUNDER-100",
    courseType: "旗舰训练营",
    status: "unused",
    expiresAt: "2026-12-31",
  },
  {
    code: "AI-VIP-ENTRY",
    courseType: "VIP 咨询室",
    status: "used",
    expiresAt: "2026-10-01",
  },
];

export const lessonModules = [
  "AI 入门与常用工具认识",
  "用 AI 辅助写作、整理和表达",
  "结合课堂练习完成自己的作品",
  "在会员区持续学习、提问和复盘",
];

export const promptIdeas = [
  "帮我把这一节课程写成更适合新手的口语化讲稿",
  "把这份作业点评成更有行动感的建议",
  "设计一个 7 天的 AI 入门打卡计划",
];
