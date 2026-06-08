import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/access";
import { getSiteWindowSettings } from "@/lib/site-window";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function isTimeFormat(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

async function saveSettings(enabled: boolean, start: string, end: string) {
  const supabase = await createClient();
  const payload = [
    { key: "access_window_enabled", value: String(enabled) },
    { key: "access_window_start", value: start },
    { key: "access_window_end", value: end },
  ];

  const { error } = await supabase.from("site_settings").upsert(payload, {
    onConflict: "key",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ message: "请先配置 Supabase。" }, { status: 500 });
  }

  await requireAdmin("/admin");
  const settings = await getSiteWindowSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ message: "请先配置 Supabase。" }, { status: 500 });
    }

    await requireAdmin("/admin");
    const body = (await request.json()) as {
      enabled?: boolean;
      end?: string;
      start?: string;
    };

    const start = String(body.start ?? "").trim();
    const end = String(body.end ?? "").trim();
    const enabled = Boolean(body.enabled);

    if (!isTimeFormat(start) || !isTimeFormat(end)) {
      return NextResponse.json({ message: "请按 HH:MM 格式填写开放时间。" }, { status: 400 });
    }

    await saveSettings(enabled, start, end);
    const settings = await getSiteWindowSettings();

    return NextResponse.json({
      settings,
      message: enabled
        ? `已保存开放时间：${settings.start} - ${settings.end}。`
        : "已关闭时间限制，当前恢复为全天开放。",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存时间设置失败。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
