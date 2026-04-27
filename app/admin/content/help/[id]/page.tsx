"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface HelpEditorPageProps {
  params: Promise<{ id: string }>
}

const categories = [
  { value: "订单相关", label: "订单相关" },
  { value: "支付相关", label: "支付相关" },
  { value: "物流配送", label: "物流配送" },
  { value: "退换货", label: "退换货" },
  { value: "账户管理", label: "账户管理" },
  { value: "其他问题", label: "其他问题" },
]

export default function HelpEditorPage({ params }: HelpEditorPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    sort_order: 0,
    status: "published",
  })

  useEffect(() => {
    if (!isNew) {
      loadArticle()
    }
  }, [id, isNew])

  async function loadArticle() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("help_articles")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      toast.error("文章不存在")
      router.push("/admin/content/help")
      return
    }

    setArticle({
      title: data.title,
      slug: data.slug,
      content: data.content || "",
      category: data.category || "",
      sort_order: data.sort_order || 0,
      status: data.status,
    })
    setLoading(false)
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "")
      || `help-${Date.now()}`
  }

  async function handleSave() {
    if (!article.title) {
      toast.error("请输入文章标题")
      return
    }

    setSaving(true)
    const supabase = createClient()

    const slug = article.slug || generateSlug(article.title)
    const articleData = {
      ...article,
      slug,
      updated_at: new Date().toISOString(),
    }

    if (isNew) {
      const { data, error } = await supabase
        .from("help_articles")
        .insert(articleData)
        .select()
        .single()

      if (error) {
        toast.error("保存失败: " + error.message)
      } else {
        toast.success("文章已创建")
        router.push(`/admin/content/help/${data.id}`)
      }
    } else {
      const { error } = await supabase
        .from("help_articles")
        .update(articleData)
        .eq("id", id)

      if (error) {
        toast.error("保存失败: " + error.message)
      } else {
        toast.success("文章已保存")
      }
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/help">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? "新建帮助文章" : "编辑帮助文章"}</h1>
            <p className="text-muted-foreground">编辑常见问题或帮助内容</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>文章内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>标题（问题）</Label>
                <Input
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                  placeholder="例如：如何追踪我的订单？"
                />
              </div>
              <div className="space-y-2">
                <Label>回答内容</Label>
                <Textarea
                  value={article.content}
                  onChange={(e) => setArticle({ ...article, content: e.target.value })}
                  placeholder="输入详细的回答内容..."
                  rows={12}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>文章设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>分类</Label>
                <Select
                  value={article.category}
                  onValueChange={(value) => setArticle({ ...article, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={article.status}
                  onValueChange={(value) => setArticle({ ...article, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">发布</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={article.sort_order}
                  onChange={(e) => setArticle({ ...article, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  数字越小排序越靠前
                </p>
              </div>
              <div className="space-y-2">
                <Label>URL 别名</Label>
                <Input
                  value={article.slug}
                  onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                  placeholder="auto-generated-slug"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
