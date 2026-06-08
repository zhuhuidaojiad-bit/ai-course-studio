import { NextResponse } from "next/server";

import { consumeQuota, getQuotaOrDeny } from "@/lib/ai-gate";
import { generateImageAsset } from "@/lib/ai";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ message: "请先在环境变量里配置 Supabase。" }, { status: 500 });
    }

    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ message: "请输入图片描述。" }, { status: 400 });
    }

    const access = await getQuotaOrDeny(prompt);

    if (access.error) {
      return NextResponse.json(
        { message: access.error, quota: "quota" in access ? access.quota ?? null : null },
        { status: access.status },
      );
    }

    const image = await generateImageAsset({ prompt });
    const quota = await consumeQuota(access.supabase, prompt);

    return NextResponse.json({
      ...image,
      quota,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片生成失败。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
