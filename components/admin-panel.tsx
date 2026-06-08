"use client";

import { FormEvent, useState } from "react";

type AdminCode = {
  code: string;
  course_type: string;
  created_at: string;
  expires_at: string | null;
  max_redemptions: number;
  redeemed_count: number;
  status: "active" | "disabled";
};

type AdminPanelProps = {
  codes: AdminCode[];
  siteWindow: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
};

export function AdminPanel({ codes: initialCodes, siteWindow: initialSiteWindow }: AdminPanelProps) {
  const [codes, setCodes] = useState(initialCodes);
  const [siteWindow, setSiteWindow] = useState(initialSiteWindow);
  const [message, setMessage] = useState("你可以在这里批量生成邀请码。");
  const [windowMessage, setWindowMessage] = useState("你可以在这里设置每天允许学员使用 AI 的时间段。");
  const [loading, setLoading] = useState(false);
  const [windowLoading, setWindowLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setLoading(true);
    setMessage("正在生成邀请码...");

    try {
      const response = await fetch("/api/admin/codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseType: String(form.get("courseType") ?? "").trim(),
          count: Number(form.get("count") ?? "1"),
          maxRedemptions: Number(form.get("maxRedemptions") ?? "1"),
          expiresAt: String(form.get("expiresAt") ?? "").trim() || null,
          prefix: String(form.get("prefix") ?? "").trim(),
        }),
      });

      const data = (await response.json()) as {
        codes?: AdminCode[];
        message: string;
      };

      setMessage(data.message);

      if (response.ok && data.codes) {
        setCodes(data.codes);
        event.currentTarget.reset();
      }
    } catch {
      setMessage("生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveWindow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setWindowLoading(true);
    setWindowMessage("正在保存开放时间...");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: form.get("enabled") === "on",
          start: String(form.get("start") ?? "").trim(),
          end: String(form.get("end") ?? "").trim(),
        }),
      });

      const data = (await response.json()) as {
        message: string;
        settings?: AdminPanelProps["siteWindow"];
      };

      setWindowMessage(data.message);

      if (response.ok && data.settings) {
        setSiteWindow(data.settings);
      }
    } catch {
      setWindowMessage("保存失败，请稍后重试。");
    } finally {
      setWindowLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="glass-panel form-card">
        <div className="card-heading">
          <span className="section-kicker">Access Window</span>
          <h2>你可以自己设置网站每天允许使用 AI 的时间段。</h2>
        </div>
        <form className="stack-form admin-form-grid" onSubmit={onSaveWindow}>
          <label className="checkbox-label">
            <span>启用时间限制</span>
            <input name="enabled" type="checkbox" defaultChecked={siteWindow.enabled} />
          </label>
          <div className="status-box">
            <strong>{siteWindow.enabled ? "当前已启用" : "当前未启用"}</strong>
            <small>
              {siteWindow.enabled
                ? `开放时间 ${siteWindow.start} - ${siteWindow.end}（${siteWindow.timezone}）`
                : "当前是全天开放状态"}
            </small>
          </div>
          <label>
            开始时间
            <input name="start" type="time" defaultValue={siteWindow.start} required />
          </label>
          <label>
            结束时间
            <input name="end" type="time" defaultValue={siteWindow.end} required />
          </label>
          <button type="submit" className="button button-primary" disabled={windowLoading}>
            {windowLoading ? "保存中..." : "保存使用时间"}
          </button>
        </form>
        <p className="muted-copy">{windowMessage}</p>
      </div>

      <div className="glass-panel form-card">
        <div className="card-heading">
          <span className="section-kicker">Code Generator</span>
          <h2>一次生成一批邀请码，适合你发给不同课程或不同批次学员。</h2>
        </div>
        <form className="stack-form admin-form-grid" onSubmit={onSubmit}>
          <label>
            课程名称
            <input name="courseType" placeholder="例如 旗舰训练营" required />
          </label>
          <label>
            生成数量
            <input name="count" type="number" min={1} max={50} defaultValue={5} required />
          </label>
          <label>
            每个码可用次数
            <input name="maxRedemptions" type="number" min={1} max={100} defaultValue={1} required />
          </label>
          <label>
            前缀
            <input name="prefix" placeholder="例如 AI2026" />
          </label>
          <label>
            过期时间
            <input name="expiresAt" type="datetime-local" />
          </label>
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "生成中..." : "生成邀请码"}
          </button>
        </form>
        <p className="muted-copy">{message}</p>
      </div>

      <div className="glass-panel admin-table">
        <div className="admin-table-head">
          <span>邀请码列表</span>
          <small>{codes.length} 条</small>
        </div>
        {codes.map((item) => (
          <div key={item.code} className="admin-row">
            <strong>{item.code}</strong>
            <span>{item.course_type}</span>
            <span>
              已用 {item.redeemed_count}/{item.max_redemptions}
            </span>
            <span>{item.status === "active" ? "启用中" : "已停用"}</span>
            <span>{item.expires_at ? `到期 ${item.expires_at.slice(0, 10)}` : "长期有效"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
