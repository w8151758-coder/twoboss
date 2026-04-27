"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, type ComponentProps } from "react"

type PrefetchLinkProps = ComponentProps<typeof Link> & {
  prefetchOnHover?: boolean
}

/**
 * 增强的Link组件，支持hover时预取
 */
export function PrefetchLink({ 
  prefetchOnHover = true, 
  children, 
  ...props 
}: PrefetchLinkProps) {
  const router = useRouter()
  
  const handleMouseEnter = useCallback(() => {
    if (prefetchOnHover && typeof props.href === 'string') {
      router.prefetch(props.href)
    }
  }, [router, props.href, prefetchOnHover])

  return (
    <Link 
      {...props} 
      onMouseEnter={handleMouseEnter}
      prefetch={false} // 禁用自动预取，改用hover预取
    >
      {children}
    </Link>
  )
}
