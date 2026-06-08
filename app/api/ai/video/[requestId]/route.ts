import { NextResponse } from "next/server";

import { getVideoGenerationStatus } from "@/lib/ai";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ message: "请先在环境变量里配置 Supabase。" }, { status: 500 });
    }

    const { requestId } = await params;
    const status = await getVideoGenerationStatus(requestId);

    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取视频任务状态失败。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
