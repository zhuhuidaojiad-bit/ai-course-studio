import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { message: "请先在环境变量里配置 Supabase。" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { code?: string };
  const code = body.code?.trim();

  if (!code) {
    return NextResponse.json(
      { message: "请输入激活码。" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "请先登录后再兑换邀请码。" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase.rpc("redeem_code", {
    input_code: code.toUpperCase(),
  });

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 },
    );
  }

  const result = data?.[0];

  if (!result) {
    return NextResponse.json(
      { message: "兑换失败，请稍后再试。" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: result.success,
      message: result.success
        ? `${result.message} 已开通 ${result.course_type}。`
        : result.message,
      courseType: result.course_type,
    },
    { status: result.success ? 200 : 400 },
  );
}
