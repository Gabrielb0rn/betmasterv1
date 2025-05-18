"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Gamepad2, Home, LogOut, Coins, Menu, User } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logoutUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { User as UserType } from "@/lib/auth"
import { useState } from "react"

interface MainNavProps {
  user?: Omit<UserType, "password"> | null
  showBalance?: boolean
  onOpenSidebar?: () => void
}

export function MainNav({ user, showBalance = true, onOpenSidebar }: MainNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  const navItems = [
    {
      name: "Início",
      href: user ? "/dashboard" : "/",
      icon: <Home className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard" || pathname === "/",
    },
    {
      name: "Jogos",
      href: "/jogos",
      icon: <Gamepad2 className="h-4 w-4 mr-2" />,
      active: pathname.startsWith("/jogos"),
    },
    {
      name: "Perfil",
      href: "/perfil",
      icon: <User className="h-4 w-4 mr-2" />,
      active: pathname.startsWith("/perfil"),
    },
  ]

  return (
    <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {onOpenSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSidebar}
                className="text-white hover:bg-white/10 mr-2 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            )}

            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <Trophy className="h-7 w-7 text-yellow-300" />
              <span className="text-xl font-bold text-white">BetMaster</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors relative",
                  item.active ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                {item.icon}
                {item.name}
                {item.active && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-300 rounded-full"
                    layoutId="activeNav"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {user && showBalance && (
              <motion.div
                className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
              >
                <Coins className="h-4 w-4 text-yellow-300" />
                <span className="font-medium">R$ {user?.balance.toFixed(2)}</span>
              </motion.div>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm">
                  Olá, <span className="font-medium">{user?.name.split(" ")[0]}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-purple-900 transition-colors"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-white text-purple-900 hover:bg-purple-100 transition-colors">Cadastrar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-purple-900 py-2">
          <nav className="container mx-auto px-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors",
                  item.active ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
