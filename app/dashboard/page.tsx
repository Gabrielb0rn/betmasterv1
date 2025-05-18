"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { getUserBetHistory, type BetHistory } from "@/lib/games"
import { DollarSign, GamepadIcon, History, Trophy, UserIcon, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [betHistory, setBetHistory] = useState<BetHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWon: 0,
    totalLost: 0,
    winRate: 0,
    biggestWin: 0,
    biggestLoss: 0,
  })

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

    async function loadBetHistory() {
      try {
        const result = await getUserBetHistory()
        if (result.success) {
          setBetHistory(result.bets)
          calculateStats(result.bets)
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

  const calculateStats = (bets: BetHistory[]) => {
    if (bets.length === 0) return

    const totalBets = bets.length
    const wins = bets.filter((bet) => bet.profit > 0)
    const losses = bets.filter((bet) => bet.profit <= 0)

    const totalWon = wins.reduce((sum, bet) => sum + bet.profit, 0)
    const totalLost = Math.abs(losses.reduce((sum, bet) => sum + bet.profit, 0))

    const winRate = (wins.length / totalBets) * 100

    const biggestWin = wins.length > 0 ? Math.max(...wins.map((bet) => bet.profit)) : 0

    const biggestLoss = losses.length > 0 ? Math.abs(Math.min(...losses.map((bet) => bet.profit))) : 0

    setStats({
      totalBets,
      totalWon,
      totalLost,
      winRate,
      biggestWin,
      biggestLoss,
    })
  }

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <MainNav />

        <main className="container mx-auto px-4 py-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Meu Dashboard</h1>
              <p className="text-muted-foreground">Bem-vindo de volta, {user?.name}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/jogos">
                <Button className="bg-primary hover:bg-primary/90 flex items-center">
                  <GamepadIcon className="h-4 w-4 mr-2" />
                  Ir para Jogos
                </Button>
              </Link>
            </div>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-primary" />
                    Nível
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-primary">{user?.level || 1}</div>
                    <p className="text-sm text-muted-foreground mt-2">Iniciante</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{user?.xp || 0} XP</span>
                        <span>100 XP</span>
                      </div>
                      <Progress value={(user?.xp || 0) % 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-accent" />
                    Saldo Disponível
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-accent">R$ {user?.balance.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground mt-2">Seu saldo atual para apostas</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-success" />
                    Total Ganho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-success">R$ {stats.totalWon.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground mt-2">Taxa de vitória: {stats.winRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-secondary" />
                    Apostas Realizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-secondary">{stats.totalBets}</div>
                    <p className="text-sm text-muted-foreground mt-2">Total de apostas feitas</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-0 shadow-md mb-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <History className="h-5 w-5 mr-2 text-primary" />
                  Histórico de Apostas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
                  </div>
                ) : betHistory.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jogo</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Multiplicador</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {betHistory.slice(0, 5).map((bet) => (
                          <TableRow key={bet.id}>
                            <TableCell>{formatGameType(bet.gameType)}</TableCell>
                            <TableCell>R$ {bet.betAmount.toFixed(2)}</TableCell>
                            <TableCell>{bet.result.toFixed(2)}x</TableCell>
                            <TableCell>
                              <span
                                className={
                                  bet.profit > 0
                                    ? "text-success font-medium"
                                    : bet.profit < 0
                                      ? "text-destructive font-medium"
                                      : "text-muted-foreground"
                                }
                              >
                                {bet.profit > 0 ? "+" : ""}R$ {bet.profit.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(bet.timestamp).toLocaleString("pt-BR")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Você ainda não realizou nenhuma aposta.</p>
                    <div className="mt-4">
                      <Link href="/jogos">
                        <Button className="bg-primary hover:bg-primary/90">Começar a Apostar</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {betHistory.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link href="/historico">
                      <Button variant="outline">Ver histórico completo</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-accent" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Desempenho</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Taxa de Vitória</span>
                          <span className="text-sm font-medium">{stats.winRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={stats.winRate} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-success" />
                          <span>Maior Ganho</span>
                        </div>
                        <span className="font-medium text-success">R$ {stats.biggestWin.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center">
                          <TrendingDown className="h-5 w-5 mr-2 text-destructive" />
                          <span>Maior Perda</span>
                        </div>
                        <span className="font-medium text-destructive">R$ {stats.biggestLoss.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Jogos Favoritos</h3>
                    <div className="space-y-4">
                      {betHistory.length > 0 ? (
                        <>
                          {/* Aqui você pode adicionar gráficos ou estatísticas de jogos favoritos */}
                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <span>Crash</span>
                            <span className="font-medium">32 jogos</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <span>Mines</span>
                            <span className="font-medium">28 jogos</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <span>Plinko</span>
                            <span className="font-medium">15 jogos</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>Jogue mais para ver suas estatísticas</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </AuthCheck>
  )
}
