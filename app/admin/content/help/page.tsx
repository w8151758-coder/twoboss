"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, GripVertical } from "lucide-react"

interface HelpArticle {
  id: string
  title: string
  slug: string
  category: string | null
  sort_order: number
  status: string
  created_at: string
}

export default function HelpManagementPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from("help_articles")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data } = await query
    setArticles(data || [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    
    const supabase = createClient()
    const { error } = await supabase.from("help_articles").delete().eq("id", deleteId)
    
    if (error) {
      toast.error("删除失败")
    } else {
      toast.success("文章已删除")
      loadArticles()
    }
    setDeleteId(null)
  }

  async function toggleStatus(article: HelpArticle) {
    const supabase = createClient()
    const newStatus = article.status === "published" ? "draft" : "published"
    const { error } = await supabase
      .from("help_articles")
      .update({ status: newStatus })
      .eq("id", article.id)

    if (error) {
      toast.error("操作失败")
    } else {
      toast.success(newStatus === "published" ? "已发布" : "已设为草稿")
      loadArticles()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">帮助中心</h1>
          <p className="text-muted-foreground">管理常见问题和帮助文章</p>
        </div>
        <Link href="/admin/content/help/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建文章
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文章标题..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadArticles()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadArticles}>搜索</Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无文章
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.category || "-"}</TableCell>
                    <TableCell>{article.sort_order}</TableCell>
                    <TableCell>
                      <Badge
                        variant={article.status === "published" ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(article)}
                      >
                        {article.status === "published" ? "已发布" : "草稿"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/content/help/${article.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(article.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，文章将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
