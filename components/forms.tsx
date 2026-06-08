"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { promptIdeas } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

type AuthCardProps = {
  currentEmail: string | null;
  hasMembership: boolean;
  incomingError: string | null;
  nextPath: string;
  supabaseReady: boolean;
};

export function AuthCard({
  currentEmail,
  hasMembership,
  incomingError,
  nextPath,
  supabaseReady,
}: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState(
    incomingError ?? "登录后就可以进入学习区，并绑定课程激活码。",
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const origin = window.location.origin;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
          },
        });

        if (error) {
          throw error;
        }

        setMessage("注册成功，请去邮箱确认后再返回登录。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setMessage("登录成功，正在进入你的会员区。");
        setMessage("登录成功，正在进入学习区。");
        router.push(nextPath);
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function onSignOut() {
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setMessage("你已退出登录。");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "退出失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel form-card">
      <div className="card-heading">
        <span className="section-kicker">Student Login</span>
        <h2>先登录账号，再进入你的课程学习区。</h2>
      </div>

      {currentEmail ? (
        <div className="status-box">
          <strong>当前账号</strong>
          <span>{currentEmail}</span>
          <small>{hasMembership ? "已加入至少一个课程班级" : "已登录，但还没有绑定课程激活码"}</small>
          <div className="inline-actions">
            <Link href={hasMembership ? "/workspace" : "/redeem"} className="button button-secondary">
              {hasMembership ? "进入学习区" : "去输入激活码"}
            </Link>
            <button type="button" className="button button-ghost" onClick={onSignOut} disabled={loading}>
              退出登录
            </button>
          </div>
        </div>
      ) : (
        <>
          {!supabaseReady ? (
            <div className="status-box">
              <strong>还差一步配置</strong>
              <small>请先在 `.env.local` 里填入 Supabase 地址和匿名公钥，再回来登录。</small>
            </div>
          ) : null}
          <div className="auth-switch">
            <button
              type="button"
              className={`switch-pill ${mode === "login" ? "switch-pill-active" : ""}`}
              onClick={() => setMode("login")}
            >
              登录
            </button>
            <button
              type="button"
              className={`switch-pill ${mode === "signup" ? "switch-pill-active" : ""}`}
              onClick={() => setMode("signup")}
            >
              注册
            </button>
          </div>

          <form className="stack-form" onSubmit={onSubmit}>
            <label>
              邮箱
              <input name="email" type="email" placeholder="founder@example.com" required />
            </label>
            <label>
              密码
              <input name="password" type="password" placeholder="至少 8 位" minLength={8} required />
            </label>
            <button
              type="submit"
              className="button button-primary"
              disabled={loading || !supabaseReady}
            >
              {loading ? "提交中..." : mode === "login" ? "立即登录" : "创建账号"}
            </button>
          </form>
        </>
      )}

      <p className="muted-copy">{message}</p>
    </div>
  );
}

type RedeemCardProps = {
  currentEmail: string | null;
  permissions: string[];
};

export function RedeemCard({ currentEmail, permissions }: RedeemCardProps) {
  const router = useRouter();
  const [message, setMessage] = useState("输入课程激活码，加入对应的学习班级。");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim().toUpperCase();

    setLoading(true);
    setMessage("正在校验激活码...");

    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = (await response.json()) as { message: string; success?: boolean };
      setMessage(data.message);

      if (response.ok && data.success) {
        router.refresh();
      }
    } catch {
      setMessage("激活服务暂时不可用，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  if (!currentEmail) {
    return (
      <div className="glass-panel form-card">
        <div className="card-heading">
          <span className="section-kicker">Redeem Access</span>
          <h2>先登录，再给账号绑定课程激活码。</h2>
        </div>
        <p className="muted-copy">这样课程权限会和你的账号绑定，后面登录后就能直接进入对应学习区。</p>
        <Link href="/auth?next=/redeem" className="button button-primary">
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel form-card">
      <div className="card-heading">
        <span className="section-kicker">Redeem Access</span>
        <h2>输入激活码后，系统会为当前账号开通对应课程权限。</h2>
      </div>
      <div className="status-box">
        <strong>当前账号</strong>
        <span>{currentEmail}</span>
        <small>
          {permissions.length > 0 ? `当前课程：${permissions.join("、")}` : "当前还没有加入任何课程班级"}
        </small>
      </div>
      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          激活码
          <input name="code" placeholder="例如 AI-FOUNDER-100" required />
        </label>
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "校验中..." : "立即激活"}
        </button>
      </form>
      <p className="muted-copy">{message}</p>
    </div>
  );
}

