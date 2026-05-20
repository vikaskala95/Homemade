import { db } from "@/lib/db";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT" | "REFUND" | "PROCESS_PAYOUT";

export async function createAuditLog(params: {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: string | Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: typeof params.details === "string" ? params.details : JSON.stringify(params.details),
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
