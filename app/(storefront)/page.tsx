import { HomePage } from "@/components/storefront/home-page"

// 首页5分钟重新验证
export const revalidate = 300

export default function Page() {
  return <HomePage />
}
