"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { placeBet } from "@/lib/games"
import { ArrowLeft, Coins, Droplets, DollarSign, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function PlinkoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [betAmount, setBetAmount] = useState(10)
  const [inputBetAmount, setInputBetAmount] = useState("10")
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium")
  const [gameRunning, setGameRunning] = useState(false)
  const [lastResults, setLastResults] = useState<{ multiplier: number; color: string }[]>([])
  const [currentAnimation, setCurrentAnimation] = useState<number | null>(null)
  const [animationStep, setAnimationStep] = useState(0)

  // Configurações do Plinko
  const buckets = [
    { multiplier: 0, color: "#ef4444" }, // Vermelho
    { multiplier: 0.2, color: "#f97316" }, // Laranja
    { multiplier: 0.5, color: "#eab308" }, // Amarelo
    { multiplier: 1, color: "#84cc16" }, // Verde claro
    { multiplier: 2, color: "#22c55e" }, // Verde
    { multiplier: 5, color: "#14b8a6" }, // Turquesa
    { multiplier: 10, color: "#0ea5e9" }, // Azul claro
    { multiplier: 45, color: "#6366f1" }, // Azul/Roxo
  ]

  // Multiplicadores baseados no nível de risco
  const multipliers = {
    low: [0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3],
    medium: [0.1, 0.3, 0.5, 1, 2, 3, 5, 10],
    high: [0, 0.2, 0.5, 1, 2, 5, 10, 45],
  }

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

  // Atualizar os multiplicadores quando o nível de risco mudar
  useEffect(() => {
    buckets.forEach((bucket, index) => {
      bucket.multiplier = multipliers[riskLevel][index]
    })
  }, [riskLevel])

  // Animação da bola caindo
  useEffect(() => {
    if (currentAnimation !== null && animationStep < 16) {
      const timer = setTimeout(() => {
        setAnimationStep(animationStep + 1)
      }, 200)

      return () => clearTimeout(timer)
    }

    if (currentAnimation !== null && animationStep >= 16) {
      // Animação terminou, registrar resultado
      const finalMultiplier = buckets[currentAnimation].multiplier
      const bucketColor = buckets[currentAnimation].color

      // Adicionar ao histórico
      setLastResults([{ multiplier: finalMultiplier, color: bucketColor }, ...lastResults.slice(0, 9)])

      // Registrar aposta
      placeBet("plinko", betAmount, finalMultiplier, {
        riskLevel,
        multiplier: finalMultiplier,
      }).then((result) => {
        if (result.success) {
          setUser({ ...user, balance: result.newBalance })
        }
        setGameRunning(false)
        setCurrentAnimation(null)
        setAnimationStep(0)
      })
    }
  }, [currentAnimation, animationStep, lastResults, riskLevel, betAmount, buckets, user])

  // Função local para gerar resultado do Plinko
  const generatePlinkoResultLocal = (riskLevel: "low" | "medium" | "high"): number => {
    const selectedMultipliers = multipliers[riskLevel]
    const probabilities = {
      low: [5, 10, 15, 20, 20, 15, 10, 5],
      medium: [5, 10, 15, 20, 20, 15, 10, 5],
      high: [5, 10, 15, 20, 20, 15, 10, 5],
    }
    const selectedProbabilities = probabilities[riskLevel]

    const weightedArray: number[] = []

    selectedMultipliers.forEach((mult, index) => {
      for (let i = 0; i < selectedProbabilities[index]; i++) {
        weightedArray.push(mult)
      }
    })

    const randomIndex = Math.floor(Math.random() * weightedArray.length)
    return weightedArray[randomIndex]
  }

  const startGame = async () => {
    if (user.balance < betAmount) {
      alert("Saldo insuficiente para realizar esta aposta!")
      return
    }

    if (gameRunning) return

    setGameRunning(true)

    // Deduzir o valor da aposta imediatamente
    const newBalance = user.balance - betAmount
    setUser({ ...user, balance: newBalance })

    // Gerar resultado
    const resultMultiplier = generatePlinkoResultLocal(riskLevel)

    // Encontrar o índice do bucket correspondente ao multiplicador
    const bucketIndex = buckets.findIndex((bucket) => bucket.multiplier === resultMultiplier)

    // Iniciar animação
    setCurrentAnimation(bucketIndex)
    setAnimationStep(0)
  }

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputBetAmount(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBetAmount(numValue)
    }
  }

  const renderBuckets = () => {
    return (
      <div className="flex justify-between mt-4">
        {buckets.map((bucket, index) => (
          <div key={index} className="flex flex-col items-center" style={{ width: `${100 / buckets.length}%` }}>
            <div
              className="w-full h-12 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: bucket.color }}
            >
              {bucket.multiplier}x
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderPlinkoBoard = () => {
    return (
      <div className="relative h-64 bg-gray-100 border rounded-md mb-4">
        {/* Renderizar os buckets na parte inferior */}
        <div className="absolute bottom-0 left-0 right-0">{renderBuckets()}</div>

        {/* Renderizar a bola caindo */}
        {currentAnimation !== null && (
          <motion.div
            className="absolute top-0 w-6 h-6 rounded-full bg-blue-600"
            style={{
              left: `calc(${(currentAnimation + 0.5) * (100 / buckets.length)}% - 12px)`,
            }}
            animate={{
              top: `${(animationStep / 16) * 100}%`,
              x: [0, -10, 10, -5, 5, 0], // Movimento lateral aleatório
            }}
            transition={{
              top: { duration: 0.2, ease: "easeIn" },
              x: { duration: 0.5, repeat: Number.POSITIVE_INFINITY },
            }}
          />
        )}
      </div>
    )
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
        <header className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Link href="/jogos" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
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
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Droplets className="h-6 w-6 mr-2 text-yellow-300" />
                      Plinko
                    </h2>
                    {gameRunning && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold">
                        Jogando...
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  {/* Área do jogo */}
                  <div className="relative h-72 bg-gradient-to-b from-blue-900 to-blue-950 border border-blue-700 rounded-lg mb-6 overflow-hidden">
                    {/* Pinos (representados por pontos) */}
                    <div className="absolute inset-0 grid grid-cols-7 gap-4 p-4 pointer-events-none">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                        </div>
                      ))}
                    </div>

                    {renderPlinkoBoard()}

                    {/* Renderizar os buckets na parte inferior com um visual melhorado */}
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="flex justify-between">
                        {buckets.map((bucket, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                            style={{ width: `${100 / buckets.length}%` }}
                          >
                            <div
                              className="w-full h-14 flex items-center justify-center text-white font-bold shadow-inner"
                              style={{ backgroundColor: bucket.color }}
                            >
                              {bucket.multiplier}x
                            </div>
                          </div>
                        ))}
                      </div>
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
                            disabled={gameRunning}
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
                          disabled={gameRunning}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
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
                          disabled={gameRunning}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          2x
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 flex items-end">
                      <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={startGame}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                          disabled={gameRunning}
                        >
                          {gameRunning ? "Jogando..." : "Jogar"}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:w-1/3">
              <Card className="border-none shadow-lg overflow-hidden mb-6">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-blue-700">Configurações</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Nível de Risco</h4>
                      <RadioGroup
                        value={riskLevel}
                        onValueChange={(value) => setRiskLevel(value as "low" | "medium" | "high")}
                        className="flex flex-col space-y-3"
                        disabled={gameRunning}
                      >
                        <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 border border-green-100">
                          <RadioGroupItem value="low" id="risk-low" className="text-green-600" />
                          <Label htmlFor="risk-low" className="font-medium text-green-800">
                            Baixo (Ganhos menores, mais seguros)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                          <RadioGroupItem value="medium" id="risk-medium" className="text-yellow-600" />
                          <Label htmlFor="risk-medium" className="font-medium text-yellow-800">
                            Médio (Equilibrado)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 border border-red-100">
                          <RadioGroupItem value="high" id="risk-high" className="text-red-600" />
                          <Label htmlFor="risk-high" className="font-medium text-red-800">
                            Alto (Chance de ganhos maiores)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-lg font-bold mb-4 text-blue-700">Últimos Resultados</h3>

                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {lastResults.map((result, index) => (
                      <motion.div
                        key={index}
                        className="text-center py-3 rounded-md font-bold text-white shadow-sm"
                        style={{ backgroundColor: result.color }}
                        initial={index === 0 ? { scale: 0.8, opacity: 0 } : {}}
                        animate={index === 0 ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {result.multiplier}x
                      </motion.div>
                    ))}

                    {lastResults.length === 0 && (
                      <div className="col-span-5 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Droplets className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhum jogo realizado ainda</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
                    <h4 className="font-medium mb-3 text-blue-700 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Como Jogar:
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        Escolha o valor da sua aposta
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        Selecione o nível de risco desejado
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        Clique em "Jogar" para soltar a bola
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>A bola cairá através dos pinos e aterrissará
                        em um multiplicador
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        Seu ganho será o valor da aposta multiplicado pelo multiplicador
                      </li>
                    </ul>
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
