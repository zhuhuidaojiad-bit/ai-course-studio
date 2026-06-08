import { HeroPanel } from "@/components/hero-panel";
import { benefits } from "@/lib/mock-data";
import Link from "next/link";

const aiModules = [
  {
    kicker: "Copy Studio",
    title: "文字练习",
    provider: "DeepSeek",
    description: "可以帮助你整理表达、润色作业、写课堂练习内容，也适合做日常写作训练。",
    href: "/workspace",
    cta: "进入使用",
  },
  {
    kicker: "Image Studio",
    title: "图片创作",
    provider: "GPT Image 1.5",
    description: "后续会加入图片生成与视觉练习能力，适合课堂海报、配图和创意作业。",
    href: "/workspace",
    cta: "即将开放",
  },
  {
    kicker: "Video Studio",
    title: "视频实验室",
    provider: "Grok",
    description: "后续会加入视频实验功能，适合尝试分镜、动态画面和短片创作。",
    href: "/workspace",
    cta: "内测中",
  },
];

export default function HomePage() {
  return (
    <div className="page-stack">
      <HeroPanel />

      <section className="module-showcase">
        <div className="showcase-heading glass-panel">
          <span className="section-kicker">Learning Modules</span>
          <h2>你可以在这里看到当前开放的学习功能，以及后续会陆续加入的课堂模块。</h2>
          <p>
            当前优先开放文字练习模块，方便大家先熟悉站内学习方式。图片和视频功能会在后续课堂阶段逐步加入。
          </p>
        </div>

        <div className="module-grid">
          {aiModules.map((module) => (
            <article key={module.title} className="glass-panel module-card">
              <span className="section-kicker">{module.kicker}</span>
              <h3>{module.title}</h3>
              <strong>{module.provider}</strong>
              <p>{module.description}</p>
              <Link href={module.href} className="button button-secondary">
                {module.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="benefit-grid">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="glass-panel benefit-card">
            <span className="section-kicker">Core Layer</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.description}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel manifesto">
        <span className="section-kicker">Learning Experience</span>
        <h2>课程、权限、学习区和 AI 助手都放在同一个入口里，使用起来会更轻松。</h2>
        <p>
          你不需要记很多链接，也不用反复切换平台。登录后，就可以按自己的课程权限进入对应内容区，专注学习和练习。
        </p>
      </section>
    </div>
  );
}
