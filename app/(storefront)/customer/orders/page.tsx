import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { Package, Eye, Truck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending Payment", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  in_production: { label: "In Production", variant: "default" },
  production_done: { label: "Production Done", variant: "default" },
  shipping: { label: "Shipping", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

export default async function CustomerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">My Orders</h2>
        <p className="text-sm text-muted-foreground">Track your orders and shipping status</p>
      </div>

      {!orders || orders.length === 0 ? (
        <Empty
          icon={<Package className="h-12 w-12" />}
          title="No orders yet"
          description="Your confirmed orders will appear here"
        >
          <Link href="/products">
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </Empty>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status] || statusMap.pending_payment
            const itemCount = Array.isArray(order.items) ? order.items.length : order.items?.[0]?.count || 0

            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{order.order_no}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Products: </span>
                        {itemCount}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-medium text-primary">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </p>
                      {order.tracking_number && (
                        <p className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Tracking: </span>
                          {order.tracking_number}
                        </p>
                      )}
                    </div>
                    <Link href={`/customer/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
