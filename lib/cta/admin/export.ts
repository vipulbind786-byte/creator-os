// lib/cta/admin/export.ts

import type { AdminViewSnapshot, ExportMetadata } from "@/types/cta-admin"
import { assertSafeExport, assertReadOnlyUsage } from "./guards"
import { CTA_ADMIN_VERSION } from "./versioning"

/* ======================================================
   ADMIN DATA EXPORT

   🚨 CRITICAL: EXPORTS FOR HUMAN REVIEW ONLY
   
   This module CANNOT:
   ❌ Export to APIs or webhooks
   ❌ Enable automation
   ❌ Stream real-time data
   
   This module CAN ONLY:
   ✅ Export static snapshots
   ✅ Include legal disclaimers
   ✅ Format for human consumption
====================================================== */

/**
 * Export admin snapshot to JSON
 * 
 * Includes full disclaimer and metadata.
 * For human review and archival only.
 * 
 * @param snapshot - Admin view snapshot
 * @param now - Export timestamp
 * @returns JSON string with disclaimer
 * 
 * @example
 * const json = exportToJSON(snapshot, new Date())
 * fs.writeFileSync("admin-snapshot.json", json)
 */
export function exportToJSON(
  snapshot: AdminViewSnapshot,
  now: Date
): string {
  assertReadOnlyUsage("JSON export")
  assertSafeExport("json", true)

  const metadata = buildExportMetadata("json", snapshot, now)

  const exportData = {
    _metadata: metadata,
    _disclaimer: getLegalDisclaimer(),
    snapshot,
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export admin snapshot to CSV
 * 
 * Flattened format for spreadsheet analysis.
 * Includes disclaimer header.
 * 
 * @param snapshot - Admin view snapshot
 * @param now - Export timestamp
 * @returns CSV string with disclaimer
 * 
 * @example
 * const csv = exportToCSV(snapshot, new Date())
 * fs.writeFileSync("admin-snapshot.csv", csv)
 */
export function exportToCSV(
  snapshot: AdminViewSnapshot,
  now: Date
): string {
  assertReadOnlyUsage("CSV export")
  assertSafeExport("csv", true)

  const metadata = buildExportMetadata("csv", snapshot, now)

  const rows: string[] = []

  // Header with disclaimer
  rows.push(`# ${getLegalDisclaimer()}`)
  rows.push(`# Exported: ${metadata.exported_at.toISOString()}`)
  rows.push(`# Admin Version: ${metadata.admin_version}`)
  rows.push("")

  // Column headers
  rows.push("Layer,Field,Value,Confidence")

  // Governance data
  if (snapshot.governance) {
    rows.push(
      `Governance,Intent,${snapshot.governance.intent},${snapshot.overall_confidence}`
    )
    rows.push(
      `Governance,Surface,${snapshot.governance.surface},${snapshot.overall_confidence}`
    )
    rows.push(
      `Governance,Exposure Count,${snapshot.governance.exposure_count},${snapshot.overall_confidence}`
    )
  }

  // Compliance data
  if (snapshot.compliance) {
    rows.push(
      `Compliance,Total Exposures,${snapshot.compliance.exposure_stats.total_exposures},${snapshot.overall_confidence}`
    )
    rows.push(
      `Compliance,Total Clicks,${snapshot.compliance.action_stats.total_clicks},${snapshot.overall_confidence}`
    )
    rows.push(
      `Compliance,Click Rate,${snapshot.compliance.action_stats.click_rate},${snapshot.overall_confidence}`
    )
  }

  // Lifecycle data
  if (snapshot.lifecycle) {
    rows.push(
      `Lifecycle,State,${snapshot.lifecycle.state},${snapshot.lifecycle.confidence}`
    )
    rows.push(
      `Lifecycle,Signals Used,${snapshot.lifecycle.signals_used.length},${snapshot.lifecycle.confidence}`
    )
    rows.push(
      `Lifecycle,Signals Missing,${snapshot.lifecycle.signals_missing.length},${snapshot.lifecycle.confidence}`
    )
  }

  // Warnings
  if (snapshot.warnings.length > 0) {
    rows.push("")
    rows.push("# Warnings")
    snapshot.warnings.forEach((warning) => {
      rows.push(`Warning,,${warning},`)
    })
  }

  return rows.join("\n")
}

/**
 * Export PDF metadata (NOT full PDF rendering)
 * 
 * Returns metadata object that can be used by PDF generation tools.
 * Does NOT render PDF directly (that's a UI concern).
 * 
 * @param snapshot - Admin view snapshot
 * @param now - Export timestamp
 * @returns PDF metadata object
 * 
 * @example
 * const metadata = exportToPDFMetadata(snapshot, new Date())
 * // Pass to PDF rendering library
 */
export function exportToPDFMetadata(
  snapshot: AdminViewSnapshot,
  now: Date
): Record<string, unknown> {
  assertReadOnlyUsage("PDF metadata export")
  assertSafeExport("pdf_metadata", true)

  const metadata = buildExportMetadata("pdf_metadata", snapshot, now)

  return {
    metadata,
    disclaimer: getLegalDisclaimer(),
    title: "CTA Admin Diagnostic Snapshot",
    subtitle: `Generated ${now.toISOString()}`,
    sections: [
      {
        title: "Governance",
        data: snapshot.governance,
        confidence: snapshot.overall_confidence,
      },
      {
        title: "Compliance",
        data: snapshot.compliance,
        confidence: snapshot.overall_confidence,
      },
      {
        title: "Lifecycle",
        data: snapshot.lifecycle,
        confidence: snapshot.lifecycle?.confidence || "unknown",
      },
      {
        title: "Warnings",
        data: snapshot.warnings,
        confidence: snapshot.overall_confidence,
      },
    ],
  }
}

/* ===============================
   Helper Functions (Pure)
=============================== */

/**
 * Build export metadata
 */
function buildExportMetadata(
  format: "json" | "csv" | "pdf_metadata",
  snapshot: AdminViewSnapshot,
  now: Date
): ExportMetadata {
  return {
    exported_at: now,
    format,
    admin_version: CTA_ADMIN_VERSION,
    governance_version: snapshot.governance?.intent || "unknown",
    analytics_version: snapshot.compliance?.analytics_version || "unknown",
    lifecycle_version: snapshot.lifecycle?.lifecycle_version || "unknown",
    disclaimer: getLegalDisclaimer(),
    retention_notice: getRetentionNotice(),
  }
}

/**
 * Get legal disclaimer
 */
function getLegalDisclaimer(): string {
  return (
    "🚨 DIAGNOSTIC ONLY - NOT FOR AUTOMATED DECISIONS. " +
    "This data is for human review and compliance purposes only. " +
    "It CANNOT and MUST NOT be used to make automated decisions, " +
    "suppress CTAs, optimize conversions, or affect user experience. " +
    "All interpretations require human judgment and context."
  )
}

/**
 * Get data retention notice
 */
function getRetentionNotice(): string {
  return (
    "This snapshot contains diagnostic data for compliance and audit purposes. " +
    "Retention policies must comply with applicable data protection regulations (GDPR, CCPA, etc.). " +
    "Consult legal counsel for retention requirements in your jurisdiction."
  )
}
