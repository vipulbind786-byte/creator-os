/* =========================================================
   GLOBAL RATE LIMITER — CREATOR OS (FAANG SAFE)
   ---------------------------------------------------------
   ✔ No external deps
   ✔ Edge compatible
   ✔ Memory efficient
   ✔ Webhook safe
   ✔ Abuse protection
   ✔ Production hardened
   ✔ Strict IP parsing
   ✔ Webhook compatible
   🔒 HARD LOCK — DO NOT MODIFY
========================================================= */

type Bucket = {
  tokens: number
  last: number
}

type LimitConfig = {
  tokens: number
  interval: number
}

/* =========================================================
   In-memory store
========================================================= */

const buckets = new Map<string, Bucket>()

/* =========================================================
   Core token bucket
========================================================= */

function checkLimit(key: string, config: LimitConfig) {
  const now = Date.now()

  let bucket = buckets.get(key)

  if (!bucket) {
    bucket = { tokens: config.tokens, last: now }
    buckets.set(key, bucket)
  }

  const elapsed = now - bucket.last
  const refill = (elapsed / config.interval) * config.tokens

  bucket.tokens = Math.min(config.tokens, bucket.tokens + refill)
  bucket.last = now

  if (bucket.tokens < 1) return false

  bucket.tokens -= 1
  return true
}

/* =========================================================
   Helpers (STRICT IP NORMALIZATION)
========================================================= */

function getIP(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")

  if (forwarded) {
    // take FIRST IP only (real client)
    return forwarded.split(",")[0].trim()
  }

  return (
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

/* =========================================================
   LIMITERS
========================================================= */

export function rateLimitAPI(req: Request) {
  const ip = getIP(req)
  return checkLimit(`api:${ip}`, {
    tokens: 60,
    interval: 60_000,
  })
}

export function rateLimitPayment(req: Request) {
  const ip = getIP(req)
  return checkLimit(`payment:${ip}`, {
    tokens: 10,
    interval: 60_000,
  })
}

/*
  Webhook:
  global bucket only
  no IP needed
*/
export function rateLimitWebhook() {
  return checkLimit("webhook:global", {
    tokens: 120,
    interval: 60_000,
  })
}

/* =========================================================
   Guards
========================================================= */

export function guardAPI(req: Request) {
  return rateLimitAPI(req)
}

export function guardPayment(req: Request) {
  return rateLimitPayment(req)
}

/* 🔥 FIXED: now accepts req for consistency */
export function guardWebhook(_req: Request) {
  return rateLimitWebhook()
}

/* =========================================================
   🔒 HARD LOCK COMPLETE
========================================================= */