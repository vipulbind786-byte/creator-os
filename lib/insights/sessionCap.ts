/* ======================================================
   INSIGHT SESSION CAP — ENGINE SAFE (P3 LOCKED)

   ✔ Generic (engine-agnostic)
   ✔ Deterministic
   ✔ Pure logic
   ✔ Future-proof
   ✔ NO ordering responsibility
====================================================== */

export type SessionCapOptions = {
  maxPerSession?: number
}

/**
 * Limits the number of insights shown in a single session.
 *
 * CONTRACT (STRICT):
 * - Input MUST already be ordered by priority
 * - Output preserves input order
 * - Does NOT mutate input
 * - Does NOT sort
 */
export function applySessionCap<
  T extends { priority: number }
>(
  insights: readonly T[],
  options: SessionCapOptions = {}
): T[] {
  const { maxPerSession = 3 } = options

  if (!Array.isArray(insights) || insights.length === 0) {
    return []
  }

  if (maxPerSession <= 0) {
    return []
  }

  return insights.slice(0, maxPerSession)
}

/* ======================================================
   ALIAS EXPORT (ENGINE EXPECTATION)
   ⛔ DO NOT REMOVE
====================================================== */

export const sessionCapInsights = applySessionCap