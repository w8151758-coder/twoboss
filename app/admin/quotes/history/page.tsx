"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { History, Search, Eye, RotateCcw } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function QuoteHistoryPage() {
  const { locale } = useI18n()
  
  // Mock data for demonstration
  const historyItems = [
    {
      id: "1",
      quoteNo: "QT-2024001",
      version: "v3",
      customer: "ABC Trading Co.",
      originalAmount: 12500,
      revisedAmount: 11800,
      changeDate: "2024-01-15",
      changedBy: "张三",
      reason: "客户议价",
    },
    {
      id: "2",
      quoteNo: "QT-2024001",
      version: "v2",
      customer: "ABC Trading Co.",
      originalAmount: 13000,
      revisedAmount: 12500,
      changeDate: "2024-01-12",
      changedBy: "张三",
      reason: "批量折扣",
    },
    {
      id: "3",
      quoteNo: "QT-2024002",
      version: "v2",
      customer: "XYZ Import Ltd.",
      originalAmount: 8500,
      revisedAmount: 8200,
      changeDate: "2024-01-10",
      changedBy: "李四",
      reason: "运费调整",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "zh" ? "历史版本" : "History Versions"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "zh" ? "查看报价单的所有历史修改记录" : "View all historical revision records of quotations"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{locale === "zh" ? "修改历史" : "Revision History"}</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={locale === "zh" ? "搜索报价单号..." : "Search quote number..."} 
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{locale === "zh" ? "报价单号" : "Quote No."}</TableHead>
                <TableHead>{locale === "zh" ? "版本" : "Version"}</TableHead>
                <TableHead>{locale === "zh" ? "客户" : "Customer"}</TableHead>
                <TableHead className="text-right">{locale === "zh" ? "原金额" : "Original"}</TableHead>
                <TableHead className="text-right">{locale === "zh" ? "修改后" : "Revised"}</TableHead>
                <TableHead>{locale === "zh" ? "修改原因" : "Reason"}</TableHead>
                <TableHead>{locale === "zh" ? "修改人" : "Changed By"}</TableHead>
                <TableHead>{locale === "zh" ? "修改时间" : "Date"}</TableHead>
                <TableHead className="text-right">{locale === "zh" ? "操作" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.quoteNo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.version}</Badge>
                  </TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell className="text-right text-muted-foreground line-through">
                    ${item.originalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.revisedAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{item.changedBy}</TableCell>
                  <TableCell>{item.changeDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
