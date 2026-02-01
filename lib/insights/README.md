# Insight Trigger Evaluation Engine

## Overview

A production-grade, pure logic engine for evaluating dashboard metrics and generating actionable insights. This system is framework-agnostic, fully typed, and designed for extensibility.

## Architecture

```
types/insight.ts          → Type definitions (Insight, DashboardMetrics, InsightRule)
lib/insights/rules.ts     → Individual rule implementations
lib/insights/evaluate.ts  → Main evaluation engine
```

## Key Features

✅ **Pure Logic** - No UI, no database writes, no side effects  
✅ **Type Safe** - Strict TypeScript types throughout  
✅ **Extensible** - Add new rules without modifying the engine  
✅ **Testable** - Pure functions, easy to unit test  
✅ **Framework Agnostic** - No Next.js/React dependencies  
✅ **Error Resilient** - Isolated rule failures, comprehensive validation  

## Usage

### Basic Usage

```typescript
import { evaluateInsights } from "@/lib/insights/evaluate";
import type { DashboardMetrics } from "@/types/insight";

const metrics: DashboardMetrics = {
  todayRevenue: 1500,
  totalRevenue: 50000,
  bestSellingProduct: "Premium Course",
  failedPayments7d: 5,
  refundedAmount7d: 200,
};

const insights = evaluateInsights(metrics);

// Returns:
// [
//   {
//     id: "failed-payments",
//     kind: "warning",
//     title: "Payment failures detected",
//     body: "5 users failed to complete payment...",
//     priority: 1
//   },
//   {
//     id: "refunds",
//     kind: "info",
//     title: "Refunds issued recently",
//     body: "₹200.00 was refunded...",
//     priority: 2
//   },
//   ...
// ]
```

### Integration Example (Dashboard)

```typescript
// app/(dashboard)/dashboard/page.tsx
import { evaluateInsights } from "@/lib/insights/evaluate";
import type { DashboardMetrics } from "@/types/insight";

export default async function DashboardPage() {
  // ... fetch data from database ...

  const metrics: DashboardMetrics = {
    todayRevenue,
    totalRevenue,
    bestSellingProduct,
    failedPayments7d,
    refundedAmount7d,
  };

  const insights = evaluateInsights(metrics);

  return (
    <div>
      <InsightStack insights={insights} />
      {/* ... rest of dashboard ... */}
    </div>
  );
}
```

## Current Rules

| Rule ID | Trigger Condition | Priority | Kind |
|---------|------------------|----------|------|
| `failed-payments` | ≥3 failed payments in 7d | 1 | warning |
| `high-refund-rate` | Refunds ≥20% of total revenue | 1 | warning |
| `strong-performance` | Today's revenue ≥10% of total | 1 | success |
| `refunds` | Any refunds in 7d | 2 | info |
| `revenue-today` | Revenue > 0 today | 3 | success |
| `no-best-seller` | Revenue exists but no best seller | 4 | info |
| `zero-revenue` | No revenue at all | 5 | info |

## Adding New Rules

### Step 1: Create Rule Function

```typescript
// lib/insights/rules.ts

export const checkNewRule: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  // Your condition logic
  if (metrics.someCondition) {
    return {
      id: "unique-rule-id",
      kind: "warning", // or "info" or "success"
      title: "Short title",
      body: "Detailed explanation",
      priority: 3, // Lower = higher priority
    };
  }

  return null;
};
```

### Step 2: Register Rule

```typescript
// lib/insights/rules.ts

export const ALL_RULES: InsightRule[] = [
  checkFailedPayments,
  checkRefunds,
  checkRevenueToday,
  checkNewRule, // ← Add here
];
```

That's it! The engine will automatically evaluate your new rule.

## Type Definitions

### DashboardMetrics

```typescript
type DashboardMetrics = {
  todayRevenue: number;           // Revenue today (currency units)
  totalRevenue: number;           // All-time revenue
  bestSellingProduct: string | null; // Top product name
  failedPayments7d: number;       // Failed payment count (7d)
  refundedAmount7d: number;       // Refunded amount (7d)
};
```

### Insight

```typescript
type Insight = {
  id: string;           // Unique identifier
  kind: InsightKind;    // "warning" | "info" | "success"
  title: string;        // Short headline
  body: string;         // Detailed message
  priority: number;     // Sort order (lower = higher)
};
```

### InsightRule

```typescript
type InsightRule = (metrics: DashboardMetrics) => Insight | null;
```

## Testing

### Unit Test Example

```typescript
import { checkFailedPayments } from "@/lib/insights/rules";
import type { DashboardMetrics } from "@/types/insight";

describe("checkFailedPayments", () => {
  it("should trigger when failed payments >= 3", () => {
    const metrics: DashboardMetrics = {
      todayRevenue: 0,
      totalRevenue: 1000,
      bestSellingProduct: null,
      failedPayments7d: 5,
      refundedAmount7d: 0,
    };

    const result = checkFailedPayments(metrics);

    expect(result).not.toBeNull();
    expect(result?.id).toBe("failed-payments");
    expect(result?.kind).toBe("warning");
  });

  it("should not trigger when failed payments < 3", () => {
    const metrics: DashboardMetrics = {
      todayRevenue: 0,
      totalRevenue: 1000,
      bestSellingProduct: null,
      failedPayments7d: 2,
      refundedAmount7d: 0,
    };

    const result = checkFailedPayments(metrics);

    expect(result).toBeNull();
  });
});
```

## Error Handling

The engine includes multiple layers of error protection:

1. **Input Validation** - Validates metrics structure and types
2. **Rule Isolation** - One failing rule doesn't break the engine
3. **Graceful Degradation** - Returns empty array on catastrophic failure
4. **Logging** - Console warnings/errors for debugging

## Performance

- **O(n)** complexity where n = number of rules
- All rules execute in a single pass
- No database queries or async operations
- Suitable for real-time evaluation

## Migration from Inline Code

The dashboard currently has an inline `generateInsights()` function. To migrate:

```typescript
// Before (inline)
function generateInsights(stats: DashboardStats): Insight[] {
  // ... inline logic ...
}

// After (using engine)
import { evaluateInsights } from "@/lib/insights/evaluate";

const insights = evaluateInsights(stats);
```

Both implementations can coexist during transition.

## Future Enhancements

Potential extensions (without breaking changes):

- **Conditional Rules** - Rules that depend on other rules
- **Time-based Rules** - Different thresholds by time of day/week
- **User Segmentation** - Different rules for different user types
- **A/B Testing** - Multiple rule variants
- **Machine Learning** - Dynamic threshold adjustment
- **Localization** - Multi-language support

## License

Part of the Creator OS project.
