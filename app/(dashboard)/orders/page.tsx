// Placeholder data
const orders = [
  { id: "1", buyer: "Alice Johnson", product: "Complete UI Kit", amount: 49.00, date: "Jan 15, 2026" },
  { id: "2", buyer: "Bob Smith", product: "Icon Pack Pro", amount: 29.00, date: "Jan 14, 2026" },
  { id: "3", buyer: "Carol Williams", product: "Landing Page Templates", amount: 79.00, date: "Jan 14, 2026" },
  { id: "4", buyer: "David Brown", product: "Complete UI Kit", amount: 49.00, date: "Jan 13, 2026" },
  { id: "5", buyer: "Eva Martinez", product: "Design System Guide", amount: 39.00, date: "Jan 12, 2026" },
  { id: "6", buyer: "Frank Lee", product: "Complete UI Kit", amount: 49.00, date: "Jan 11, 2026" },
]

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all your sales
        </p>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-frosted-snow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Buyer
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/10 last:border-0">
                  <td className="px-6 py-4">
                    <span className="font-medium text-card-foreground">{order.buyer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-card-foreground">{order.product}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-evergreen">
                      ${order.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-muted-foreground">{order.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
