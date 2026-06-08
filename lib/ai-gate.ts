import { getAiDailyLimit, getAppTimezone } from "@/lib/app-config";
import { getSiteWindowStatus } from "@/lib/site-window";
import { createClient } from "@/lib/supabase/server";

export async function requireAiMemberClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "请先登录后再使用 AI 功能。",
      status: 401,
      supabase,
      user: null,
    };
  }

  const { data: permissions, error: permissionError } = await supabase
    .from("user_permissions")
    .select("course_type")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1);

  if (permissionError) {
    throw new Error(permissionError.message);
  }

  if (!permissions || permissions.length === 0) {
    return {
      error: "你的账号还没有开通课程权限，请先输入邀请码。",
      status: 403,
      supabase,
      user,
    };
  }

  return {
    error: null,
    status: 200,
    supabase,
    user,
  };
}

export async function getQuotaOrDeny(promptExcerpt: string) {
  const { error, status, supabase } = await requireAiMemberClient();

  if (error) {
    return {
      error,
      status,
      supabase,
    };
  }

  const windowStatus = await getSiteWindowStatus();

  if (!windowStatus.isOpen) {
    return {
      error: `当前不在开放时间内。可用时间为 ${windowStatus.start} - ${windowStatus.end}（${windowStatus.timezone}）。`,
      status: 403,
      supabase,
    };
  }

  const { data: quotaStatus, error: quotaStatusError } = await supabase.rpc(
    "get_ai_quota_status",
    {
      daily_limit: getAiDailyLimit(),
      timezone_name: getAppTimezone(),
    },
  );

  if (quotaStatusError) {
    throw new Error(quotaStatusError.message);
  }

  const currentQuota = quotaStatus?.[0];

  if (currentQuota && currentQuota.remaining_count <= 0) {
    return {
      error: "你今天的 AI 次数已经用完了。",
      quota: currentQuota,
      status: 429,
      supabase,
    };
  }

  return {
    error: null,
    quota: currentQuota ?? null,
    status: 200,
    supabase,
    promptExcerpt,
  };
}

export async function consumeQuota(supabase: Awaited<ReturnType<typeof createClient>>, promptExcerpt: string) {
  const { data: quota, error: quotaError } = await supabase.rpc("consume_ai_quota", {
    daily_limit: getAiDailyLimit(),
    timezone_name: getAppTimezone(),
    prompt_excerpt_input: promptExcerpt,
  });

  if (quotaError) {
    throw new Error(quotaError.message);
  }

  return quota?.[0] ?? null;
}
