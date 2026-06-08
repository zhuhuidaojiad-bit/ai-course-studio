import { MemberShell } from "@/components/member-shell";
import { AiWorkspaceCard } from "@/components/forms";
import { getAiQuotaStatus, requireActiveMembership } from "@/lib/access";
import { getSiteWindowStatus } from "@/lib/site-window";

export default async function WorkspacePage() {
  const { viewer, permissions } = await requireActiveMembership("/workspace");
  const quota = await getAiQuotaStatus();
  const siteWindow = await getSiteWindowStatus();

  return (
    <section className="page-stack">
      <div className="glass-panel intro-panel">
        <span className="section-kicker">Learning Space</span>
        <h1>这里是你的课程学习区，可以随时进入练习、提问和查看功能状态。</h1>
        <p>
          当前已经开放文字练习助手；图片和视频功能会在后续课堂阶段逐步加入。你可以先从现有模块开始使用。
        </p>
      </div>
      <MemberShell email={viewer.email} permissions={permissions} quota={quota} siteWindow={siteWindow} />
      {siteWindow.isOpen ? (
        <AiWorkspaceCard />
      ) : (
        <div className="glass-panel intro-panel">
          <span className="section-kicker">Closed Window</span>
          <h1>当前不在开放时间内，学习区里的 AI 功能暂时关闭。</h1>
          <p>{siteWindow.message}</p>
        </div>
      )}
    </section>
  );
}
