import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">验证您的邮箱</CardTitle>
          <CardDescription>
            我们已向您的邮箱发送了一封验证邮件
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">
            请检查您的收件箱并点击邮件中的验证链接来完成注册。
            如果没有收到邮件，请检查垃圾邮件文件夹。
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full gap-2">
              前往登录
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            返回首页
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
