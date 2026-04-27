import { Card, CardContent } from "@/components/ui/card"
import { Building2, Users, Globe, Award, Factory, Truck, CheckCircle, MessageCircle } from "lucide-react"
import Image from "next/image"

export const metadata = {
  title: "关于我们 - 男装批发",
  description: "专业男装批发厂家，10年行业经验",
}

// 静态生成 + 1小时增量再生成
export const revalidate = 3600
export const dynamic = 'force-static'

const stats = [
  { label: "成立年份", value: "2014", suffix: "年" },
  { label: "服务客户", value: "5000", suffix: "+" },
  { label: "产品款式", value: "2000", suffix: "+" },
  { label: "出口国家", value: "50", suffix: "+" },
]

const advantages = [
  {
    icon: Factory,
    title: "工厂直供",
    description: "自有生产基地，省去中间环节，价格更优惠"
  },
  {
    icon: CheckCircle,
    title: "品质保障",
    description: "严格质检流程，确保每件产品符合标准"
  },
  {
    icon: Users,
    title: "专业团队",
    description: "10年行业经验，提供专业采购建议"
  },
  {
    icon: Truck,
    title: "快速发货",
    description: "现货3-5天发货，定制15-20天交付"
  },
  {
    icon: Globe,
    title: "全球配送",
    description: "支持国内外发货，多种物流方式可选"
  },
  {
    icon: Award,
    title: "定制服务",
    description: "支持LOGO定制、面料定制、款式修改"
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="relative bg-primary py-16 sm:py-24 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:32px_32px]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl">关于我们</h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            专注男装批发十余年，致力于为全球客户提供
            <br className="hidden md:block" />
            优质产品与专业服务
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8 sm:-mt-12 mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="text-center">
              <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-2 sm:px-6">
                <div className="text-xl sm:text-3xl font-bold text-primary">
                  {stat.value}
                  <span className="text-sm sm:text-lg">{stat.suffix}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Company Intro */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">公司简介</h2>
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                我们是一家专业的男装批发企业，成立于2014年，总部位于中国广州。
                经过十年的发展，已成为集设计、生产、销售于一体的综合性服装企业。
              </p>
              <p>
                公司拥有完善的供应链体系和专业的生产团队，产品涵盖T恤、衬衫、
                夹克、裤装等多个品类，年产能超过100万件。我们的产品远销欧美、
                东南亚、中东等50多个国家和地区。
              </p>
              <p>
                我们始终坚持"品质第一、客户至上"的经营理念，为客户提供
                高性价比的产品和专业的采购服务。无论您是批发商、零售商还是
                品牌采购商，我们都能满足您的需求。
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-muted-foreground/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="bg-card py-12 sm:py-20 border-y">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">我们的优势</h2>
          <p className="mt-2 sm:mt-4 text-center text-sm sm:text-base text-muted-foreground">
            选择我们的六大理由
          </p>
          <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {advantages.map((item, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:pt-6 sm:p-6">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 mb-2 sm:mb-4">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-lg">{item.title}</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-base text-muted-foreground line-clamp-2 sm:line-clamp-none">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">合作流程</h2>
        <p className="mt-2 sm:mt-4 text-center text-sm sm:text-base text-muted-foreground">
          简单四步，开启合作
        </p>
        <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4">
          {[
            { step: "01", title: "浏览选品", desc: "在产品目录中选择心仪款式" },
            { step: "02", title: "提交询价", desc: "加入询价车，填写规格数量" },
            { step: "03", title: "确认报价", desc: "收到报价单，协商确认价格" },
            { step: "04", title: "下单合作", desc: "签订合同，支付定金开始生产" },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-lg sm:text-2xl font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mt-2 sm:mt-4 font-semibold text-sm sm:text-lg">{item.title}</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-12 sm:py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-xl sm:text-3xl font-bold">开始合作</h2>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-primary-foreground/80">
            如果您对我们的产品感兴趣，欢迎随时联系我们
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
            >
              浏览产品
            </a>
            <a
              href="https://wa.me/8618888888888"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-white font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              WhatsApp 联系
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
