"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Award, Coins, Trophy, User, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { LevelProgress } from "@/components/level-progress"
import { AchievementsShowcase } from "@/components/achievements-showcase"
import { Leaderboard } from "@/components/leaderboard"
import { TokenExchangeComponent } from "@/components/token-exchange"
import { getGameUser, getAvailableAchievements, getLeaderboard, getTokenExchanges } from "@/lib/gamification"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { GameUser, Achievement, LeaderboardEntry, TokenExchange } from "@/lib/types"

export default function PerfilPage() {
  const [user, setUser] = useState<GameUser | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [tokenItems, setTokenItems] = useState<TokenExchange[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await getGameUser()
        const allAchievements = getAvailableAchievements()
        const leaderboardData = await getLeaderboard()
        const tokenExchanges = getTokenExchanges()

        setUser(userData)
        setAchievements(allAchievements)
        setLeaderboard(leaderboardData)
        setTokenItems(tokenExchanges)
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie seu perfil e acompanhe seu progresso</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-lg overflow-hidden h-full">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-yellow-300" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Nível</span>
                  </div>
                  <span className="font-bold text-purple-700">{user.level.level}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Coins className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="text-gray-700">Fichas</span>
                  </div>
                  <span className="font-bold text-amber-700">{user.tokens}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">Conquistas</span>
                  </div>
                  <span className="font-bold text-blue-700">{user.achievements.length}/10</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-gray-700">Ranking</span>
                  </div>
                  <span className="font-bold text-yellow-700">#42</span>
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="md:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
              >
                <Award className="h-4 w-4 mr-2" />
                Conquistas
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Classificação
              </TabsTrigger>
              <TabsTrigger
                value="tokens"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"
              >
                <Coins className="h-4 w-4 mr-2" />
                Loja de Fichas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="mt-0">
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Minhas Conquistas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <LevelProgress level={user.level} />
                  </div>

                  <AchievementsShowcase achievements={user.achievements} availableAchievements={achievements} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-0">
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                    Classificação Global
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Leaderboard entries={leaderboard} title="" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="mt-0">
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-amber-600" />
                    Loja de Recompensas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <TokenExchangeComponent
                    items={tokenItems}
                    userTokens={user.tokens}
                    onExchange={(success) => {
                      if (success) {
                        // Em produção, recarregaria os dados do usuário
                        console.log("Troca realizada com sucesso")
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
