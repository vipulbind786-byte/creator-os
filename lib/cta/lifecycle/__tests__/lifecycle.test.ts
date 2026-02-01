// lib/cta/lifecycle/__tests__/lifecycle.test.ts

/**
 * Unit tests for lifecycle diagnostic layer
 * 
 * Note: This file uses standard test syntax.
 * Run with your test framework (Jest, Vitest, etc.)
 */

import {
  normalizeDaysSinceFirstSeen,
  normalizeDaysSinceLastActivity,
  normalizeExposureCount,
  normalizeInteractionCount,
  normalizeEngagementRatio,
  normalizeFatigueSeverity,
  normalizeAllSignals,
  countUnknownSignals,
  getMissingSignalNames,
} from "../normalize"
import { resolveLifecycleState, getStateDescription } from "../resolve"
import {
  buildLifecycleSnapshot,
  getSnapshotSummary,
  hasHighConfidence,
  isSnapshotRecent,
} from "../snapshot"
import type { LifecycleSignalInput } from "@/types/cta-lifecycle"

/* ======================================================
   LIFECYCLE UNIT TESTS

   ✔ Test normalization functions
   ✔ Test state resolution
   ✔ Test snapshot building
   ✔ Test edge cases
====================================================== */

describe("Lifecycle Normalization", () => {
  describe("normalizeDaysSinceFirstSeen", () => {
    it("should return 'low' for 0-7 days", () => {
      expect(normalizeDaysSinceFirstSeen(0)).toBe("low")
      expect(normalizeDaysSinceFirstSeen(3)).toBe("low")
      expect(normalizeDaysSinceFirstSeen(7)).toBe("low")
    })

    it("should return 'medium' for 8-30 days", () => {
      expect(normalizeDaysSinceFirstSeen(8)).toBe("medium")
      expect(normalizeDaysSinceFirstSeen(15)).toBe("medium")
      expect(normalizeDaysSinceFirstSeen(30)).toBe("medium")
    })

    it("should return 'high' for 31+ days", () => {
      expect(normalizeDaysSinceFirstSeen(31)).toBe("high")
      expect(normalizeDaysSinceFirstSeen(100)).toBe("high")
    })

    it("should return 'unknown' for undefined", () => {
      expect(normalizeDaysSinceFirstSeen(undefined)).toBe("unknown")
    })

    it("should return 'unknown' for negative values", () => {
      expect(normalizeDaysSinceFirstSeen(-1)).toBe("unknown")
    })
  })

  describe("normalizeDaysSinceLastActivity", () => {
    it("should return 'low' for 0-3 days", () => {
      expect(normalizeDaysSinceLastActivity(0)).toBe("low")
      expect(normalizeDaysSinceLastActivity(2)).toBe("low")
      expect(normalizeDaysSinceLastActivity(3)).toBe("low")
    })

    it("should return 'medium' for 4-14 days", () => {
      expect(normalizeDaysSinceLastActivity(4)).toBe("medium")
      expect(normalizeDaysSinceLastActivity(10)).toBe("medium")
      expect(normalizeDaysSinceLastActivity(14)).toBe("medium")
    })

    it("should return 'high' for 15+ days", () => {
      expect(normalizeDaysSinceLastActivity(15)).toBe("high")
      expect(normalizeDaysSinceLastActivity(30)).toBe("high")
    })
  })

  describe("normalizeEngagementRatio", () => {
    it("should return 'low' for ratio < 0.2", () => {
      expect(normalizeEngagementRatio(1, 10)).toBe("low") // 0.1
      expect(normalizeEngagementRatio(0, 10)).toBe("low") // 0
    })

    it("should return 'medium' for ratio 0.2-0.5", () => {
      expect(normalizeEngagementRatio(2, 10)).toBe("medium") // 0.2
      expect(normalizeEngagementRatio(5, 10)).toBe("medium") // 0.5
    })

    it("should return 'high' for ratio > 0.5", () => {
      expect(normalizeEngagementRatio(6, 10)).toBe("high") // 0.6
      expect(normalizeEngagementRatio(10, 10)).toBe("high") // 1.0
    })

    it("should return 'unknown' for zero exposures", () => {
      expect(normalizeEngagementRatio(5, 0)).toBe("unknown")
    })

    it("should return 'unknown' for undefined values", () => {
      expect(normalizeEngagementRatio(undefined, 10)).toBe("unknown")
      expect(normalizeEngagementRatio(5, undefined)).toBe("unknown")
    })
  })

  describe("normalizeFatigueSeverity", () => {
    it("should map 'none' and 'low' to 'low'", () => {
      expect(normalizeFatigueSeverity("none")).toBe("low")
      expect(normalizeFatigueSeverity("low")).toBe("low")
    })

    it("should map 'moderate' to 'medium'", () => {
      expect(normalizeFatigueSeverity("moderate")).toBe("medium")
    })

    it("should map 'high' and 'critical' to 'high'", () => {
      expect(normalizeFatigueSeverity("high")).toBe("high")
      expect(normalizeFatigueSeverity("critical")).toBe("high")
    })

    it("should return 'unknown' for undefined", () => {
      expect(normalizeFatigueSeverity(undefined)).toBe("unknown")
    })
  })

  describe("normalizeAllSignals", () => {
    it("should normalize all signals correctly", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 15,
        days_since_last_activity: 2,
        total_exposures: 10,
        total_interactions: 3,
        fatigue_severity: "moderate",
      }

      const normalized = normalizeAllSignals(input)

      expect(normalized.days_since_first_seen).toBe("medium")
      expect(normalized.days_since_last_activity).toBe("low")
      expect(normalized.exposure_count).toBe("medium")
      expect(normalized.interaction_count).toBe("medium")
      expect(normalized.engagement_ratio).toBe("medium") // 3/10 = 0.3
      expect(normalized.fatigue_severity).toBe("medium")
    })

    it("should handle missing signals", () => {
      const input: LifecycleSignalInput = {}

      const normalized = normalizeAllSignals(input)

      expect(normalized.days_since_first_seen).toBe("unknown")
      expect(normalized.days_since_last_activity).toBe("unknown")
      expect(normalized.exposure_count).toBe("unknown")
      expect(normalized.interaction_count).toBe("unknown")
      expect(normalized.engagement_ratio).toBe("unknown")
      expect(normalized.fatigue_severity).toBe("unknown")
    })
  })

  describe("countUnknownSignals", () => {
    it("should count unknown signals correctly", () => {
      const normalized = {
        signal1: "low" as const,
        signal2: "unknown" as const,
        signal3: "high" as const,
        signal4: "unknown" as const,
      }

      expect(countUnknownSignals(normalized)).toBe(2)
    })

    it("should return 0 for no unknowns", () => {
      const normalized = {
        signal1: "low" as const,
        signal2: "medium" as const,
        signal3: "high" as const,
      }

      expect(countUnknownSignals(normalized)).toBe(0)
    })
  })

  describe("getMissingSignalNames", () => {
    it("should return names of unknown signals", () => {
      const normalized = {
        signal1: "low" as const,
        signal2: "unknown" as const,
        signal3: "high" as const,
        signal4: "unknown" as const,
      }

      const missing = getMissingSignalNames(normalized)

      expect(missing).toContain("signal2")
      expect(missing).toContain("signal4")
      expect(missing).toHaveLength(2)
    })
  })
})

