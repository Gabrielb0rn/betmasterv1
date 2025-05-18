"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { placeBetClient as placeBet } from "@/lib/games"
import { ArrowLeft, Bomb, Diamond, Sparkles, HelpCircle, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Notification } from "@/components/notification"

export default function MinesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle")
  const [betAmount, setBetAmount] = useState(10)
  const [inputBetAmount, setInputBetAmount] = useState("10")
  const [minesCount, setMinesCount] = useState(5)
  const [revealedTiles, setRevealedTiles] = useState<number[]>([])
  const [mines, setMines] = useState<number[]>([])
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [profit, setProfit] = useState(0)
  const [showAllMines, setShowAllMines] = useState(false)
  const [recentlyClicked, setRecentlyClicked] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const TOTAL_TILES = 25 // 5x5 grid
  const MAX_MINES = 24

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

  // Calcular multiplicador baseado no número de minas e tiles revelados
  useEffect(() => {
    if (gameState === "playing" && revealedTiles.length > 0) {
      // Fórmula para calcular o multiplicador
      // Quanto mais minas e mais tiles revelados, maior o multiplicador
      const safeTiles = TOTAL_TILES - minesCount
      const revealedCount = revealedTiles.length

      // Multiplicador aumenta exponencialmente com o número de tiles revelados
      const multiplier = (1 + (revealedCount / safeTiles) * 2) ** (minesCount / 5)

      setCurrentMultiplier(Number.parseFloat(multiplier.toFixed(2)))
      setProfit(multiplier * betAmount - betAmount)
    }
  }, [revealedTiles, minesCount, gameState, betAmount])

  // Limpar o estado de clique recente após 500ms
  useEffect(() => {
    if (recentlyClicked !== null) {
      const timer = setTimeout(() => {
        setRecentlyClicked(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [recentlyClicked])

  // Função para gerar minas (movida do lib/games.ts para componente local)
  const generateMinesLocal = (totalTiles: number, minesCount: number): number[] => {
    const minesSet = new Set<number>()

    while (minesSet.size < minesCount) {
      const mine = Math.floor(Math.random() * totalTiles)
      minesSet.add(mine)
    }

    return Array.from(minesSet)
  }

  const startGame = async () => {
    if (user.balance < betAmount) {
      setNotification({
        type: "error",
        message: "Saldo insuficiente para realizar esta aposta!",
      })
      return
    }

    // Atualizar o saldo do usuário imediatamente (deduzir o valor da aposta)
    const newBalance = user.balance - betAmount
    setUser({ ...user, balance: newBalance })

    // Gerar minas aleatórias usando a função local
    const newMines = generateMinesLocal(TOTAL_TILES, minesCount)
    setMines(newMines)
    setRevealedTiles([])
    setGameState("playing")
    setShowAllMines(false)
    setCurrentMultiplier(1)
    setProfit(0)
  }

  const handleTileClick = async (tileIndex: number) => {
    if (gameState !== "playing" || revealedTiles.includes(tileIndex)) {
      return
    }

    setRecentlyClicked(tileIndex)

    // Verificar se clicou em uma mina
    if (mines.includes(tileIndex)) {
      // Perdeu o jogo
      setGameState("lost")
      setShowAllMines(true)

      // Registrar aposta perdida (o saldo já foi deduzido no início do jogo)
      await placeBet("mines", betAmount, 0, {
        minesCount,
        revealedTiles: [...revealedTiles, tileIndex],
        mines,
      })

      setNotification({
        type: "error",
        message: `Você perdeu R$ ${betAmount.toFixed(2)}!`,
      })
    } else {
      // Continua o jogo
      const newRevealedTiles = [...revealedTiles, tileIndex]
      setRevealedTiles(newRevealedTiles)

      // Verificar se ganhou (revelou todos os tiles seguros)
      const safeTiles = TOTAL_TILES - minesCount
      if (newRevealedTiles.length === safeTiles) {
        setGameState("won")
        setShowAllMines(true)

        // Registrar aposta ganha e atualizar saldo
        const result = await placeBet("mines", betAmount, currentMultiplier, {
          minesCount,
          revealedTiles: newRevealedTiles,
          mines,
        })

        if (result.success) {
          setUser({ ...user, balance: result.newBalance })
          setNotification({
            type: "success",
            message: `Parabéns! Você ganhou R$ ${profit.toFixed(2)}!`,
          })
        }
      }
    }
  }

  const cashOut = async () => {
    if (gameState === "playing" && revealedTiles.length > 0) {
      setGameState("won")
      setShowAllMines(true)

      // Registrar aposta com cashout
      const result = await placeBet("mines", betAmount, currentMultiplier, {
        minesCount,
        revealedTiles,
        mines,
      })

      if (result.success) {
        setUser({ ...user, balance: result.newBalance })
        setNotification({
          type: "success",
          message: `Você retirou R$ ${(currentMultiplier * betAmount).toFixed(2)}!`,
        })
      }
    }
  }

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputBetAmount(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBetAmount(numValue)
    }
  }

  const renderTile = (index: number) => {
    const isRevealed = revealedTiles.includes(index)
    const isMine = Array.isArray(mines) && mines.includes(index)
    const shouldShowMine = showAllMines && isMine
    const isRecentlyClicked = recentlyClicked === index

    let content
    let bgColor = "bg-gray-200 hover:bg-gray-300"
    let borderColor = "border-gray-300"

    if (isRevealed && !isMine) {
      content = <Diamond className="h-6 w-6 text-yellow-400" />
      bgColor = "bg-green-100"
      borderColor = "border-green-300"
    } else if (shouldShowMine) {
      content = <Bomb className="h-6 w-6 text-red-500" />
      bgColor = "bg-red-100"
      borderColor = "border-red-300"
    } else {
      content = null
    }

    return (
      <motion.button
        whileHover={{ scale: gameState === "playing" && !isRevealed ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        animate={isRecentlyClicked ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
        className={`${bgColor} w-full aspect-square rounded-md flex items-center justify-center transition-colors border-2 ${borderColor} shadow-sm ${
          gameState === "playing" && !isRevealed ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={() => handleTileClick(index)}
        disabled={gameState !== "playing" || isRevealed}
      >
        {content}
        {isRevealed && !isMine && isRecentlyClicked && (
          <motion.div
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="absolute"
          >
            <Sparkles className="h-10 w-10 text-yellow-500" />
          </motion.div>
        )}
      </motion.button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainNav user={user} />

        {notification && (
          <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
        )}

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mines</h1>
              <p className="text-gray-600">Encontre os diamantes e evite as minas!</p>
            </div>
            <Link href="/jogos">
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos Jogos
              </Button>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <Card className="overflow-hidden border-none shadow-xl">
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Bomb className="h-6 w-6 mr-2 text-yellow-300" />
                      <h2 className="text-xl font-bold">Mines</h2>
                    </div>
                    <motion.div
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold"
                      animate={gameState === "playing" ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: gameState === "playing" ? Number.POSITIVE_INFINITY : 0, duration: 1.5 }}
                    >
                      {currentMultiplier}x
                    </motion.div>
                  </div>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  {/* Status do jogo */}
                  <AnimatePresence>
                    {gameState === "won" && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-md mb-6 text-center"
                      >
                        <p className="text-lg font-bold">Você ganhou!</p>
                        <p>
                          Lucro: R$ {profit.toFixed(2)} ({currentMultiplier}x)
                        </p>
                      </motion.div>
                    )}

                    {gameState === "lost" && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-md mb-6 text-center"
                      >
                        <p className="text-lg font-bold">Você perdeu!</p>
                        <p>Tente novamente com uma nova aposta.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Game Stats */}
                  <div className="flex justify-between mb-6">
                    <div className="flex space-x-4">
                      <div className="bg-purple-50 px-3 py-1 rounded-full text-purple-700 font-medium text-sm flex items-center">
                        <Bomb className="h-4 w-4 mr-1" /> {minesCount} minas
                      </div>
                      <div className="bg-green-50 px-3 py-1 rounded-full text-green-700 font-medium text-sm flex items-center">
                        <Diamond className="h-4 w-4 mr-1" /> {revealedTiles.length} diamantes
                      </div>
                    </div>
                    {gameState === "playing" && (
                      <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-medium text-sm flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> R$ {(currentMultiplier * betAmount).toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Grid do jogo */}
                  <div className="grid grid-cols-5 gap-3 mb-8">
                    {Array.from({ length: TOTAL_TILES }).map((_, index) => (
                      <div key={index}>{renderTile(index)}</div>
                    ))}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex space-x-4">
                    {gameState === "playing" && revealedTiles.length > 0 ? (
                      <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={cashOut}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                        >
                          Retirar R$ {(currentMultiplier * betAmount).toFixed(2)}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={startGame}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                          disabled={gameState === "playing"}
                        >
                          {gameState === "idle" ? "Iniciar Jogo" : "Jogar Novamente"}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:w-1/3">
              <Card className="border-none shadow-lg overflow-hidden mb-6">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-purple-700">Configurações</h3>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor da Aposta (R$)</label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            min="1"
                            max={user?.balance || 1000}
                            value={inputBetAmount}
                            onChange={handleBetAmountChange}
                            disabled={gameState === "playing"}
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
                          disabled={gameState === "playing"}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
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
                          disabled={gameState === "playing"}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          2x
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Número de Minas</label>
                        <span className="text-sm font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                          {minesCount}
                        </span>
                      </div>
                      <Slider
                        value={[minesCount]}
                        min={1}
                        max={MAX_MINES}
                        step={1}
                        onValueChange={(value) => setMinesCount(value[0])}
                        disabled={gameState === "playing"}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Menor Risco</span>
                        <span>Maior Risco</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-lg border border-purple-100">
                      <h4 className="font-medium mb-3 text-purple-700 flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Como Jogar:
                      </h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 mt-1">•</span>
                          Escolha o valor da sua aposta e o número de minas
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 mt-1">•</span>
                          Clique nos quadrados para revelar diamantes
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 mt-1">•</span>
                          Evite as minas ou perderá sua aposta
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 mt-1">•</span>
                          Quanto mais diamantes revelar, maior o multiplicador
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 mt-1">•</span>
                          Retire a qualquer momento para garantir seus ganhos
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-purple-700">Estatísticas</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Chance de Ganhar:</span>
                      <span className="font-bold text-purple-700">
                        {(((TOTAL_TILES - minesCount) / TOTAL_TILES) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Ganho Potencial:</span>
                      <span className="font-bold text-green-600">
                        Até{" "}
                        {(
                          (1 + ((TOTAL_TILES - minesCount) / (TOTAL_TILES - minesCount)) * 2) ** (minesCount / 5) *
                          betAmount
                        ).toFixed(2)}{" "}
                        R$
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Saldo Atual:</span>
                      <span className="font-bold text-blue-600">R$ {user?.balance.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AuthCheck>
  )
}
