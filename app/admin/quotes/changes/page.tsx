"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingDown, TrendingUp, Search, ArrowRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function QuoteChangesPage() {
  const { locale } = useI18n()
  
  // Mock data for demonstration
  const changes = [
    {
      id: "1",
      quoteNo: "QT-2024001",
      customer: "ABC Trading Co.",
      product: "Premium Cotton T-Shirt",
      sku: "TS-001",
      oldPrice: 8.50,
      newPrice: 7.80,
      changePercent: -8.2,
      reason: "批量订单优惠",
      date: "2024-01-15",
      changedBy: "张三",
    },
    {
      id: "2",
      quoteNo: "QT-2024002",
      customer: "XYZ Import Ltd.",
      product: "Classic Polo Shirt",
      sku: "PS-002",
      oldPrice: 12.00,
      newPrice: 11.50,
      changePercent: -4.2,
      reason: "长期合作价",
      date: "2024-01-14",
      changedBy: "李四",
    },
    {
      id: "3",
      quoteNo: "QT-2024003",
      customer: "Global Fashion Inc.",
      product: "Slim Fit Jeans",
      sku: "JN-003",
      oldPrice: 18.00,
      newPrice: 19.50,
      changePercent: 8.3,
      reason: "面料成本上涨",
      date: "2024-01-13",
      changedBy: "张三",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "zh" ? "改价记录" : "Price Changes"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "zh" ? "追踪所有产品价格调整记录" : "Track all product price adjustment records"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "本月降价次数" : "Price Drops This Month"}
                </p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "本月涨价次数" : "Price Increases This Month"}
                </p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "平均调价幅度" : "Average Change"}
                </p>
                <p className="text-2xl font-bold">-5.2%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{locale === "zh" ? "价格调整明细" : "Price Adjustment Details"}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={locale === "zh" ? "搜索产品或客户..." : "Search product or customer..."} 
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{locale === "zh" ? "报价单" : "Quote"}</TableHead>
                <TableHead>{locale === "zh" ? "客户" : "Customer"}</TableHead>
                <TableHead>{locale === "zh" ? "产品" : "Product"}</TableHead>
                <TableHead className="text-right">{locale === "zh" ? "价格变动" : "Price Change"}</TableHead>
                <TableHead className="text-right">{locale === "zh" ? "变动幅度" : "Change %"}</TableHead>
                <TableHead>{locale === "zh" ? "原因" : "Reason"}</TableHead>
                <TableHead>{locale === "zh" ? "操作人" : "Changed By"}</TableHead>
                <TableHead>{locale === "zh" ? "日期" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.quoteNo}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.product}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-muted-foreground">${item.oldPrice.toFixed(2)}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">${item.newPrice.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.changePercent < 0 ? "default" : "destructive"}>
                      {item.changePercent > 0 ? "+" : ""}{item.changePercent}%
                    </Badge>
                  </TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{item.changedBy}</TableCell>
                  <TableCell>{item.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
