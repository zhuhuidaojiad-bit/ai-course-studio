import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error("请先配置 Supabase 环境变量。");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
