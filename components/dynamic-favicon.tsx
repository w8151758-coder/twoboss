"use client"

import { useEffect } from "react"
import { useSiteSettings } from "@/lib/hooks/use-site-settings"

export function DynamicFavicon() {
  const { settings } = useSiteSettings()

  useEffect(() => {
    if (settings.favicon_url) {
      // 更新favicon
      const updateFavicon = (selector: string, href: string) => {
        let link = document.querySelector(selector) as HTMLLinkElement
        if (link) {
          link.href = href
        } else {
          link = document.createElement("link")
          link.rel = "icon"
          link.href = href
          document.head.appendChild(link)
        }
      }

      // 更新所有favicon链接
      updateFavicon('link[rel="icon"]', settings.favicon_url)
      updateFavicon('link[rel="shortcut icon"]', settings.favicon_url)
      
      // 也更新apple-touch-icon如果没有专门设置
      const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
      if (!appleIcon) {
        const link = document.createElement("link")
        link.rel = "apple-touch-icon"
        link.href = settings.favicon_url
        document.head.appendChild(link)
      }
    }

    // 更新页面标题
    if (settings.site_name) {
      const titleParts = document.title.split(" | ")
      if (titleParts.length > 1) {
        document.title = `${titleParts[0]} | ${settings.site_name}`
      }
    }
  }, [settings.favicon_url, settings.site_name])

  return null
}
