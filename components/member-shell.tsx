import Link from "next/link";

type MemberShellProps = {
  email: string | null;
  permissions: Array<{
    course_type: string;
    active: boolean;
  }>;
  quota: {
    quota_limit: number;
    remaining_count: number;
    used_count: number;
    usage_day: string;
  };
  siteWindow: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
    currentTimeLabel: string;
    isOpen: boolean;
    message: string;
  };
};

export function MemberShell({ email, permissions, quota, siteWindow }: MemberShellProps) {
  return (
    <div className="glass-panel member-shell">
      <div>
        <span className="section-kicker">Learning Access</span>
        <h2>{email ?? "未登录"}</h2>
      </div>
      <div className="permission-list">
        {permissions.length > 0 ? (
          permissions.map((permission) => (
            <span key={permission.course_type} className="permission-pill">
              {permission.course_type}
            </span>
          ))
        ) : (
          <span className="permission-pill permission-pill-muted">当前还没有加入课程班级</span>
        )}
      </div>
      <div className="quota-grid">
        <div className="quota-card">
          <small>今日总额度</small>
          <strong>{quota.quota_limit}</strong>
        </div>
        <div className="quota-card">
          <small>今日已使用</small>
          <strong>{quota.used_count}</strong>
        </div>
        <div className="quota-card">
          <small>今日剩余</small>
          <strong>{quota.remaining_count}</strong>
        </div>
      </div>
      <div className="status-box">
        <strong>{siteWindow.isOpen ? "当前可使用" : "当前已关闭"}</strong>
        <span>
          {siteWindow.enabled
            ? `开放时间：${siteWindow.start} - ${siteWindow.end}（${siteWindow.timezone}）`
            : "当前未启用时间限制"}
        </span>
        <small>
          当前时间：{siteWindow.currentTimeLabel} · {siteWindow.message}
        </small>
      </div>
      <div className="member-actions">
        <Link href="/redeem" className="button button-secondary">
          输入课程激活码
        </Link>
        <Link href="/workspace" className="button button-secondary">
          返回学习区
        </Link>
      </div>
      <small className="muted-copy">记录日期：{quota.usage_day}</small>
    </div>
  );
}
