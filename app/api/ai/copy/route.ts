import { NextResponse } from "next/server";

import { consumeQuota, getQuotaOrDeny } from "@/lib/ai-gate";
import { generateCopyReply } from "@/lib/ai";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ answer: "请先在环境变量里配置 Supabase。" }, { status: 500 });
    }

    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ answer: "请输入你想咨询 AI 助教的内容。" }, { status: 400 });
    }

    const access = await getQuotaOrDeny(prompt);

    if (access.error) {
      return NextResponse.json(
        { answer: access.error, quota: "quota" in access ? access.quota ?? null : null },
        { status: access.status },
      );
    }

    const answer = await generateCopyReply({ prompt });
    const quota = await consumeQuota(access.supabase, prompt);

    return NextResponse.json({ answer, quota });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 文案接口调用失败。";
    return NextResponse.json({ answer: message }, { status: 500 });
  }
}
