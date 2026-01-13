import "server-only";
import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Creates an audit log entry for administrative actions
 */
export async function createAuditLog(
  action: string, 
  entityId?: number, 
  details?: string,
  userOverride?: { id: number, username: string }
) {
  try {
    let userId: number | null = null;
    let usernameSnapshot: string = "system";

    if (userOverride) {
        userId = userOverride.id;
        usernameSnapshot = userOverride.username;
    } else {
        const session = await getSession();
        if (session) {
            userId = session.user.id;
            usernameSnapshot = session.user.username;
        }
    }

    // Special handling for public actions
    const isPublicAction = action === "CONTACT_SUBMISSION" || action === "AUTH_LOGIN_FAILED";
    const isSystemAction = action.startsWith("SYSTEM_") || action.startsWith("WEBHOOK_");

    if (!userId && !isPublicAction && !isSystemAction) {
        return;
    }

    const headersList = await headers();
    
    // IP might be a comma separated list if behind multiple proxies
    const rawIp = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const ipAddress = rawIp.split(',')[0].trim().substring(0, 45);
    
    const userAgent = headersList.get("user-agent")?.substring(0, 255) || null;

    await db.insert(auditLogs).values({
      userId,
      usernameSnapshot,
      action,
      entityId,
      details: details?.substring(0, 65535) || null,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Audit logging should not crash the main operation
    console.error("[Audit] Failed to create audit log:", error);
  }
}
