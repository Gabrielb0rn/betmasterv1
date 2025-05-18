"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { placeBet } from "@/lib/games"
import { ArrowLeft, Coins, Rocket, TrendingUp, History, AlertTriangle, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function CrashPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<"waiting" | "running" | "crashed">("waiting")
  const [betAmount, setBetAmount] = useState(10)
  const [inputBetAmount, setInputBetAmount] = useState("10")
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(1.0)
  const [hasBet, setHasBet] = useState(false)
  const [hasCashedOut, setHasCashedOut] = useState(false)
  const [gameHistory, setGameHistory] = useState<{ multiplier: number; color: string }[]>([])
  const [countdown, setCountdown] = useState(5)
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)
  const [rocketPosition, setRocketPosition] = useState(0)
  const [showCashedOutMessage, setShowCashedOutMessage] = useState(false)
  const graphRef = useRef<HTMLDivElement>(null)

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
  }, [])

  // Iniciar contagem regressiva quando o jogo estiver em espera
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameState === "waiting" && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (gameState === "waiting" && countdown === 0) {
      startGame()
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [gameState, countdown])

  // Atualizar posição do foguete com base no multiplicador
  useEffect(() => {
    if (gameState === "running") {
      // Calcular posição do foguete (0-100) com base no multiplicador
      // Usar uma escala logarítmica para que o movimento seja mais interessante
      const maxHeight = 80 // Altura máxima em porcentagem
      const position = Math.min(maxHeight, Math.log10(currentMultiplier) * 40)
      setRocketPosition(position)
    } else {
      setRocketPosition(0)
    }
  }, [currentMultiplier, gameState])

  // Desenhar o gráfico do crash
  useEffect(() => {
    if (gameState === "running" && graphRef.current) {
      const graph = graphRef.current
      const height = graph.clientHeight
      const width = graph.clientWidth

      // Limpar gráfico anterior
      while (graph.firstChild) {
        graph.removeChild(graph.firstChild)
      }

      // Criar SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", "100%")
      svg.setAttribute("height", "100%")
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
      svg.setAttribute("preserveAspectRatio", "none")

      // Criar caminho para a linha
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

      // Calcular pontos para a curva
      const startX = 0
      const startY = height
      const endX = width * (Math.min(currentMultiplier, 10) / 10)
      const endY = height - (height * rocketPosition) / 100

      // Criar caminho da curva
      const d = `M ${startX},${startY} Q ${endX / 2},${startY} ${endX},${endY}`

      path.setAttribute("d", d)
      path.setAttribute("fill", "none")
      path.setAttribute("stroke", "#9333ea")
      path.setAttribute("stroke-width", "3")

      svg.appendChild(path)
      graph.appendChild(svg)
    }
  }, [currentMultiplier, gameState, rocketPosition])

  // Esconder mensagem de cashout após 3 segundos
  useEffect(() => {
    if (showCashedOutMessage) {
      const timer = setTimeout(() => {
        setShowCashedOutMessage(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showCashedOutMessage])

  // Função local para gerar ponto de crash
  const generateCrashPointLocal = (): number => {
    const random = Math.random()

    if (random < 0.7) {
      return 1 + Math.random()
    } else if (random < 0.9) {
      return 2 + Math.random() * 3
    } else if (random < 0.98) {
      return 5 + Math.random() * 15
    } else {
      return 20 + Math.random() * 80
    }
  }

  const startGame = () => {
    // Gerar ponto de crash
    const newCrashPoint = generateCrashPointLocal()
    setCrashPoint(newCrashPoint)

    // Resetar estado do jogo
    setCurrentMultiplier(1.0)
    setGameState("running")
    setHasCashedOut(false)

    // Iniciar animação do multiplicador
    const timer = setInterval(() => {
      setCurrentMultiplier((prev) => {
        // Aumentar mais rapidamente em valores baixos, mais lentamente em valores altos
        const increment = 0.01 * (prev < 2 ? 1 : prev < 5 ? 0.7 : 0.5)
        const newValue = prev + increment

        // Verificar se atingiu o ponto de crash
        if (newValue >= crashPoint) {
          clearInterval(timer)
          gameCrashed()
          return crashPoint
        }

        return Number.parseFloat(newValue.toFixed(2))
      })
    }, 100) // Atualizar a cada 100ms

    setTimerId(timer)
  }

  const placeBetAndStart = async () => {
    if (user.balance < betAmount) {
      alert("Saldo insuficiente para realizar esta aposta!")
      return
    }

    // Deduzir o valor da aposta imediatamente
    const newBalance = user.balance - betAmount
    setUser({ ...user, balance: newBalance })

    setHasBet(true)
  }

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputBetAmount(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBetAmount(numValue)
    }
  }

  const cashOut = async () => {
    if (gameState === "running" && hasBet && !hasCashedOut) {
      setHasCashedOut(true)
      setShowCashedOutMessage(true)

      // Registrar aposta com cashout
      const result = await placeBet("crash", betAmount, currentMultiplier, {
        crashPoint,
        cashedOutAt: currentMultiplier,
      })

      if (result.success) {
        setUser({ ...user, balance: result.newBalance })
      }
    }
  }

  const gameCrashed = async () => {
    if (timerId) {
      clearInterval(timerId)
    }

    setGameState("crashed")

    // Adicionar ao histórico
    const color = crashPoint < 2 ? "text-red-500" : crashPoint < 10 ? "text-yellow-500" : "text-green-500"
    setGameHistory([{ multiplier: crashPoint, color }, ...gameHistory.slice(0, 9)])

    // Se apostou e não retirou, registrar perda
    // (O valor da aposta já foi deduzido quando a aposta foi feita)
    if (hasBet && !hasCashedOut) {
      await placeBet("crash", betAmount, 0, {
        crashPoint,
        cashedOutAt: 0,
      })
    }

    // Preparar para o próximo jogo
    setTimeout(() => {
      setGameState("waiting")
      setHasBet(false)
      setCountdown(5)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Link href="/jogos" className="flex items-center space-x-2 hover:text-red-200 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Voltar aos Jogos</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <motion.div
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                >
                  <Coins className="h-5 w-5 text-yellow-300" />
                  <span className="font-medium">R$ {user?.balance.toFixed(2)}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <Card className="overflow-hidden border-none shadow-xl">
                <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Rocket className="h-6 w-6 mr-2 text-yellow-300" />
                      Crash
                    </h2>

                    {gameState === "waiting" && (
                      <div className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-full font-bold">
                        Próximo jogo em {countdown}s
                      </div>
                    )}

                    {gameState === "running" && (
                      <motion.div
                        className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.5 }}
                      >
                        {currentMultiplier.toFixed(2)}x
                      </motion.div>
                    )}

                    {gameState === "crashed" && (
                      <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold">
                        Crash @ {crashPoint.toFixed(2)}x
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  {/* Área do gráfico/multiplicador */}
                  <div
                    className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 rounded-lg mb-6 relative"
                    style={{ height: "350px" }}
                  >
                    {/* Gráfico */}
                    <div ref={graphRef} className="absolute inset-0"></div>

                    {/* Grid de fundo */}
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className="border border-gray-800/50"></div>
                      ))}
                    </div>

                    {/* Foguete */}
                    <AnimatePresence>
                      {gameState === "running" && (
                        <motion.div
                          className="absolute left-1/2 transform -translate-x-1/2"
                          initial={{ bottom: "0%" }}
                          animate={{ bottom: `${rocketPosition}%` }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ type: "spring", damping: 10 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                          >
                            <Rocket className="h-14 w-14 text-red-500" />
                          </motion.div>
                          <motion.div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
                            animate={{ opacity: [0.7, 0.3, 0.7] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.3 }}
                          >
                            <div className="w-10 h-16 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-full blur-md"></div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mensagem de espera */}
                    {gameState === "waiting" && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="text-xl text-yellow-300">Aguardando próximo jogo...</p>
                          <p className="text-6xl font-bold mt-3 text-white">{countdown}s</p>
                        </motion.div>
                      </div>
                    )}

                    {/* Mensagem de crash */}
                    <AnimatePresence>
                      {gameState === "crashed" && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="bg-red-600 text-white px-10 py-6 rounded-lg text-4xl font-bold shadow-lg"
                            animate={{ scale: [0.8, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                          >
                            CRASH @ {crashPoint.toFixed(2)}x
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mensagem de cashout */}
                    <AnimatePresence>
                      {showCashedOutMessage && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-6 rounded-lg text-3xl font-bold shadow-lg"
                            animate={{ scale: [0.8, 1.2, 1], y: [0, -20, -40] }}
                            transition={{ duration: 0.5 }}
                          >
                            + R$ {(currentMultiplier * betAmount - betAmount).toFixed(2)}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Multiplicador atual */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-3xl">
                      {gameState === "running" && currentMultiplier.toFixed(2)}x
                    </div>
                  </div>

                  {/* Controles de aposta */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Valor da Aposta (R$)</label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            min="1"
                            max={user?.balance || 1000}
                            value={inputBetAmount}
                            onChange={handleBetAmountChange}
                            disabled={hasBet || gameState === "running"}
                            className="pl-10 text-lg"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newValue = Math.max(1, betAmount / 2)
                            setBetAmount(newValue)
                            setInputBetAmount(newValue.toString())
                          }}
                          disabled={hasBet || gameState === "running"}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          1/2
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newValue = Math.min(user?.balance || 1000, betAmount * 2)
                            setBetAmount(newValue)
                            setInputBetAmount(newValue.toString())
                          }}
                          disabled={hasBet || gameState === "running"}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          2x
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 flex items-end">
                      {!hasBet && gameState !== "crashed" ? (
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={placeBetAndStart}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                            disabled={gameState === "crashed"}
                          >
                            Apostar
                          </Button>
                        </motion.div>
                      ) : hasBet && !hasCashedOut && gameState === "running" ? (
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={cashOut}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                          >
                            Retirar R$ {(currentMultiplier * betAmount).toFixed(2)}
                          </Button>
                        </motion.div>
                      ) : hasBet && hasCashedOut ? (
                        <Button disabled className="bg-gray-300 w-full text-lg py-6">
                          Retirado @ {currentMultiplier.toFixed(2)}x
                        </Button>
                      ) : (
                        <Button disabled className="bg-gray-300 w-full text-lg py-6">
                          Aguardando próximo jogo...
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:w-1/3">
              <Card className="border-none shadow-lg overflow-hidden mb-6">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-red-700 flex items-center">
                    <History className="h-5 w-5 mr-2 text-red-600" />
                    Histórico de Jogos
                  </h3>

                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {gameHistory.map((game, index) => (
                      <motion.div
                        key={index}
                        className={`${game.color} text-center py-2 rounded-md font-bold text-white shadow-sm`}
                        initial={index === 0 ? { scale: 0.8, opacity: 0 } : {}}
                        animate={index === 0 ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {game.multiplier.toFixed(2)}x
                      </motion.div>
                    ))}

                    {gameHistory.length === 0 && (
                      <div className="col-span-5 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <History className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhum jogo realizado ainda</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-lg border border-red-100">
                    <h4 className="font-medium mb-3 text-red-700 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Como Jogar:
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        Faça sua aposta antes do início do jogo
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>O multiplicador aumenta com o tempo
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        Retire antes que o foguete caia para garantir seus ganhos
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        Se o foguete cair antes de você retirar, você perde sua aposta
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        Quanto mais tempo esperar, maior o risco e a recompensa
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-red-700 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
                    Estatísticas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Maior Multiplicador:</span>
                      <span className="font-bold text-red-700">
                        {gameHistory.length > 0 ? Math.max(...gameHistory.map((g) => g.multiplier)).toFixed(2) : "-"}x
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Média de Crashes:</span>
                      <span className="font-bold text-orange-600">
                        {gameHistory.length > 0
                          ? (gameHistory.reduce((sum, g) => sum + g.multiplier, 0) / gameHistory.length).toFixed(2)
                          : "-"}
                        x
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Crashes abaixo de 2x:</span>
                      <span className="font-bold text-yellow-600">
                        {gameHistory.length > 0
                          ? `${Math.round((gameHistory.filter((g) => g.multiplier < 2).length / gameHistory.length) * 100)}%`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  )
}