describe("Lifecycle State Resolution", () => {
  describe("resolveLifecycleState", () => {
    it("should classify as CHURNED for cancelled subscription", () => {
      const input: LifecycleSignalInput = {
        subscription_status: "cancelled",
        days_since_first_seen: 100,
        days_since_last_activity: 5,
      }

      expect(resolveLifecycleState(input)).toBe("CHURNED")
    })

    it("should classify as CHURNED for 30+ days inactive", () => {
      const input: LifecycleSignalInput = {
        days_since_last_activity: 35,
        subscription_status: "active",
      }

      expect(resolveLifecycleState(input)).toBe("CHURNED")
    })

    it("should classify as DORMANT for 15-29 days inactive", () => {
      const input: LifecycleSignalInput = {
        days_since_last_activity: 20,
        subscription_status: "active",
      }

      expect(resolveLifecycleState(input)).toBe("DORMANT")
    })

    it("should classify as AT_RISK for high fatigue", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        days_since_last_activity: 5,
        fatigue_severity: "high",
      }

      expect(resolveLifecycleState(input)).toBe("AT_RISK")
    })

    it("should classify as AT_RISK for dismissed as annoying", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        days_since_last_activity: 5,
        dismissed_as_annoying: true,
      }

      expect(resolveLifecycleState(input)).toBe("AT_RISK")
    })

    it("should classify as POWER_USER for high engagement + active subscription", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        days_since_last_activity: 1,
        total_exposures: 10,
        total_interactions: 8, // 0.8 ratio = high
        subscription_status: "active",
      }

      expect(resolveLifecycleState(input)).toBe("POWER_USER")
    })

    it("should classify as ACTIVE for regular usage", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 20,
        days_since_last_activity: 2,
        total_exposures: 10,
        total_interactions: 3, // 0.3 ratio = medium
      }

      expect(resolveLifecycleState(input)).toBe("ACTIVE")
    })

    it("should classify as ACTIVATING for new-ish user with engagement", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 15,
        days_since_last_activity: 3,
        total_interactions: 2,
      }

      expect(resolveLifecycleState(input)).toBe("ACTIVATING")
    })

    it("should classify as ONBOARDING for very new user", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 3,
        days_since_last_activity: 1,
      }

      expect(resolveLifecycleState(input)).toBe("ONBOARDING")
    })

    it("should classify as NEW_USER by default", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 1,
      }

      expect(resolveLifecycleState(input)).toBe("NEW_USER")
    })

    it("should handle empty input", () => {
      const input: LifecycleSignalInput = {}

      // Should default to NEW_USER
      expect(resolveLifecycleState(input)).toBe("NEW_USER")
    })
  })

  describe("getStateDescription", () => {
    it("should return description for each state", () => {
      expect(getStateDescription("NEW_USER")).toContain("just signed up")
      expect(getStateDescription("ONBOARDING")).toContain("learning")
      expect(getStateDescription("ACTIVATING")).toContain("building habits")
      expect(getStateDescription("ACTIVE")).toContain("regular usage")
      expect(getStateDescription("POWER_USER")).toContain("high engagement")
      expect(getStateDescription("AT_RISK")).toContain("churn signals")
      expect(getStateDescription("DORMANT")).toContain("inactive")
      expect(getStateDescription("CHURNED")).toContain("left")
    })
  })
})

