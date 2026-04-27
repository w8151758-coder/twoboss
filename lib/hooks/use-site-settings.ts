"use client"

import useSWR from "swr"

interface SiteSettings {
  site_name: string
  logo_url: string | null
  favicon_url: string | null
  company_name: string
  company_phone: string
  company_address: string
  whatsapp_number: string
}

const defaultSettings: SiteSettings = {
  site_name: "MenswearWholesale",
  logo_url: null,
  favicon_url: null,
  company_name: "",
  company_phone: "",
  company_address: "",
  whatsapp_number: "8618888888888",
}

const fetcher = async (url: string): Promise<SiteSettings> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function useSiteSettings() {
  const { data, error, isLoading } = useSWR<SiteSettings>(
    "/api/site-settings",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5分钟内不重复请求
      fallbackData: defaultSettings,
    }
  )

  return {
    settings: data || defaultSettings,
    isLoading,
    error,
  }
}
