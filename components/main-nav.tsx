"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Trophy, Menu, X, Sun, Moon, LogOut, User, Home, GamepadIcon, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { getCurrentUser, logoutUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/jogos", label: "Jogos", icon: GamepadIcon },
    { href: "/dashboard/estatisticas", label: "Estatísticas", icon: BarChart3 },
    { href: "/perfil", label: "Perfil", icon: User },
  ]

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">BetMaster</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user && (
              <>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant={isActive(item.href) ? "default" : "ghost"} className="relative px-4 py-2">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                      {isActive(item.href) && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          layoutId="navbar-indicator"
                        />
                      )}
                    </Button>
                  </Link>
                ))}
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center ml-2">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Cadastrar</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center py-4">
                  <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold text-primary">BetMaster</span>
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>

                <div className="flex flex-col space-y-3 py-4">
                  {user ? (
                    <>
                      {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <Button variant={isActive(item.href) ? "default" : "ghost"} className="w-full justify-start">
                            <item.icon className="mr-2 h-5 w-5" />
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full justify-start">
                          Entrar
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button className="w-full justify-start">Cadastrar</Button>
                      </Link>
                    </>
                  )}
                </div>

                <div className="mt-auto flex flex-col space-y-3 py-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="mr-2 h-5 w-5" />
                        Modo Claro
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-5 w-5" />
                        Modo Escuro
                      </>
                    )}
                  </Button>

                  {user && (
                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-2 h-5 w-5" />
                      Sair
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
