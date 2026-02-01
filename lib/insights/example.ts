/**
 * Usage Examples for Insight Evaluation Engine
 *
 * Run with:
 * npx tsx lib/insights/example.ts
 */

import { evaluateInsights } from "./evaluate"
import { ALL_RULES } from "./rules"
import type { DashboardMetrics } from "@/types/insight"

/* ======================================================
   EXAMPLE 1: New Creator (Zero Revenue)
====================================================== */

function exampleNewCreator() {
  console.log("\n📊 Example 1: New Creator\n")

  const metrics: DashboardMetrics = {
    todayRevenue: 0,
    totalRevenue: 0,
    bestSellingProduct: null,
    failedPayments7d: 0,
    refundedAmount7d: 0,
  }

  const insights = evaluateInsights({ metrics })

  console.log(`Triggered ${insights.length} insight(s):`)
  insights.forEach((i) => {
    console.log(`\n[${i.kind.toUpperCase()}] ${i.title}`)
    console.log(`→ ${i.body}`)
  })
}

/* ======================================================
   EXAMPLE 2: Growing Business with Issues
====================================================== */

function exampleGrowingBusiness() {
  console.log("\n📊 Example 2: Growing Business with Issues\n")

  const metrics: DashboardMetrics = {
    todayRevenue: 1500,
    totalRevenue: 50000,
    bestSellingProduct: "Premium Course",
    failedPayments7d: 5,
    refundedAmount7d: 200,
  }

  const insights = evaluateInsights({ metrics })

  console.log(`Triggered ${insights.length} insight(s):`)
  insights.forEach((i) => {
    console.log(`\n[${i.kind.toUpperCase()}] ${i.title}`)
    console.log(`→ ${i.body}`)
    console.log(`Priority: ${i.priority}`)
  })
}

/* ======================================================
   EXAMPLE 3: Exceptional Performance Day
====================================================== */

function exampleExceptionalDay() {
  console.log("\n📊 Example 3: Exceptional Performance Day\n")

  const metrics: DashboardMetrics = {
    todayRevenue: 5000,
    totalRevenue: 10000,
    bestSellingProduct: "Masterclass Bundle",
    failedPayments7d: 1,
    refundedAmount7d: 0,
  }

  const insights = evaluateInsights({ metrics })

  console.log(`Triggered ${insights.length} insight(s):`)
  insights.forEach((i) => {
    console.log(`\n[${i.kind.toUpperCase()}] ${i.title}`)
    console.log(`→ ${i.body}`)
  })
}

/* ======================================================
   EXAMPLE 4: Critical Refund Situation
====================================================== */

function exampleCriticalRefunds() {
  console.log("\n📊 Example 4: Critical Refund Situation\n")

  const metrics: DashboardMetrics = {
    todayRevenue: 0,
    totalRevenue: 10000,
    bestSellingProduct: "Digital Product",
    failedPayments7d: 2,
    refundedAmount7d: 3000,
  }

  const insights = evaluateInsights({ metrics })

  console.log(`Triggered ${insights.length} insight(s):`)
  insights.forEach((i) => {
    console.log(`\n[${i.kind.toUpperCase()}] ${i.title}`)
    console.log(`→ ${i.body}`)
  })
}

/* ======================================================
   EXAMPLE 5: Invalid Metrics (Validation Guard)
====================================================== */

function exampleInvalidMetrics() {
  console.log("\n📊 Example 5: Invalid Metrics\n")

  const invalidMetrics: DashboardMetrics = {
    todayRevenue: -100,
    totalRevenue: 1000,
    bestSellingProduct: null,
    failedPayments7d: 0,
    refundedAmount7d: 0,
  }

  const insights = evaluateInsights({ metrics: invalidMetrics })

  console.log(
    `Triggered ${insights.length} insight(s) (expected: 0)`
  )
}

/* ======================================================
   MAIN
====================================================== */

function main() {
  console.log("=".repeat(60))
  console.log("🚀 Insight Evaluation Engine — Examples")
  console.log("=".repeat(60))

  console.log(`\n📋 Total rules registered: ${ALL_RULES.length}`)

  exampleNewCreator()
  exampleGrowingBusiness()
  exampleExceptionalDay()
  exampleCriticalRefunds()
  exampleInvalidMetrics()

  console.log("\n" + "=".repeat(60))
  console.log("✅ Examples completed")
  console.log("=".repeat(60) + "\n")
}

// Uncomment to run manually
// main()

export {
  exampleNewCreator,
  exampleGrowingBusiness,
  exampleExceptionalDay,
  exampleCriticalRefunds,
  exampleInvalidMetrics,
  main,
}