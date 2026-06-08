import { AdminPanel } from "@/components/admin-panel";
import { getAdminRecord, getViewerContext } from "@/lib/access";
import { getSiteWindowSettings } from "@/lib/site-window";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import Link from "next/link";

export default async function AdminPage() {
  const viewer = await getViewerContext();
  const adminRecord = viewer.userId ? await getAdminRecord(viewer.userId) : null;

  if (!viewer.userId) {
    return (
      <section className="page-stack">
        <div className="glass-panel intro-panel">
          <span className="section-kicker">Admin Console</span>
          <h1>这里是管理员入口，先登录你的管理员账号再进入后台。</h1>
          <p>普通访客不会看到后台内容。登录后，如果你的账号已经被设为管理员，系统会自动放行。</p>
          <div className="hero-actions">
            <Link href="/auth?next=/admin" className="button button-primary">
              去登录管理员账号
            </Link>
            <Link href="/" className="button button-secondary">
              返回首页
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!adminRecord) {
    return (
      <section className="page-stack">
        <div className="glass-panel intro-panel">
          <span className="section-kicker">Admin Console</span>
          <h1>你已经登录，但这个账号没有后台权限。</h1>
          <p>如果这是你自己的站点管理员账号，请先把该账号加入管理员名单；普通学员会被拦在这里，不会进入后台内容。</p>
          <div className="hero-actions">
            <Link href="/workspace" className="button button-primary">
              返回 AI 工作台
            </Link>
            <Link href="/" className="button button-secondary">
              返回首页
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!hasSupabaseEnv()) {
    return (
      <section className="page-stack">
        <div className="glass-panel intro-panel">
          <span className="section-kicker">Admin Console</span>
          <h1>先完成 Supabase 配置，后台邀请码功能才会真正启用。</h1>
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const { data: codes, error } = await supabase
    .from("redeem_codes")
    .select("code, course_type, created_at, expires_at, max_redemptions, redeemed_count, status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  const siteWindow = await getSiteWindowSettings();

  return (
    <section className="page-stack">
      <div className="glass-panel intro-panel">
        <span className="section-kicker">Admin Console</span>
        <h1>这里已经可以真实生成邀请码，并查看最近一批邀请码的状态。</h1>
      </div>
      <AdminPanel codes={codes} siteWindow={siteWindow} />
    </section>
  );
}