describe("Lifecycle Snapshot", () => {
  describe("buildLifecycleSnapshot", () => {
    it("should build complete snapshot with high confidence", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        days_since_last_activity: 2,
        total_exposures: 10,
        total_interactions: 3,
        fatigue_severity: "low",
        subscription_status: "active",
      }

      const now = new Date("2024-01-01")
      const snapshot = buildLifecycleSnapshot(input, now)

      expect(snapshot.state).toBe("ACTIVE")
      expect(snapshot.confidence).toBe("high") // 0 unknowns
      expect(snapshot.computed_at).toBe(now)
      expect(snapshot.lifecycle_version).toBe("v1")
      expect(snapshot.signals_used.length).toBeGreaterThan(0)
      expect(snapshot.signals_missing.length).toBe(0)
    })

    it("should build snapshot with medium confidence for partial data", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        days_since_last_activity: 2,
        // Missing: exposures, interactions, fatigue, subscription
      }

      const now = new Date("2024-01-01")
      const snapshot = buildLifecycleSnapshot(input, now)

      expect(snapshot.confidence).toBe("medium") // 2-3 unknowns
      expect(snapshot.signals_missing.length).toBeGreaterThan(0)
    })

    it("should build snapshot with low confidence for minimal data", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        // Missing most signals
      }

      const now = new Date("2024-01-01")
      const snapshot = buildLifecycleSnapshot(input, now)

      expect(snapshot.confidence).toBe("low") // 4+ unknowns
      expect(snapshot.signals_missing.length).toBeGreaterThan(3)
    })

    it("should track signals used", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        total_exposures: 10,
        subscription_status: "active",
      }

      const now = new Date("2024-01-01")
      const snapshot = buildLifecycleSnapshot(input, now)

      const signalNames = snapshot.signals_used.map((s) => s.name)
      expect(signalNames).toContain("days_since_first_seen")
      expect(signalNames).toContain("total_exposures")
      expect(signalNames).toContain("subscription_status")
    })
  })

  describe("getSnapshotSummary", () => {
    it("should return human-readable summary", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        days_since_last_activity: 2,
        total_exposures: 10,
        total_interactions: 3,
      }

      const snapshot = buildLifecycleSnapshot(input, new Date())
      const summary = getSnapshotSummary(snapshot)

      expect(summary).toContain("ACTIVE")
      expect(summary).toContain("confidence")
    })
  })

  describe("hasHighConfidence", () => {
    it("should return true for high confidence", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        days_since_last_activity: 2,
        total_exposures: 10,
        total_interactions: 3,
        fatigue_severity: "low",
      }

      const snapshot = buildLifecycleSnapshot(input, new Date())
      expect(hasHighConfidence(snapshot)).toBe(true)
    })

    it("should return false for medium/low confidence", () => {
      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
        // Missing most signals
      }

      const snapshot = buildLifecycleSnapshot(input, new Date())
      expect(hasHighConfidence(snapshot)).toBe(false)
    })
  })

  describe("isSnapshotRecent", () => {
    it("should return true for recent snapshot", () => {
      const computedAt = new Date("2024-01-01T10:00:00Z")
      const now = new Date("2024-01-01T10:05:00Z") // 5 minutes later

      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
      }

      const snapshot = buildLifecycleSnapshot(input, computedAt)
      const maxAge = 10 * 60 * 1000 // 10 minutes

      expect(isSnapshotRecent(snapshot, now, maxAge)).toBe(true)
    })

    it("should return false for old snapshot", () => {
      const computedAt = new Date("2024-01-01T10:00:00Z")
      const now = new Date("2024-01-01T11:00:00Z") // 1 hour later

      const input: LifecycleSignalInput = {
        days_since_first_seen: 50,
      }

      const snapshot = buildLifecycleSnapshot(input, computedAt)
      const maxAge = 10 * 60 * 1000 // 10 minutes

      expect(isSnapshotRecent(snapshot, now, maxAge)).toBe(false)
    })
  })
})

