import Link from "next/link";

import { lessonModules, planStats } from "@/lib/mock-data";

export function HeroPanel() {
  return (
    <section className="hero-grid">
      <div className="hero-copy glass-panel">
        <span className="eyebrow">AI Interest Club</span>
        <h1>AI 兴趣班学习中心</h1>
        <p>
          在这里，你可以查看课程安排、进入专属学习区、使用 AI 助手完成练习，也可以逐步体验后续开放的图片与视频课堂功能。
        </p>
        <div className="hero-actions">
          <Link href="/auth" className="button button-primary">
            进入班级
          </Link>
          <Link href="/workspace" className="button button-secondary">
            打开学习区
          </Link>
        </div>
      </div>

      <div className="hero-side">
        <div className="glass-panel metrics-panel">
          {planStats.map((item) => (
            <div key={item.label} className="metric">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="glass-panel timeline-panel">
          <span className="section-kicker">课程模块</span>
          <ul>
            {lessonModules.map((module, index) => (
              <li key={module}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{module}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
