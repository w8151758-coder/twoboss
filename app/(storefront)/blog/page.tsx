import { createAdminClient } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "新闻博客 - 男装批发",
  description: "行业资讯、采购技巧、面料知识",
}

// 5分钟增量再生成
export const revalidate = 300

// 缓存博客文章查询
const getCachedPosts = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20)
    return data || []
  },
  ['blog-posts-list'],
  { revalidate: 300, tags: ['blog'] }
)

export default async function BlogPage() {
  const posts = await getCachedPosts()

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary py-10 sm:py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold">新闻博客</h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-primary-foreground/80">
            行业资讯、采购技巧、面料知识、批发攻略
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        {posts && posts.length > 0 ? (
          <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug || post.id}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                  {post.featured_image && (
                    <div className="relative aspect-video">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN') : '-'}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      阅读更多 <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">暂无文章</h3>
            <p className="mt-2 text-muted-foreground">
              我们正在准备精彩内容，敬请期待
            </p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-card py-10 sm:py-16 border-t">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">文章分类</h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <Badge variant="outline" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base cursor-pointer hover:bg-primary hover:text-primary-foreground">
              行业资讯
            </Badge>
            <Badge variant="outline" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base cursor-pointer hover:bg-primary hover:text-primary-foreground">
              采购技巧
            </Badge>
            <Badge variant="outline" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base cursor-pointer hover:bg-primary hover:text-primary-foreground">
              面料知识
            </Badge>
            <Badge variant="outline" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base cursor-pointer hover:bg-primary hover:text-primary-foreground">
              批发攻略
            </Badge>
            <Badge variant="outline" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base cursor-pointer hover:bg-primary hover:text-primary-foreground">
              新品推荐
            </Badge>
          </div>
        </div>
      </section>
    </div>
  )
}
