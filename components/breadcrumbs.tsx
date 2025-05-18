"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbsProps {
  className?: string
  homeHref?: string
  items?: {
    label: string
    href?: string
  }[]
}

export function Breadcrumbs({ className, homeHref = "/dashboard", items = [] }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Gerar breadcrumbs automaticamente com base no pathname se não forem fornecidos
  const generatedItems = items.length > 0 ? items : generateBreadcrumbs(pathname, homeHref)

  return (
    <nav aria-label="Breadcrumbs" className={cn("flex items-center text-sm text-gray-500", className)}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link href={homeHref} className="flex items-center hover:text-purple-700 transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Início</span>
          </Link>
        </li>

        {generatedItems.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {item.href ? (
              <Link href={item.href} className="hover:text-purple-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Função para gerar breadcrumbs automaticamente com base no pathname
function generateBreadcrumbs(pathname: string, homeHref: string) {
  if (pathname === homeHref || pathname === "/") {
    return []
  }

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = []

  // Mapeamento de segmentos para nomes mais amigáveis
  const segmentLabels: Record<string, string> = {
    dashboard: "Dashboard",
    jogos: "Jogos",
    mines: "Mines",
    crash: "Crash",
    plinko: "Plinko",
    roleta: "Roleta",
    auth: "Autenticação",
    login: "Login",
    register: "Cadastro",
    admin: "Admin",
    perfil: "Perfil",
    deposito: "Depósito",
    saque: "Saque",
  }

  let currentPath = ""

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Se for o último segmento, não adiciona href
    if (i === segments.length - 1) {
      breadcrumbs.push({
        label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      })
    } else {
      breadcrumbs.push({
        label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      })
    }
  }

  return breadcrumbs
}
