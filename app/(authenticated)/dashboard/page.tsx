"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getGameUser } from "@/lib/gamification"
import { getUserBetHistory, type BetHistory } from "@/lib/games"
import { useRouter } from "next/navigation"
import {
  DollarSign,
  GamepadIcon,
  History,
  Trophy,
  UserIcon,
  ChevronRight,
  Bomb,
  Rocket,
  Droplets,
  CircleDashed,
  Award,
  Zap,
  Coins,
} from "lucide-react"
import { motion } from "framer-motion"
import { StatsCard } from "@/components/stats-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { LevelProgress } from "@/components/level-progress"
import type { GameUser } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<GameUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [betHistory, setBetHistory] = useState<BetHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getGameUser()
        setUser(userData)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    async function loadBetHistory() {
      try {
        const result = await getUserBetHistory()
        if (result.success) {
          setBetHistory(result.bets)
        }
      } catch (error) {
        console.error("Erro ao carregar histórico de apostas:", error)
      } finally {
        setHistoryLoading(false)
      }
    }

    loadUser()
    loadBetHistory()
  }, [])

  const formatGameType = (type: string) => {
    switch (type) {
      case "mines":
        return "Mines"
      case "crash":
        return "Crash"
      case "plinko":
        return "Plinko"
      case "roleta":
        return "Roleta"
      default:
        return type
    }
  }

  // Calcular estatísticas
  const totalBets = betHistory.length
  const totalWon = betHistory.filter((bet) => bet.profit > 0).length
  const totalLost = betHistory.filter((bet) => bet.profit < 0).length
  const winRate = totalBets > 0 ? Math.round((totalWon / totalBets) * 100) : 0

  const totalProfit = betHistory.reduce((sum, bet) => sum + bet.profit, 0)
  const biggestWin = betHistory.length > 0 ? Math.max(...betHistory.map((bet) => (bet.profit > 0 ? bet.profit : 0))) : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Não foi possível carregar os dados do usuário.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo de volta, {user?.name.split(" ")[0]}!</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/jogos">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <GamepadIcon className="mr-2 h-4 w-4" /> Jogar Agora
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Saldo Disponível"
          value={`R$ ${user?.balance.toFixed(2)}`}
          description="Seu saldo atual para apostas"
          icon={DollarSign}
          iconColor="text-green-600"
        />

        <StatsCard
          title="Fichas"
          value={user.tokens}
          description="Moeda virtual para apostas especiais"
          icon={Coins}
          iconColor="text-amber-600"
        />

        <StatsCard
          title="Nível"
          value={user.level.level}
          description={`${user.level.currentXP}/${user.level.requiredXP} XP para o próximo nível`}
          icon={Zap}
          iconColor="text-purple-600"
        />

        <StatsCard
          title="Conquistas"
          value={`${user.achievements.length}/10`}
          description="Desbloqueie mais jogando"
          icon={Award}
          iconColor="text-blue-600"
          trend={
            user.achievements.length > 0
              ? {
                  value: Math.round((user.achievements.length / 10) * 100),
                  isPositive: true,
                }
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-none shadow-lg overflow-hidden h-full">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
              <CardTitle className="text-lg flex items-center">
                <History className="h-5 w-5 mr-2 text-yellow-300" />
                Histórico de Apostas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {historyLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="mt-2 text-gray-500">Carregando histórico...</p>
                </div>
              ) : betHistory.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Jogo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Multiplicador</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {betHistory.slice(0, 5).map((bet, index) => (
                        <motion.tr
                          key={bet.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b"
                        >
                          <TableCell className="font-medium">{formatGameType(bet.gameType)}</TableCell>
                          <TableCell>R$ {bet.betAmount.toFixed(2)}</TableCell>
                          <TableCell>{bet.result.toFixed(2)}x</TableCell>
                          <TableCell>
                            <span
                              className={
                                bet.profit > 0
                                  ? "text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full"
                                  : bet.profit < 0
                                    ? "text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full"
                                    : "text-gray-600"
                              }
                            >
                              {bet.profit > 0 ? "+" : ""}R$ {bet.profit.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(bet.timestamp).toLocaleString("pt-BR")}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-6">Você ainda não realizou nenhuma aposta.</p>
                  <Link href="/jogos">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md">
                      Começar a Apostar
                    </Button>
                  </Link>
                </div>
              )}

              {betHistory.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" className="text-purple-700 border-purple-200">
                    Ver Histórico Completo <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-none shadow-lg overflow-hidden h-full">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-300" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Nível {user.level.level}</h3>
                  <LevelProgress level={user.level} />
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Conquistas Recentes</h3>
                  {user.achievements.length > 0 ? (
                    <div className="space-y-3">
                      {user.achievements.slice(0, 3).map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100"
                        >
                          <div className="bg-yellow-500 p-2 rounded-full mr-3 text-white">
                            <Award className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-amber-800">{achievement.name}</div>
                            <div className="text-xs text-gray-500">{achievement.description}</div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <Link href="/perfil">
                          <Button variant="link" className="text-blue-600">
                            Ver todas as conquistas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Award className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 mb-2">Nenhuma conquista desbloqueada ainda.</p>
                      <p className="text-xs text-gray-400">Jogue mais para desbloquear conquistas!</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link href="/perfil">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      <UserIcon className="mr-2 h-4 w-4" /> Ver Perfil Completo
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="pb-2 bg-gradient-to-r from-green-600 to-green-800 text-white">
              <CardTitle className="text-lg flex items-center">
                <GamepadIcon className="h-5 w-5 mr-2 text-yellow-300" />
                Jogos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/jogos/mines">
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex justify-between items-center mb-2">
                      <Bomb className="h-8 w-8 text-yellow-300" />
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Popular</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">Mines</h3>
                    <p className="text-sm text-white/80">Até 45x de multiplicador!</p>
                  </div>
                </Link>

                <Link href="/jogos/crash">
                  <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex justify-between items-center mb-2">
                      <Rocket className="h-8 w-8 text-yellow-300" />
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Hot</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">Crash</h3>
                    <p className="text-sm text-white/80">Multiplicadores ilimitados!</p>
                  </div>
                </Link>

                <Link href="/jogos/plinko">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex justify-between items-center mb-2">
                      <Droplets className="h-8 w-8 text-yellow-300" />
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Novo</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">Plinko</h3>
                    <p className="text-sm text-white/80">Divertido e fácil de jogar!</p>
                  </div>
                </Link>

                <Link href="/jogos/roleta">
                  <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex justify-between items-center mb-2">
                      <CircleDashed className="h-8 w-8 text-yellow-300" />
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Clássico</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">Roleta</h3>
                    <p className="text-sm text-white/80">Aposte e ganhe até 36x!</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