export function AiWorkspaceCard() {
  const router = useRouter();
  const [copyPrompt, setCopyPrompt] = useState(promptIdeas[0]);
  const [copyAnswer, setCopyAnswer] = useState("这里会显示 AI 助手返回的文字练习结果。");
  const [copyLoading, setCopyLoading] = useState(false);

  async function onAskCopy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopyLoading(true);

    try {
      const response = await fetch("/api/ai/copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: copyPrompt }),
      });

      const data = (await response.json()) as {
        answer: string;
        quota?: {
          remaining_count: number;
          used_count: number;
        } | null;
      };

      const answer = data.quota
        ? `${data.answer}\n\n今日已使用 ${data.quota.used_count} 次，剩余 ${data.quota.remaining_count} 次。`
        : data.answer;

      setCopyAnswer(answer);
      router.refresh();
    } catch {
      setCopyAnswer("AI 文案服务暂时不可用，请稍后再试。");
    } finally {
      setCopyLoading(false);
    }
  }

  return (
    <div className="ai-studio-stack">
      <div className="workspace-grid">
        <div className="glass-panel form-card">
          <div className="card-heading">
            <span className="section-kicker">Writing Studio</span>
            <h2>文字练习助手</h2>
          </div>
          <form className="stack-form" onSubmit={onAskCopy}>
            <label>
              输入内容
              <textarea
                rows={7}
                value={copyPrompt}
                onChange={(event) => setCopyPrompt(event.target.value)}
              />
            </label>
            <button type="submit" className="button button-primary" disabled={copyLoading}>
              {copyLoading ? "生成中..." : "发送给 AI 助手"}
            </button>
          </form>
        </div>

        <div className="glass-panel output-card">
          <span className="section-kicker">Result</span>
          <pre>{copyAnswer}</pre>
        </div>
      </div>

      <div className="workspace-grid media-grid">
        <div className="glass-panel form-card">
          <div className="card-heading">
            <span className="section-kicker">Image Corner</span>
            <h2>图片功能即将加入</h2>
          </div>
          <p className="muted-copy">
            后续会加入图片创作练习，方便大家做课堂海报、配图作业和视觉创意练习。
          </p>
          <div className="status-box">
            <strong>当前状态</strong>
            <span>即将开放</span>
            <small>等图片功能整理完成后，就会在这里正式开放。</small>
          </div>
        </div>

        <div className="glass-panel output-card">
          <span className="section-kicker">Image Preview</span>
          <pre>
            {"后续会支持\n\n1. 课堂海报练习\n2. 配图设计练习\n3. 创意视觉作业\n4. 活动封面制作\n\n当前先保留位置，后续课堂阶段会加入。"}
          </pre>
        </div>
      </div>

      <div className="workspace-grid media-grid">
        <div className="glass-panel form-card">
          <div className="card-heading">
            <span className="section-kicker">Video Corner</span>
            <h2>视频功能内测中</h2>
          </div>
          <p className="muted-copy">
            后续会加入视频实验功能，方便大家尝试短片构思、动态画面和课堂创意作品。
          </p>
          <div className="status-box">
            <strong>当前状态</strong>
            <span>内测中</span>
            <small>等视频功能稳定后，会在后续阶段逐步开放给学员使用。</small>
          </div>
        </div>

        <div className="glass-panel output-card">
          <span className="section-kicker">Video Preview</span>
          <pre>
            {"后续会支持\n\n1. 分镜练习\n2. 短片创意实验\n3. 动态画面尝试\n4. 图生视频体验\n\n当前先保留位置，等功能稳定后再加入课堂。"}
          </pre>
        </div>
      </div>
    </div>
  );
}
