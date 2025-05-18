"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Gamepad2,
  Trophy,
  UserIcon,
  CreditCard,
  History,
  Settings,
  HelpCircle,
  LogOut,
  Bomb,
  Rocket,
  Droplets,
  CircleDashed,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { User as AuthUser } from "@/lib/auth"

interface SidebarProps {
  user?: Omit<AuthUser, "password"> | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AppSidebar({ user, open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  return (
    <SidebarProvider defaultOpen={open} onOpenChange={onOpenChange}>
      <SidebarComponent>
        <SidebarHeader className="border-b border-purple-800/20">
          <div className="flex items-center space-x-2 px-4 py-3">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span className="text-lg font-bold">BetMaster</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard" || pathname === "/"}>
                    <Link href="/dashboard">
                      <Home className="h-4 w-4" />
                      <span>Início</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible defaultOpen={pathname.startsWith("/jogos")}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={pathname.startsWith("/jogos")}>
                        <Gamepad2 className="h-4 w-4" />
                        <span>Jogos</span>
                        <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === "/jogos/mines"}>
                            <Link href="/jogos/mines">
                              <Bomb className="h-4 w-4 mr-2" />
                              Mines
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === "/jogos/crash"}>
                            <Link href="/jogos/crash">
                              <Rocket className="h-4 w-4 mr-2" />
                              Crash
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === "/jogos/plinko"}>
                            <Link href="/jogos/plinko">
                              <Droplets className="h-4 w-4 mr-2" />
                              Plinko
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === "/jogos/roleta"}>
                            <Link href="/jogos/roleta">
                              <CircleDashed className="h-4 w-4 mr-2" />
                              Roleta
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/perfil"}>
                    <Link href="/perfil">
                      <UserIcon className="h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/deposito"}>
                    <Link href="/deposito">
                      <CreditCard className="h-4 w-4" />
                      <span>Depósito</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/historico"}>
                    <Link href="/historico">
                      <History className="h-4 w-4" />
                      <span>Histórico</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Suporte</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/ajuda"}>
                    <Link href="/ajuda">
                      <HelpCircle className="h-4 w-4" />
                      <span>Ajuda</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/configuracoes"}>
                    <Link href="/configuracoes">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-purple-800/20">
          {user && (
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{user.name.split(" ")[0]}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          )}
        </SidebarFooter>
      </SidebarComponent>
    </SidebarProvider>
  )
}
