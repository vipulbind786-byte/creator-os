// lib/cta/governance/memory.ts

import type { CTAMemoryRecord } from "@/types/cta-governance"
import type { CTAIntent } from "@/types/cta"
import type { CTASurface } from "@/components/cta/surfaces"

/* ======================================================
   CTA MEMORY HELPERS — PURE FUNCTIONS ONLY

   ✔ Immutable operations
   ✔ No side effects
   ✔ No Date.now() (accept now: Date)
   
   🚫 NO CTA logic
   🚫 NO behavior changes
   🚫 NEVER imported by PART 1-4
   
   📊 OBSERVATIONAL ONLY
====================================================== */

/* ===============================
   Memory Creation
=============================== */

/**
 * Create initial memory record
 * 
 * Pure function - returns new object.
 * 
 * @param intent - CTA intent
 * @param surface - CTA surface
 * @param now - Current timestamp
 * @param version - CTA system version
 * @returns New memory record
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function createInitialMemory(
  intent: CTAIntent,
  surface: CTASurface,
  now: Date,
  version: string
): CTAMemoryRecord {
  return {
    cta_version: version,
    intent,
    surface,
    first_seen_at: now,
    last_seen_at: now,
    exposure_count: 1,
    last_action: null,
  }
}

/* ===============================
   Memory Updates
=============================== */

/**
 * Record new exposure
 * 
 * Pure function - returns new object.
 * 
 * @param memory - Existing memory record
 * @param now - Current timestamp
 * @returns Updated memory record
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function recordExposure(
  memory: CTAMemoryRecord,
  now: Date
): CTAMemoryRecord {
  return {
    ...memory,
    last_seen_at: now,
    exposure_count: memory.exposure_count + 1,
  }
}

/**
 * Record user action
 * 
 * Pure function - returns new object.
 * 
 * @param memory - Existing memory record
 * @param action - Action taken
 * @param now - Current timestamp
 * @returns Updated memory record
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function recordAction(
  memory: CTAMemoryRecord,
  action: "clicked" | "dismissed",
  now: Date
): CTAMemoryRecord {
  return {
    ...memory,
    last_action: action,
    last_seen_at: now,
  }
}

/**
 * Record dismissal with reason
 * 
 * Pure function - returns new object.
 * 
 * @param memory - Existing memory record
 * @param reason - Why user dismissed
 * @param now - Current timestamp
 * @returns Updated memory record
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function recordDismissal(
  memory: CTAMemoryRecord,
  reason: "not_relevant" | "later" | "annoying",
  now: Date
): CTAMemoryRecord {
  return {
    ...memory,
    last_action: "dismissed",
    dismissed_at: now,
    dismiss_reason: reason,
    last_seen_at: now,
  }
}

/* ===============================
   Memory Queries (Read-only)
=============================== */

/**
 * Get exposure count
 * 
 * Pure function - read-only.
 * 
 * @param memory - Memory record
 * @returns Exposure count
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function getExposureCount(memory: CTAMemoryRecord): number {
  return memory.exposure_count
}

/**
 * Check if user has interacted
 * 
 * Pure function - read-only.
 * 
 * @param memory - Memory record
 * @returns true if user clicked or dismissed
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function hasUserInteracted(memory: CTAMemoryRecord): boolean {
  return memory.last_action !== null
}

/**
 * Check if user dismissed
 * 
 * Pure function - read-only.
 * 
 * @param memory - Memory record
 * @returns true if user dismissed
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function wasDissmissed(memory: CTAMemoryRecord): boolean {
  return memory.last_action === "dismissed"
}

/**
 * Get time since first exposure
 * 
 * Pure function - read-only.
 * 
 * @param memory - Memory record
 * @param now - Current timestamp
 * @returns Milliseconds since first exposure
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function getTimeSinceFirstExposure(
  memory: CTAMemoryRecord,
  now: Date
): number {
  return now.getTime() - memory.first_seen_at.getTime()
}

/**
 * Get time since last exposure
 * 
 * Pure function - read-only.
 * 
 * @param memory - Memory record
 * @param now - Current timestamp
 * @returns Milliseconds since last exposure
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function getTimeSinceLastExposure(
  memory: CTAMemoryRecord,
  now: Date
): number {
  return now.getTime() - memory.last_seen_at.getTime()
}
