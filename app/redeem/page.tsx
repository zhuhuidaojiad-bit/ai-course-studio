import { RedeemCard } from "@/components/forms";
import { getActivePermissions, getViewerContext } from "@/lib/access";

export default async function RedeemPage() {
  const viewer = await getViewerContext();
  const permissions = viewer.userId ? await getActivePermissions(viewer.userId) : [];

  return (
    <section className="single-column">
      <RedeemCard
        currentEmail={viewer.email}
        permissions={permissions.map((permission) => permission.course_type)}
      />
    </section>
  );
}
