"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { placeBet } from "@/lib/games"
import { ArrowLeft, Coins, CircleDashed, History, DollarSign, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

type BetType = "number" | "color" | "parity" | "section"
type BetOption = {
  type: BetType
  value: string | number
  multiplier: number
  label: string
  color?: string
}

export default function RoletaPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<"waiting" | "spinning" | "result">("waiting")
  const [betAmount, setBetAmount] = useState(10)
  const [inputBetAmount, setInputBetAmount] = useState("10")
  const [selectedBets, setSelectedBets] = useState<BetOption[]>([])
  const [result, setResult] = useState<number | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [gameHistory, setGameHistory] = useState<{ number: number; color: string }[]>([])
  const [spinDuration, setSpinDuration] = useState(0)
  const [spinAngle, setSpinAngle] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  // Números da roleta em ordem
  const wheelNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26,
  ]

  // Mapeamento de números para cores
  const numberColors: Record<number, string> = {}
  wheelNumbers.forEach((num, index) => {
    if (num === 0) {
      numberColors[num] = "green"
    } else {
      // Alternando entre vermelho e preto
      numberColors[num] = index % 2 === 0 ? "black" : "red"
    }
  })

  // Opções de apostas
  const betOptions: BetOption[] = [
    // Apostas em cores
    { type: "color", value: "red", multiplier: 2, label: "Vermelho", color: "bg-red-600" },
    { type: "color", value: "black", multiplier: 2, label: "Preto", color: "bg-black" },
    { type: "color", value: "green", multiplier: 36, label: "Verde (0)", color: "bg-green-600" },

    // Apostas em paridade
    { type: "parity", value: "even", multiplier: 2, label: "Par" },
    { type: "parity", value: "odd", multiplier: 2, label: "Ímpar" },

    // Apostas em seções
    { type: "section", value: "1-12", multiplier: 3, label: "1-12" },
    { type: "section", value: "13-24", multiplier: 3, label: "13-24" },
    { type: "section", value: "25-36", multiplier: 3, label: "25-36" },
    { type: "section", value: "1-18", multiplier: 2, label: "1-18" },
    { type: "section", value: "19-36", multiplier: 2, label: "19-36" },
  ]

  // Gerar opções de apostas em números
  const numberBets: BetOption[] = Array.from({ length: 37 }, (_, i) => ({
    type: "number",
    value: i,
    multiplier: 36,
    label: i.toString(),
    color: `bg-${numberColors[i] === "red" ? "red-600" : numberColors[i] === "black" ? "black" : "green-600"}`,
  }))

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

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputBetAmount(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBetAmount(numValue)
    }
  }

  const toggleBet = (bet: BetOption) => {
    if (gameState !== "waiting") return

    const existingBetIndex = selectedBets.findIndex(
      (selectedBet) => selectedBet.type === bet.type && selectedBet.value === bet.value,
    )

    if (existingBetIndex >= 0) {
      // Remove a aposta se já estiver selecionada
      setSelectedBets(selectedBets.filter((_, index) => index !== existingBetIndex))
    } else {
      // Adiciona a aposta
      setSelectedBets([...selectedBets, bet])
    }
  }

  const isBetSelected = (bet: BetOption) => {
    return selectedBets.some((selectedBet) => selectedBet.type === bet.type && selectedBet.value === bet.value)
  }

  const getTotalBetAmount = () => {
    return selectedBets.length * betAmount
  }

  const startGame = async () => {
    if (user.balance < getTotalBetAmount()) {
      alert("Saldo insuficiente para realizar estas apostas!")
      return
    }

    if (selectedBets.length === 0) {
      alert("Selecione pelo menos uma aposta!")
      return
    }

    // Deduzir o valor da aposta imediatamente
    const newBalance = user.balance - getTotalBetAmount()
    setUser({ ...user, balance: newBalance })

    // Iniciar animação da roleta
    setGameState("spinning")

    // Gerar resultado aleatório (0-36)
    const randomResult = Math.floor(Math.random() * 37)
    setResult(randomResult)

    // Calcular ângulo para a animação da roleta
    // Encontrar o índice do número no wheelNumbers
    const resultIndex = wheelNumbers.indexOf(randomResult)
    // Calcular o ângulo baseado na posição do número (cada número ocupa 360/37 graus)
    const anglePerNumber = 360 / wheelNumbers.length
    // Adicionar rotações extras para efeito visual (5 rotações completas + posição do número)
    const targetAngle = 5 * 360 + resultIndex * anglePerNumber

    setSpinAngle(targetAngle)
    setSpinDuration(5) // 5 segundos de animação

    // Adicionar ao histórico
    const resultColor = numberColors[randomResult]
    setGameHistory([{ number: randomResult, color: resultColor }, ...gameHistory.slice(0, 9)])

    // Verificar apostas ganhadoras após a animação
    setTimeout(() => {
      checkWinningBets(randomResult)
    }, 5000)
  }

  const checkWinningBets = async (resultNumber: number) => {
    setGameState("result")

    // Verificar cada aposta
    let totalWin = 0
    const resultColor = numberColors[resultNumber]
    const isEven = resultNumber !== 0 && resultNumber % 2 === 0

    for (const bet of selectedBets) {
      let isWinner = false

      switch (bet.type) {
        case "number":
          isWinner = bet.value === resultNumber
          break
        case "color":
          isWinner = bet.value === resultColor
          break
        case "parity":
          isWinner = (bet.value === "even" && isEven) || (bet.value === "odd" && !isEven && resultNumber !== 0)
          break
        case "section":
          if (bet.value === "1-12") {
            isWinner = resultNumber >= 1 && resultNumber <= 12
          } else if (bet.value === "13-24") {
            isWinner = resultNumber >= 13 && resultNumber <= 24
          } else if (bet.value === "25-36") {
            isWinner = resultNumber >= 25 && resultNumber <= 36
          } else if (bet.value === "1-18") {
            isWinner = resultNumber >= 1 && resultNumber <= 18
          } else if (bet.value === "19-36") {
            isWinner = resultNumber >= 19 && resultNumber <= 36
          }
          break
      }

      if (isWinner) {
        totalWin += betAmount * bet.multiplier
      }
    }

    setWinAmount(totalWin)

    // Registrar aposta no histórico
    if (totalWin > 0) {
      // Calcular multiplicador efetivo
      const effectiveMultiplier = totalWin / getTotalBetAmount()

      const result = await placeBet("roleta", getTotalBetAmount(), effectiveMultiplier, {
        selectedBets,
        resultNumber,
        winAmount: totalWin,
      })

      if (result.success) {
        setUser({ ...user, balance: result.newBalance })
      }
    } else {
      // Registrar perda
      await placeBet("roleta", getTotalBetAmount(), 0, {
        selectedBets,
        resultNumber,
        winAmount: 0,
      })
    }
  }

  const resetGame = () => {
    setGameState("waiting")
    setSelectedBets([])
    setResult(null)
    setWinAmount(0)
  }

  const renderWheel = () => {
    return (
      <div className="relative w-64 h-64 mx-auto mb-6">
        <motion.div
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-gray-800 overflow-hidden"
          style={{
            backgroundImage: "url('/placeholder.svg?height=256&width=256')",
            backgroundSize: "cover",
          }}
          animate={
            gameState === "spinning"
              ? {
                  rotate: spinAngle,
                }
              : {}
          }
          transition={{
            duration: spinDuration,
            ease: "easeOut",
          }}
        />

        {/* Marcador */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-500 clip-triangle" />

        {/* Resultado */}
        {gameState === "result" && result !== null && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                numberColors[result] === "red"
                  ? "bg-red-600"
                  : numberColors[result] === "black"
                    ? "bg-black"
                    : "bg-green-600"
              }`}
            >
              {result}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderBetOptions = () => {
    return (
      <Tabs defaultValue="special" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="special">Apostas Especiais</TabsTrigger>
          <TabsTrigger value="numbers">Números</TabsTrigger>
        </TabsList>

        <TabsContent value="special" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {betOptions.map((bet, index) => (
              <Button
                key={index}
                variant={isBetSelected(bet) ? "default" : "outline"}
                className={`${bet.color || ""} ${isBetSelected(bet) ? "ring-2 ring-yellow-400" : ""}`}
                onClick={() => toggleBet(bet)}
                disabled={gameState !== "waiting"}
              >
                {bet.label} ({bet.multiplier}x)
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="numbers">
          <div className="grid grid-cols-6 gap-2">
            {numberBets.map((bet) => (
              <Button
                key={bet.value.toString()}
                variant={isBetSelected(bet) ? "default" : "outline"}
                className={`${bet.color} ${isBetSelected(bet) ? "ring-2 ring-yellow-400" : ""}`}
                onClick={() => toggleBet(bet)}
                disabled={gameState !== "waiting"}
              >
                {bet.label}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-green-800 to-emerald-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Link href="/jogos" className="flex items-center space-x-2 hover:text-green-200 transition-colors">
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
                <div className="bg-gradient-to-r from-green-700 to-green-900 text-white p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center">
                      <CircleDashed className="h-6 w-6 mr-2 text-yellow-300" />
                      Roleta
                    </h2>

                    {gameState === "result" && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold">
                        {winAmount > 0 ? `Ganhou R$ ${winAmount.toFixed(2)}!` : "Tente novamente!"}
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  {/* Roleta */}
                  <div className="flex justify-center mb-8">
                    <div className="relative w-72 h-72 mx-auto">
                      <motion.div
                        ref={wheelRef}
                        className="w-full h-full rounded-full border-4 border-gray-800 overflow-hidden shadow-lg"
                        style={{
                          backgroundImage: "url('/placeholder.svg?height=288&width=288')",
                          backgroundSize: "cover",
                        }}
                        animate={
                          gameState === "spinning"
                            ? {
                                rotate: spinAngle,
                              }
                            : {}
                        }
                        transition={{
                          duration: spinDuration,
                          ease: "easeOut",
                        }}
                      />

                      {/* Marcador */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-10 bg-yellow-500 clip-triangle" />

                      {/* Resultado */}
                      {gameState === "result" && result !== null && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg ${
                              numberColors[result] === "red"
                                ? "bg-red-600"
                                : numberColors[result] === "black"
                                  ? "bg-black"
                                  : "bg-green-600"
                            }`}
                          >
                            {result}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Resultado */}
                  {gameState === "result" && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        winAmount > 0
                          ? "bg-green-100 border-green-200 text-green-700"
                          : "bg-red-100 border-red-200 text-red-700"
                      } p-4 rounded-md mb-6 text-center border`}
                    >
                      <p className="text-lg font-bold">{winAmount > 0 ? "Você ganhou!" : "Você perdeu!"}</p>
                      <p>
                        {winAmount > 0 ? `Ganho: R$ ${winAmount.toFixed(2)}` : "Tente novamente com uma nova aposta."}
                      </p>
                    </motion.div>
                  )}

                  {/* Opções de apostas */}
                  <div className="mb-6">
                    <Tabs defaultValue="special" className="w-full">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="special" className="text-sm">
                          Apostas Especiais
                        </TabsTrigger>
                        <TabsTrigger value="numbers" className="text-sm">
                          Números
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="special" className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {betOptions.map((bet, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`${bet.color || "bg-gray-100"} ${
                                isBetSelected(bet) ? "ring-2 ring-yellow-400" : ""
                              } p-3 rounded-lg flex items-center justify-between transition-all`}
                              onClick={() => toggleBet(bet)}
                              disabled={gameState !== "waiting"}
                            >
                              <span className={`font-medium ${bet.color ? "text-white" : "text-gray-800"}`}>
                                {bet.label}
                              </span>
                              <span
                                className={`text-sm font-bold px-2 py-1 rounded-full ${
                                  bet.color ? "bg-white/20 text-white" : "bg-green-100 text-green-800"
                                }`}
                              >
                                {bet.multiplier}x
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="numbers">
                        <div className="grid grid-cols-6 gap-2">
                          {numberBets.map((bet) => (
                            <motion.button
                              key={bet.value.toString()}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`${bet.color} ${
                                isBetSelected(bet) ? "ring-2 ring-yellow-400" : ""
                              } aspect-square rounded-md flex items-center justify-center text-white font-bold text-lg transition-all`}
                              onClick={() => toggleBet(bet)}
                              disabled={gameState !== "waiting"}
                            >
                              {bet.label}
                            </motion.button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Controles de aposta */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Valor por Aposta (R$)</label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            min="1"
                            max={user?.balance || 1000}
                            value={inputBetAmount}
                            onChange={handleBetAmountChange}
                            disabled={gameState !== "waiting"}
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
                          disabled={gameState !== "waiting"}
                          className="border-green-200 text-green-700 hover:bg-green-50"
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
                          disabled={gameState !== "waiting"}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          2x
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 flex items-end">
                      {gameState === "waiting" ? (
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={startGame}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                            disabled={selectedBets.length === 0}
                          >
                            Girar Roleta (R$ {getTotalBetAmount().toFixed(2)})
                          </Button>
                        </motion.div>
                      ) : gameState === "spinning" ? (
                        <Button disabled className="bg-gray-300 w-full text-lg py-6">
                          Girando...
                        </Button>
                      ) : (
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={resetGame}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                          >
                            Jogar Novamente
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:w-1/3">
              <Card className="border-none shadow-lg overflow-hidden mb-6">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-green-700 flex items-center">
                    <History className="h-5 w-5 mr-2 text-green-600" />
                    Últimos Resultados
                  </h3>

                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {gameHistory.map((result, index) => (
                      <motion.div
                        key={index}
                        className={`${
                          result.color === "red" ? "bg-red-600" : result.color === "black" ? "bg-black" : "bg-green-600"
                        } text-center py-3 rounded-md font-bold text-white shadow-sm`}
                        initial={index === 0 ? { scale: 0.8, opacity: 0 } : {}}
                        animate={index === 0 ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {result.number}
                      </motion.div>
                    ))}

                    {gameHistory.length === 0 && (
                      <div className="col-span-5 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <CircleDashed className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhum jogo realizado ainda</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-100">
                    <h4 className="font-medium mb-3 text-green-700 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Como Jogar:
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        Escolha o valor da sua aposta
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        Selecione uma ou mais apostas (números, cores, etc.)
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        Clique em "Girar Roleta" para iniciar o jogo
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        Se o resultado corresponder à sua aposta, você ganha!
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        Diferentes apostas têm diferentes multiplicadores
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-green-700">Suas Apostas</h3>

                  {selectedBets.length > 0 ? (
                    <div className="space-y-3">
                      {selectedBets.map((bet, index) => (
                        <motion.div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full mr-3 ${bet.color || "bg-gray-400"}`}></div>
                            <span className="font-medium">
                              {bet.type === "number"
                                ? `Número ${bet.value}`
                                : bet.type === "color"
                                  ? bet.value === "red"
                                    ? "Vermelho"
                                    : bet.value === "black"
                                      ? "Preto"
                                      : "Verde (0)"
                                  : bet.type === "parity"
                                    ? bet.value === "even"
                                      ? "Par"
                                      : "Ímpar"
                                    : `${bet.label}`}
                            </span>
                          </div>
                          <div className="text-sm font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            {bet.multiplier}x
                          </div>
                        </motion.div>
                      ))}

                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-green-700">R$ {getTotalBetAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <CircleDashed className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Selecione suas apostas para começar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  )
}
