import { redirect } from "next/navigation";

import { getAiDailyLimit, getAppTimezone } from "@/lib/app-config";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export type ViewerContext = {
  email: string | null;
  userId: string | null;
};

export type QuotaStatus = {
  quota_limit: number;
  remaining_count: number;
  usage_day: string;
  used_count: number;
};

export async function getViewerContext(): Promise<ViewerContext> {
  if (!hasSupabaseEnv()) {
    return {
      email: null,
      userId: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      email: null,
      userId: null,
    };
  }

  return {
    email: data.user.email ?? null,
    userId: data.user.id,
  };
}

export async function getActivePermissions(userId: string) {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_permissions")
    .select("course_type, active")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAdminRecord(userId: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, active, note")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAiQuotaStatus() {
  if (!hasSupabaseEnv()) {
    return {
      quota_limit: getAiDailyLimit(),
      remaining_count: getAiDailyLimit(),
      usage_day: new Date().toISOString().slice(0, 10),
      used_count: 0,
    } satisfies QuotaStatus;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ai_quota_status", {
    daily_limit: getAiDailyLimit(),
    timezone_name: getAppTimezone(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.[0] ?? {
      quota_limit: getAiDailyLimit(),
      remaining_count: getAiDailyLimit(),
      usage_day: new Date().toISOString().slice(0, 10),
      used_count: 0,
    }
  ) as QuotaStatus;
}

export async function requireViewer(nextPath?: string) {
  const viewer = await getViewerContext();

  if (!viewer.userId) {
    const target = nextPath ? `/auth?next=${encodeURIComponent(nextPath)}` : "/auth";
    redirect(target);
  }

  return viewer;
}

export async function requireActiveMembership(nextPath = "/workspace") {
  const viewer = await requireViewer(nextPath);
  const permissions = await getActivePermissions(viewer.userId!);

  if (permissions.length === 0) {
    redirect("/redeem");
  }

  return {
    viewer,
    permissions,
  };
}

export async function requireAdmin(nextPath = "/admin") {
  const viewer = await requireViewer(nextPath);
  const adminRecord = await getAdminRecord(viewer.userId!);

  if (!adminRecord) {
    redirect("/workspace");
  }

  return {
    viewer,
    adminRecord,
  };
}
