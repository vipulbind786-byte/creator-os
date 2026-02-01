// lib/queue/priorityQueue.ts
/* ======================================================
   PRIORITY QUEUE — DOMAIN STATE MACHINE (PHASE-3 LOCKED)

   ✔ Pure domain logic
   ✔ Deterministic
   ✔ Auditable
   ✔ Support-safe
   ✔ Monetization-aligned

   ❌ No DB
   ❌ No UI
   ❌ No timers
   ❌ No ETA
   ❌ No async side effects
====================================================== */

/* ===============================
   QUEUE STATES (LOCKED)
=============================== */

/**
 * Allowed lifecycle states for any
 * priority-handled request.
 *
 * ❌ Do NOT add intermediate states
 * ❌ Do NOT add time promises
 */
export const PRIORITY_QUEUE_STATES = {
  QUEUED: "queued",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
} as const

export type PriorityQueueState =
  typeof PRIORITY_QUEUE_STATES[keyof typeof PRIORITY_QUEUE_STATES]

/* ===============================
   QUEUE ITEM (DOMAIN SHAPE)
=============================== */

export type PriorityQueueItem = {
  id: string

  /**
   * Who raised the request
   */
  userId: string

  /**
   * Linked entity (suggestion, ticket, etc.)
   */
  entityId: string

  /**
   * Current lifecycle state
   */
  state: PriorityQueueState

  /**
   * ISO timestamps
   */
  createdAt: string
  updatedAt: string
}

/* ===============================
   VALID STATE TRANSITIONS (LOCKED)
=============================== */

/**
 * Explicit transition map.
 * Any transition outside this
 * is INVALID by design.
 */
const VALID_TRANSITIONS: Record<
  PriorityQueueState,
  PriorityQueueState[]
> = {
  queued: ["under_review"],
  under_review: ["resolved"],
  resolved: [],
}

/* ===============================
   TRANSITION RESULT
=============================== */

export type QueueTransitionResult =
  | {
      success: true
      nextState: PriorityQueueState
    }
  | {
      success: false
      reason: "INVALID_TRANSITION"
    }

/* ===============================
   CORE TRANSITION ENGINE
=============================== */

/**
 * Attempts to move a queue item
 * from one state to another.
 *
 * ❌ No side effects
 * ❌ No persistence
 */
export function transitionQueueState(
  currentState: PriorityQueueState,
  nextState: PriorityQueueState
): QueueTransitionResult {
  const allowedNextStates =
    VALID_TRANSITIONS[currentState] ?? []

  if (!allowedNextStates.includes(nextState)) {
    return {
      success: false,
      reason: "INVALID_TRANSITION",
    }
  }

  return {
    success: true,
    nextState,
  }
}

/* ===============================
   CREATION HELPER (SAFE)
=============================== */

/**
 * Creates a new queue item
 * in QUEUED state.
 */
export function createQueueItem(params: {
  id: string
  userId: string
  entityId: string
}): PriorityQueueItem {
  const now = new Date().toISOString()

  return {
    id: params.id,
    userId: params.userId,
    entityId: params.entityId,
    state: PRIORITY_QUEUE_STATES.QUEUED,
    createdAt: now,
    updatedAt: now,
  }
}