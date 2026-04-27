"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Shield, Search, Plus, Edit, Trash2, Users } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PermissionsPage() {
  const { locale } = useI18n()
  
  const roles = [
    {
      id: "1",
      name: "admin",
      displayName: locale === "zh" ? "超级管理员" : "Super Admin",
      description: locale === "zh" ? "拥有所有权限" : "Full system access",
      userCount: 1,
      permissions: ["all"],
    },
    {
      id: "2",
      name: "sales",
      displayName: locale === "zh" ? "销售人员" : "Sales",
      description: locale === "zh" ? "管理询价、报价和客户" : "Manage inquiries, quotes and customers",
      userCount: 3,
      permissions: ["inquiries", "quotes", "customers", "orders"],
    },
    {
      id: "3",
      name: "product_manager",
      displayName: locale === "zh" ? "产品经理" : "Product Manager",
      description: locale === "zh" ? "管理产品目录和分类" : "Manage product catalog and categories",
      userCount: 2,
      permissions: ["products", "categories"],
    },
    {
      id: "4",
      name: "marketing",
      displayName: locale === "zh" ? "市场营销" : "Marketing",
      description: locale === "zh" ? "管理营销活动和内容" : "Manage campaigns and content",
      userCount: 1,
      permissions: ["campaigns", "blog"],
    },
  ]

  const users = [
    {
      id: "1",
      name: "张三",
      email: "zhangsan@example.com",
      role: "admin",
      lastLogin: "2024-01-15 14:30",
      status: "active",
    },
    {
      id: "2",
      name: "李四",
      email: "lisi@example.com",
      role: "sales",
      lastLogin: "2024-01-15 10:00",
      status: "active",
    },
    {
      id: "3",
      name: "王五",
      email: "wangwu@example.com",
      role: "product_manager",
      lastLogin: "2024-01-14 16:45",
      status: "active",
    },
    {
      id: "4",
      name: "赵六",
      email: "zhaoliu@example.com",
      role: "marketing",
      lastLogin: "2024-01-10 09:00",
      status: "inactive",
    },
  ]

  const getRoleInfo = (roleName: string) => {
    return roles.find(r => r.name === roleName)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "zh" ? "权限管理" : "Permission Management"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "zh" ? "管理用户角色和访问权限" : "Manage user roles and access permissions"}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {locale === "zh" ? "添加用户" : "Add User"}
        </Button>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {role.name}
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              <CardTitle className="text-base">{role.displayName}</CardTitle>
              <CardDescription className="text-xs">{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{role.userCount} {locale === "zh" ? "位用户" : "users"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{locale === "zh" ? "用户列表" : "User List"}</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={locale === "zh" ? "搜索用户..." : "Search users..."} 
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{locale === "zh" ? "用户" : "User"}</TableHead>
                <TableHead>{locale === "zh" ? "邮箱" : "Email"}</TableHead>
                <TableHead>{locale === "zh" ? "角色" : "Role"}</TableHead>
                <TableHead>{locale === "zh" ? "最后登录" : "Last Login"}</TableHead>
                <TableHead>{locale === "zh" ? "状态" : "Status"}</TableHead>
                <TableHead className="text-right">{locale === "zh" ? "操作" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role)
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleInfo?.displayName}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={user.status === "active"} />
                        <span className="text-sm">
                          {user.status === "active" 
                            ? (locale === "zh" ? "启用" : "Active")
                            : (locale === "zh" ? "禁用" : "Inactive")
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