describe("Edge Cases", () => {
  it("should handle all null values", () => {
    const input: LifecycleSignalInput = {
      days_since_first_seen: undefined,
      days_since_last_activity: undefined,
      total_exposures: undefined,
      total_interactions: undefined,
    }

    const state = resolveLifecycleState(input)
    expect(state).toBe("NEW_USER") // Default

    const snapshot = buildLifecycleSnapshot(input, new Date())
    expect(snapshot.confidence).toBe("low")
  })

  it("should handle conflicting signals", () => {
    const input: LifecycleSignalInput = {
      days_since_first_seen: 100, // Established
      days_since_last_activity: 1, // Recent
      total_exposures: 50, // High
      total_interactions: 1, // Low (0.02 ratio)
      subscription_status: "active",
    }

    const state = resolveLifecycleState(input)
    // Should still classify deterministically
    expect(state).toBeDefined()
  })

  it("should be deterministic with same input", () => {
    const input: LifecycleSignalInput = {
      days_since_first_seen: 50,
      days_since_last_activity: 2,
      total_exposures: 10,
      total_interactions: 3,
    }

    const state1 = resolveLifecycleState(input)
    const state2 = resolveLifecycleState(input)

    expect(state1).toBe(state2)
  })

  it("should handle zero values correctly", () => {
    const input: LifecycleSignalInput = {
      days_since_first_seen: 0,
      days_since_last_activity: 0,
      total_exposures: 0,
      total_interactions: 0,
    }

    const state = resolveLifecycleState(input)
    expect(state).toBeDefined()

    const snapshot = buildLifecycleSnapshot(input, new Date())
    expect(snapshot.state).toBeDefined()
  })
})
