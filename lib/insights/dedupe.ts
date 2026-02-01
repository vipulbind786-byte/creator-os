/* ======================================================
   INSIGHT DEDUPLICATION — ENGINE SAFE (P3 LOCKED)

   ✔ Preserves engine metadata
   ✔ Priority-aware conflict resolution
   ✔ Generic (Insight | EvaluatedInsight | future)
   ✔ Deterministic
   ✔ NO ordering responsibility (pipeline owns it)
====================================================== */

export function dedupeInsights<
  T extends { id: string; priority: number }
>(insights: T[]): T[] {
  const byId = new Map<string, T>()

  for (const insight of insights) {
    const existing = byId.get(insight.id)

    // Keep higher-priority version (lower number = stronger)
    if (!existing || insight.priority < existing.priority) {
      byId.set(insight.id, insight)
    }
  }

  // ❗ Do NOT sort here — pipeline is the single authority
  return Array.from(byId.values())
}