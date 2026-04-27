import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, Package, FileText, Truck, CreditCard, RefreshCw, HelpCircle, Mail, Phone } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "帮助中心 - 男装批发",
  description: "常见问题、采购指南、售后服务",
}

// 静态生成 + 1小时增量再生成
export const revalidate = 3600
export const dynamic = 'force-static'

const faqCategories = [
  {
    icon: Package,
    title: "产品相关",
    faqs: [
      {
        question: "起订量是多少？",
        answer: "每款产品起订量为50件，支持混色混码。不同款式可以分开计算起订量。"
      },
      {
        question: "可以定制LOGO吗？",
        answer: "支持定制LOGO，包括刺绣、印花、织唛等多种工艺。定制需额外收取加工费，具体费用请在询价时说明需求。"
      },
      {
        question: "面料成分如何确认？",
        answer: "产品详情页有标注面料成分。如需更详细的面料信息或寄送样品，请联系客服。"
      },
      {
        question: "可以寄送样品吗？",
        answer: "可以提供样品，样品费用根据产品不同而定，下单后可抵扣。样品运费由客户承担。"
      }
    ]
  },
  {
    icon: FileText,
    title: "询价与报价",
    faqs: [
      {
        question: "如何获取报价？",
        answer: "选择您需要的产品加入询价车，填写规格数量后提交询价。我们的销售人员会在24小时内发送报价单。"
      },
      {
        question: "报价单有效期多久？",
        answer: "报价单有效期通常为7天，具体以报价单上标注为准。超期后价格可能有调整，需重新询价。"
      },
      {
        question: "可以议价吗？",
        answer: "大批量订单可以协商优惠价格，欢迎通过WhatsApp或电话与销售人员沟通。"
      },
      {
        question: "支持哪些货币结算？",
        answer: "支持人民币、美元、欧元等主流货币结算，汇率以下单当日为准。"
      }
    ]
  },
  {
    icon: CreditCard,
    title: "付款方式",
    faqs: [
      {
        question: "支持哪些付款方式？",
        answer: "支持银行转账（T/T）、支付宝、微信支付、PayPal等多种付款方式。大额订单推荐银行转账。"
      },
      {
        question: "需要付定金吗？",
        answer: "首次合作需支付50%定金，发货前付清尾款。长期合作客户可协商账期。"
      },
      {
        question: "发票如何开具？",
        answer: "支持增值税普通发票和专用发票，请在下单时说明开票信息。"
      }
    ]
  },
  {
    icon: Truck,
    title: "物流发货",
    faqs: [
      {
        question: "发货周期多长？",
        answer: "现货产品3-5个工作日发货，定制产品15-20个工作日。具体以订单确认为准。"
      },
      {
        question: "支持哪些物流方式？",
        answer: "国内支持顺丰、圆通等快递，大货支持物流专线。国际支持DHL、FedEx、海运等。"
      },
      {
        question: "运费如何计算？",
        answer: "国内订单满5000元包邮，未满按实际收取。国际订单运费根据目的地和重量单独报价。"
      },
      {
        question: "可以指定物流公司吗？",
        answer: "可以指定物流公司，如有特殊要求请在下单时备注说明。"
      }
    ]
  },
  {
    icon: RefreshCw,
    title: "售后服务",
    faqs: [
      {
        question: "收到货后发现质量问题怎么办？",
        answer: "收货后7天内发现质量问题，请拍照反馈，经确认后我们将免费补发或退款。"
      },
      {
        question: "可以退换货吗？",
        answer: "非质量问题的退换货需要在收货7天内提出，产品需保持原样未使用，退换货运费由客户承担。"
      },
      {
        question: "如何联系售后？",
        answer: "可以通过WhatsApp、电话或邮件联系我们的客服团队，工作时间内会尽快响应。"
      }
    ]
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary py-10 sm:py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold">帮助中心</h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-primary-foreground/80">
            常见问题解答，助您轻松采购
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <div className="mx-auto mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">采购指南</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">新手入门教程</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <div className="mx-auto mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">产品目录</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">浏览全部产品</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <div className="mx-auto mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">在线咨询</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">WhatsApp联系</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <div className="mx-auto mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">提交工单</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">问题反馈</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">常见问题</h2>
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
          {faqCategories.map((category, idx) => (
            <Card key={idx}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <category.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`item-${faqIdx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-card py-10 sm:py-16 border-t mt-6 sm:mt-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">没有找到答案？</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            欢迎通过以下方式联系我们的客服团队
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/8618888888888"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              WhatsApp 咨询
            </a>
            <a
              href="mailto:support@example.com"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              发送邮件
            </a>
            <a
              href="tel:+8618888888888"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium hover:bg-muted transition-colors"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              电话咨询
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
