import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";
import { desc, like, or, asc, and } from "drizzle-orm";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { Button } from "@/components/ui/Button";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  await checkPermission(PERMISSIONS.VIEW_AUDIT_LOGS);

  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const rawSort = typeof params.sort === "string" ? params.sort : "id";
  const rawDir = typeof params.dir === "string" ? params.dir : "desc";
  const searchQuery = rawQuery.trim();
  const sortKey = rawSort;
  const sortDir = rawDir === "asc" ? "asc" : "desc";

  const sortMap = {
    id: auditLogs.id,
    time: auditLogs.createdAt,
    action: auditLogs.action,
    user: auditLogs.usernameSnapshot,
  };
  const sortColumn = sortMap[sortKey as keyof typeof sortMap] ?? auditLogs.id;

  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        like(auditLogs.action, `%${searchQuery}%`),
        like(auditLogs.usernameSnapshot, `%${searchQuery}%`),
        like(auditLogs.details, `%${searchQuery}%`)
      )
    );
  }

  let auditQuery = db.select().from(auditLogs);
  if (filters.length) {
    auditQuery = auditQuery.where(and(...filters));
  }

  const logs = await auditQuery
    .orderBy(sortDir === "asc" ? asc(sortColumn) : desc(sortColumn))
    .limit(200);
  const formatDateTime = (value: Date | string | null) => {
    if (!value) return "-";
    const raw = value instanceof Date ? value.toISOString() : value;
    const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
    return new Date(normalized).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="h2 text-neutral-900">Catatan Audit</h1>
      </div>
      <div
        className="sticky z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-neutral-50/95 backdrop-blur border-b border-neutral-200"
        style={{ top: "var(--app-header-height, 0px)" }}
      >
        <form method="get" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari audit..."
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm"
            />
            <Button type="submit" variant="outline" size="sm">
              Cari
            </Button>
          </div>
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sortKey}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="id">ID</option>
              <option value="time">Waktu</option>
              <option value="action">Aksi</option>
              <option value="user">Pengguna</option>
            </select>
            <select
              name="dir"
              defaultValue={sortDir}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
        
        {/* === Mobile View (Cards) === */}
        <div className="block md:hidden p-2 bg-neutral-50">
          {logs.length === 0 ? (
             <div className="p-8 text-center text-neutral-400 italic">Belum ada catatan audit.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col gap-3 bg-white border border-neutral-100 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-tighter text-xs ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-900 font-black tracking-wide font-mono">
                  <span className="text-[10px] text-neutral-400 font-mono mr-1">ID</span>
                  {log.id}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-neutral-900">{log.usernameSnapshot}</span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 rounded-full">
                        {log.userId ? `ID: ${log.userId}` : 'System'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest font-mono pt-2 border-t border-dashed border-neutral-100">
                    <span>Entity: {log.entityId || "N/A"}</span>
                    <span>IP: {log.ipAddress}</span>
                </div>
                <details className="text-xs text-neutral-500">
                  <summary className="cursor-pointer font-bold text-neutral-400 uppercase tracking-wider">
                    Lihat Detail
                  </summary>
                  <div className="mt-2 space-y-1 text-xs text-neutral-600">
                    <p className="break-words">{log.details || "-"}</p>
                    {log.userAgent && (
                      <p className="text-neutral-400 break-words">{log.userAgent}</p>
                    )}
                  </div>
                </details>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* === Desktop View (Table) === */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">ID</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Waktu</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Pengguna</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Aksi</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">ID Entitas</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">IP Address</th>
                <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-neutral-400 italic">
                    Belum ada catatan audit.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-3 text-neutral-900 font-black font-mono tracking-wide">
                      {log.id}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
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
                    <td className="px-6 py-3 text-neutral-400">{log.ipAddress}</td>
                    <td className="px-6 py-3 text-right">
                      <details className="inline-block text-xs text-neutral-500">
                        <summary className="cursor-pointer font-bold text-neutral-400 uppercase tracking-wider">
                          Lihat
                        </summary>
                        <div className="mt-2 w-56 max-w-[14rem] text-left space-y-1 text-xs text-neutral-600 whitespace-normal break-words">
                          <p className="break-words">{log.details || "-"}</p>
                          {log.userAgent && (
                            <p className="text-neutral-400 break-words">{log.userAgent}</p>
                          )}
                        </div>
                      </details>
                    </td>
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
