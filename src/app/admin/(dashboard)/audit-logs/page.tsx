import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { auditLogs } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, asc, desc, like, or } from "drizzle-orm";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const allowed = await hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS);
  if (!allowed) return <AccessDenied />;

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
        like(auditLogs.details, `%${searchQuery}%`),
      ),
    );
  }

  let auditQuery = db.select().from(auditLogs).$dynamic();
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
    return new Date(normalized).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="h2 text-neutral-900">Catatan Audit</h1>
      </div>
      <div
        className="sticky z-30 -mx-4 border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ top: "var(--app-header-height, 0px)" }}
      >
        <form
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
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

      <div className="overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm">
        {/* === Mobile View (Cards) === */}
        <div className="block bg-neutral-50 p-2 md:hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 italic">
              Belum ada catatan audit.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-bold tracking-tighter uppercase ${getActionColor(log.action)}`}
                    >
                      {log.action}
                    </span>
                    <span className="font-mono text-xs text-neutral-400">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] font-black tracking-wide text-neutral-900">
                    <span className="mr-1 font-mono text-[10px] text-neutral-400">
                      ID
                    </span>
                    {log.id}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">
                        {log.usernameSnapshot}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-1.5 text-[10px] text-neutral-400">
                        {log.userId ? `ID: ${log.userId}` : "System"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-dashed border-neutral-100 pt-2 font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
                    <span>Entity: {log.entityId || "N/A"}</span>
                    <span>IP: {log.ipAddress}</span>
                  </div>
                  <details className="text-xs text-neutral-500">
                    <summary className="cursor-pointer font-bold tracking-wider text-neutral-400 uppercase">
                      Lihat Detail
                    </summary>
                    <div className="mt-2 space-y-1 text-xs text-neutral-600">
                      <p className="wrap-break-words">{log.details || "-"}</p>
                      {log.userAgent && (
                        <p className="wrap-break-words text-neutral-400">
                          {log.userAgent}
                        </p>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === Desktop View (Table) === */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  Waktu
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  Pengguna
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  Aksi
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  ID Entitas
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-neutral-400 italic"
                  >
                    Belum ada catatan audit.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-6 py-3 font-mono font-black tracking-wide text-neutral-900">
                      {log.id}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-neutral-900">
                        {log.usernameSnapshot}
                      </span>
                      <span className="block text-[10px] text-neutral-400">
                        ID: {log.userId || "System"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold tracking-tighter uppercase ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3">{log.entityId || "-"}</td>
                    <td className="px-6 py-3 text-neutral-400">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <details className="inline-block text-xs text-neutral-500">
                        <summary className="cursor-pointer font-bold tracking-wider text-neutral-400 uppercase">
                          Lihat
                        </summary>
                        <div className="wrap-break-words mt-2 w-56 max-w-56 space-y-1 text-left text-xs whitespace-normal text-neutral-600">
                          <p className="wrap-break-words">
                            {log.details || "-"}
                          </p>
                          {log.userAgent && (
                            <p className="wrap-break-words text-neutral-400">
                              {log.userAgent}
                            </p>
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
  if (action.includes("LOGIN_SUCCESS"))
    return "bg-emerald-100 text-emerald-700";
  if (action.includes("LOGIN_FAILED")) return "bg-orange-100 text-orange-700";
  return "bg-neutral-100 text-neutral-600";
}
