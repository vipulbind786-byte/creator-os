// lib/insights/audit.ts

export type InsightAuditEvent =
  | "created"
  | "seen"
  | "dismissed"
  | "cooldown_set"
  | "cooldown_expired"
  | "resolved"
  | "severity_escalated"

export type InsightAuditLog = {
  user_id: string
  insight_id: string
  event: InsightAuditEvent
  metadata?: Record<string, any> | null
}