import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function AuditLogsPage() {
  await checkPermission(PERMISSIONS.VIEW_AUDIT_LOGS);

  const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Catatan Audit</h1>
      </div>

      <div className="bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
        
        {/* === Mobile View (Cards) === */}
        <div className="block md:hidden divide-y divide-neutral-100">
          {logs.length === 0 ? (
             <div className="p-8 text-center text-neutral-400 italic">Belum ada catatan audit.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-tighter text-xs ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-neutral-900">{log.usernameSnapshot}</span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 rounded-full">
                        {log.userId ? `ID: ${log.userId}` : 'System'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed break-words">
                    {log.details || "-"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest font-mono pt-2 border-t border-dashed border-neutral-100">
                    <span>Entity: {log.entityId || "N/A"}</span>
                    <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* === Desktop View (Table) === */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Waktu</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Pengguna</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Aksi</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">ID Entitas</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Detail</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-neutral-400 italic">
                    Belum ada catatan audit.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-neutral-900">{log.usernameSnapshot}</span>
                      <span className="text-[10px] text-neutral-400 block">ID: {log.userId || 'System'}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3">{log.entityId || "-"}</td>
                    <td className="px-6 py-3 max-w-xs truncate" title={log.details || ""}>
                      {log.details || "-"}
                    </td>
                    <td className="px-6 py-3 text-neutral-400">{log.ipAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getActionColor(action: string) {
  if (action.includes("CREATE")) return "bg-green-100 text-green-700";
  if (action.includes("UPDATE")) return "bg-blue-100 text-blue-700";
  if (action.includes("DELETE")) return "bg-red-100 text-red-700";
  if (action.includes("LOGIN_SUCCESS")) return "bg-emerald-100 text-emerald-700";
  if (action.includes("LOGIN_FAILED")) return "bg-orange-100 text-orange-700";
  return "bg-neutral-100 text-neutral-600";
}
