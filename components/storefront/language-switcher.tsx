"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStorefrontI18n } from "@/lib/i18n/storefront-context"
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  variant?: "default" | "compact"
  className?: string
}

export function LanguageSwitcher({ variant = "default", className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useStorefrontI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === "compact" ? "icon" : "sm"}
          className={cn(
            "gap-1.5 text-muted-foreground hover:text-foreground",
            variant === "compact" ? "h-8 w-8 sm:h-9 sm:w-9" : "h-8 sm:h-9 px-2 sm:px-3",
            className
          )}
        >
          <Globe className="h-4 w-4" />
          {variant === "default" && (
            <span className="hidden sm:inline text-xs sm:text-sm">
              {localeFlags[locale]} {localeNames[locale]}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc as Locale)}
            className={cn(
              "cursor-pointer gap-2",
              locale === loc && "bg-accent"
            )}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
