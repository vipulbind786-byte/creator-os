import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AuditTable from "@/components/admin/AuditTable";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  // 🔐 Extra safety: only admins should reach here
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Audit Logs</h1>
        <p className="mt-4 text-red-500">
          Failed to load audit logs.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        System Audit Logs
      </h1>

      <AuditTable logs={data ?? []} />
    </div>
  );
}