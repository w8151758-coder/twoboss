import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">认证失败</CardTitle>
          <CardDescription>
            认证过程中出现错误
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">
            可能是验证链接已过期或无效。请尝试重新登录或注册。
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">重新登录</Button>
          </Link>
          <Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-primary">
            重新注册
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
