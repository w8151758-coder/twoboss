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

interface BlogEditorPageProps {
  params: Promise<{ id: string }>
}

export default function BlogEditorPage({ params }: BlogEditorPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [post, setPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    status: "draft",
  })

  useEffect(() => {
    if (!isNew) {
      loadPost()
    }
  }, [id, isNew])

  async function loadPost() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      toast.error("文章不存在")
      router.push("/admin/content/blog")
      return
    }

    setPost({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || "",
      content: data.content || "",
      cover_image: data.cover_image || "",
      status: data.status,
    })
    setLoading(false)
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "")
      || `post-${Date.now()}`
  }

  async function handleSave() {
    if (!post.title) {
      toast.error("请输入文章标题")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const slug = post.slug || generateSlug(post.title)
    const postData = {
      ...post,
      slug,
      author_id: user?.id,
      published_at: post.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (isNew) {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(postData)
        .select()
        .single()

      if (error) {
        toast.error("保存失败: " + error.message)
      } else {
        toast.success("文章已创建")
        router.push(`/admin/content/blog/${data.id}`)
      }
    } else {
      const { error } = await supabase
        .from("blog_posts")
        .update(postData)
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
          <Link href="/admin/content/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? "新建文章" : "编辑文章"}</h1>
            <p className="text-muted-foreground">撰写或编辑博客文章</p>
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
                <Label>标题</Label>
                <Input
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  placeholder="输入文章标题"
                />
              </div>
              <div className="space-y-2">
                <Label>摘要</Label>
                <Textarea
                  value={post.excerpt}
                  onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  placeholder="输入文章摘要（可选）"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>正文</Label>
                <Textarea
                  value={post.content}
                  onChange={(e) => setPost({ ...post, content: e.target.value })}
                  placeholder="输入文章正文..."
                  rows={15}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>发布设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={post.status}
                  onValueChange={(value) => setPost({ ...post, status: value })}
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
                <Label>URL 别名</Label>
                <Input
                  value={post.slug}
                  onChange={(e) => setPost({ ...post, slug: e.target.value })}
                  placeholder="auto-generated-slug"
                />
                <p className="text-xs text-muted-foreground">
                  留空将根据标题自动生成
                </p>
              </div>
              <div className="space-y-2">
                <Label>封面图片</Label>
                <Input
                  value={post.cover_image}
                  onChange={(e) => setPost({ ...post, cover_image: e.target.value })}
                  placeholder="输入图片 URL"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
