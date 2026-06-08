import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function buildInviteCode(prefix: string) {
  const head = prefix ? prefix.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10) : "AI";
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${head}-${random}`;
}

async function loadCodes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("redeem_codes")
    .select("code, course_type, created_at, expires_at, max_redemptions, redeemed_count, status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ message: "请先配置 Supabase。" }, { status: 500 });
  }

  await requireAdmin("/admin");
  const codes = await loadCodes();

  return NextResponse.json({ codes });
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ message: "请先配置 Supabase。" }, { status: 500 });
    }

    await requireAdmin("/admin");
    const body = (await request.json()) as {
      count?: number;
      courseType?: string;
      expiresAt?: string | null;
      maxRedemptions?: number;
      prefix?: string;
    };

    const courseType = body.courseType?.trim();
    const count = Math.min(Math.max(Number(body.count ?? 1), 1), 50);
    const maxRedemptions = Math.min(Math.max(Number(body.maxRedemptions ?? 1), 1), 100);

    if (!courseType) {
      return NextResponse.json({ message: "请输入课程名称。" }, { status: 400 });
    }

    const supabase = await createClient();
    const records = Array.from({ length: count }, () => ({
      code: buildInviteCode(body.prefix ?? ""),
      course_type: courseType,
      expires_at: body.expiresAt || null,
      max_redemptions: maxRedemptions,
      status: "active" as const,
    }));

    const { error } = await supabase.from("redeem_codes").insert(records);

    if (error) {
      throw new Error(error.message);
    }

    const codes = await loadCodes();

    return NextResponse.json({
      codes,
      message: `已生成 ${count} 个邀请码。`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成邀请码失败。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
