"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { playMinesGame } from "@/lib/games"
import { placeBetAction } from "@/app/actions"
import { Bomb, Coins } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MainNav } from "@/components/main-nav"

export default function MinesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [betAmount, setBetAmount] = useState(10)
  const [inputBetAmount, setInputBetAmount] = useState("10")
  const [mineCount, setMineCount] = useState(5)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false))
  const [revealedCells, setRevealedCells] = useState<boolean[]>(Array(25).fill(false))
  const [selectedCells, setSelectedCells] = useState<number[]>([])
  const [currentMultiplier, setCurrentMultiplier] = useState(0)
  const [potentialWin, setPotentialWin] = useState(0)
  const [showWinMessage, setShowWinMessage] = useState(false)

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

  useEffect(() => {
    // Calculate potential win based on current multiplier
    setPotentialWin(betAmount * currentMultiplier)
  }, [betAmount, currentMultiplier])

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputBetAmount(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBetAmount(numValue)
    }
  }

  const handleMineCountChange = (count: number) => {
    if (!gameStarted) {
      setMineCount(count)
    }
  }

  const startGame = () => {
    if (user.balance < betAmount) {
      alert("Saldo insuficiente!")
      return
    }

    // Deduct bet amount immediately
    setUser({ ...user, balance: user.balance - betAmount })

    // Generate a new grid with mines
    const newGrid = Array(25).fill(false)
    let minesPlaced = 0

    while (minesPlaced < mineCount) {
      const randomIndex = Math.floor(Math.random() * 25)
      if (!newGrid[randomIndex]) {
        newGrid[randomIndex] = true
        minesPlaced++
      }
    }

    setGrid(newGrid)
    setRevealedCells(Array(25).fill(false))
    setSelectedCells([])
    setCurrentMultiplier(0)
    setGameStarted(true)
    setGameOver(false)
    setShowWinMessage(false)
  }

  const handleCellClick = async (index: number) => {
    if (!gameStarted || gameOver || revealedCells[index]) return

    // Reveal the cell
    const newRevealedCells = [...revealedCells]
    newRevealedCells[index] = true
    setRevealedCells(newRevealedCells)

    // Add to selected cells
    const newSelectedCells = [...selectedCells, index]
    setSelectedCells(newSelectedCells)

    // Check if the cell has a mine
    if (grid[index]) {
      // Game over - hit a mine
      setGameOver(true)

      // Record the loss
      await placeBetAction("mines", betAmount, 0, {
        mineCount,
        selectedCells: newSelectedCells,
        grid,
        result: "loss",
      })
    } else {
      // Safe cell - update multiplier
      const result = await playMinesGame(grid, mineCount, newSelectedCells)
      setCurrentMultiplier(result.multiplier)
    }
  }

  const cashOut = async () => {
    if (!gameStarted || gameOver || selectedCells.length === 0) return

    setGameOver(true)
    setShowWinMessage(true)

    // Calculate winnings
    const winAmount = betAmount * currentMultiplier

    // Record the win
    const result = await placeBetAction("mines", betAmount, currentMultiplier, {
      mineCount,
      selectedCells,
      grid,
      result: "win",
    })

    if (result.success) {
      setUser({ ...user, balance: result.newBalance })
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setGrid(Array(25).fill(false))
    setRevealedCells(Array(25).fill(false))
    setSelectedCells([])
    setCurrentMultiplier(0)
    setShowWinMessage(false)
  }

  const renderCell = (index: number) => {
    const isMine = grid[index]
    const isRevealed = revealedCells[index]
    const isSelected = selectedCells.includes(index)

    return (
      <motion.div
        key={index}
        className={`aspect-square rounded-md flex items-center justify-center cursor-pointer text-lg font-bold ${
          isRevealed
            ? isMine
              ? "bg-red-600 text-white"
              : "bg-green-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
        onClick={() => handleCellClick(index)}
        whileHover={!gameStarted || gameOver || isRevealed ? {} : { scale: 1.05 }}
        whileTap={!gameStarted || gameOver || isRevealed ? {} : { scale: 0.95 }}
      >
        {isRevealed ? (
          isMine ? (
            <Bomb className="h-6 w-6" />
          ) : (
            <span>✓</span>
          )
        ) : gameOver && isMine ? (
          <Bomb className="h-6 w-6 text-red-600 opacity-50" />
        ) : null}
      </motion.div>
    )
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
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <Card className="overflow-hidden border-2 border-purple-100 dark:border-purple-900">
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Bomb className="h-6 w-6 mr-2" />
                      Mines
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-5 w-5 text-yellow-300" />
                      <span className="font-medium">R$ {user?.balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  {/* Win Message */}
                  <AnimatePresence>
                    {showWinMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-md mb-6 text-center"
                      >
                        <p className="text-lg font-bold">Você ganhou!</p>
                        <p>Ganho: R$ {potentialWin.toFixed(2)}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Game Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Valor da Aposta (R$)</label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max={user?.balance || 1000}
                            value={inputBetAmount}
                            onChange={handleBetAmountChange}
                            disabled={gameStarted}
                            className="text-lg"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newValue = Math.max(1, betAmount / 2)
                              setBetAmount(newValue)
                              setInputBetAmount(newValue.toString())
                            }}
                            disabled={gameStarted}
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
                            disabled={gameStarted}
                          >
                            2x
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Número de Minas</label>
                        <div className="grid grid-cols-5 gap-2">
                          {[3, 5, 10, 15, 20].map((count) => (
                            <Button
                              key={count}
                              variant={mineCount === count ? "default" : "outline"}
                              onClick={() => handleMineCountChange(count)}
                              disabled={gameStarted}
                              className={mineCount === count ? "bg-purple-600 hover:bg-purple-700" : ""}
                            >
                              {count}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      {!gameStarted ? (
                        <Button onClick={startGame} className="flex-1 bg-purple-600 hover:bg-purple-700 text-lg py-6">
                          Iniciar Jogo
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={cashOut}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
                            disabled={gameOver || selectedCells.length === 0}
                          >
                            Retirar R$ {potentialWin.toFixed(2)}
                          </Button>
                          <Button
                            onClick={resetGame}
                            variant="outline"
                            className="flex-1 text-lg py-6"
                            disabled={!gameOver && selectedCells.length === 0}
                          >
                            {gameOver ? "Novo Jogo" : "Desistir"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Game Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 25 }).map((_, index) => renderCell(index))}
                  </div>

                  {/* Game Info */}
                  {gameStarted && (
                    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Multiplicador Atual</p>
                          <p className="text-xl font-bold">{currentMultiplier.toFixed(2)}x</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Ganho Potencial</p>
                          <p className="text-xl font-bold">R$ {potentialWin.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Células Seguras</p>
                          <p className="text-xl font-bold">
                            {selectedCells.length}/{25 - mineCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:w-1/3">
              <Card className="border-2 border-purple-100 dark:border-purple-900">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 text-purple-700 dark:text-purple-400">Como Jogar</h3>

                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-md border border-purple-100 dark:border-purple-800">
                    <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        Escolha o valor da sua aposta e o número de minas
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        Clique em "Iniciar Jogo" para começar
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        Clique nas células para revelá-las
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        Evite as minas! Se você clicar em uma mina, perde a aposta
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        Quanto mais células seguras você revelar, maior será o multiplicador
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        Clique em "Retirar" a qualquer momento para garantir seus ganhos
                      </li>
                    </ul>

                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium text-sm text-purple-700 dark:text-purple-400">Multiplicadores:</h4>
                      <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                        <li>• Mais minas = Multiplicadores maiores</li>
                        <li>• Menos minas = Maior chance de ganhar</li>
                        <li>• O multiplicador aumenta a cada célula segura revelada</li>
                      </ul>
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
