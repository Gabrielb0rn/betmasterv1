"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AuthCheck from "@/components/auth-check"
import { logoutUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { ArrowLeft, History, LogOut, Search, Trophy } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import Link from "next/link"

type BetHistoryItem = {
  id: string
  user_id: string
  user_name: string
  user_email: string
  game_type: string
  bet_amount: number
  result: number
  profit: number
  timestamp: string
}

export default function AdminBetHistoryPage() {
  const router = useRouter()
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadBetHistory() {
      try {
        const supabase = getSupabase()

        // Get bet history with user information
        const { data, error } = await supabase
          .from("bet_history")
          .select(`
            id,
            user_id,
            game_type,
            bet_amount,
            result,
            profit,
            timestamp,
            users:user_id (name, email)
          `)
          .order("timestamp", { ascending: false })

        if (error) {
          console.error("Error loading bet history:", error)
          return
        }

        // Format the data
        const formattedData = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          user_name: item.users?.name || "Unknown",
          user_email: item.users?.email || "Unknown",
          game_type: item.game_type,
          bet_amount: item.bet_amount,
          result: item.result,
          profit: item.profit,
          timestamp: item.timestamp,
        }))

        setBetHistory(formattedData)
      } catch (error) {
        console.error("Error loading bet history:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBetHistory()
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredBets = betHistory.filter(
    (bet) =>
      bet.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.game_type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatGameType = (type: string) => {
    switch (type) {
      case "mines":
        return "Mines"
      case "crash":
        return "Crash"
      case "plinko":
        return "Plinko"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  return (
    <AuthCheck adminOnly>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-purple-700" />
                <h1 className="text-xl font-bold text-purple-700">BetMaster Admin</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <History className="h-6 w-6 mr-2 text-purple-700" />
              Histórico de Apostas
            </h2>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Todas as Apostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por usuário ou tipo de jogo..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Jogo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Multiplicador</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          Nenhuma aposta encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBets.map((bet) => (
                        <TableRow key={bet.id}>
                          <TableCell>{bet.user_name}</TableCell>
                          <TableCell>{bet.user_email}</TableCell>
                          <TableCell>{formatGameType(bet.game_type)}</TableCell>
                          <TableCell>R$ {bet.bet_amount.toFixed(2)}</TableCell>
                          <TableCell>{bet.result.toFixed(2)}x</TableCell>
                          <TableCell>
                            <span
                              className={
                                bet.profit > 0
                                  ? "text-green-600 font-medium"
                                  : bet.profit < 0
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600"
                              }
                            >
                              {bet.profit > 0 ? "+" : ""}R$ {bet.profit.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(bet.timestamp).toLocaleString("pt-BR")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthCheck>
  )
}
