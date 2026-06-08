import { AuthCard } from "@/components/forms";
import { getActivePermissions, getViewerContext } from "@/lib/access";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type AuthPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = (await searchParams) ?? {};
  const supabaseReady = hasSupabaseEnv();
  const viewer = await getViewerContext();
  const permissions = viewer.userId ? await getActivePermissions(viewer.userId) : [];

  return (
    <section className="single-column">
      <AuthCard
        currentEmail={viewer.email}
        hasMembership={permissions.length > 0}
        incomingError={params.error ?? null}
        nextPath={params.next ?? "/workspace"}
        supabaseReady={supabaseReady}
      />
    </section>
  );
}
