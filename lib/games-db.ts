"use server"

import { supabase } from "./supabase"
import { getCurrentUser, updateOwnBalance } from "./auth-db"

// Tipo para histórico de apostas
export type BetHistory = {
  id: string
  userId: string
  gameType: "mines" | "crash" | "plinko"
  betAmount: number
  result: number // multiplicador final
  profit: number // lucro (negativo para perdas)
  timestamp: Date
  gameData: any // dados específicos do jogo
}

// Função para registrar uma aposta
export async function placeBet(
  gameType: "mines" | "crash" | "plinko",
  betAmount: number,
  result: number,
  gameData: any,
) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "Usuário não autenticado" }
  }

  // Verificar se o usuário tem saldo suficiente
  if (user.balance < betAmount && result === 0) {
    return { success: false, message: "Saldo insuficiente" }
  }

  // Calcular lucro
  const profit = betAmount * result - betAmount

  // Atualizar saldo do usuário
  const newBalance = user.balance + profit
  const updateResult = await updateOwnBalance(newBalance)

  if (!updateResult.success) {
    return updateResult
  }

  // Registrar aposta no histórico
  const { error } = await supabase.from("bet_history").insert([
    {
      user_id: user.id,
      game_type: gameType,
      bet_amount: betAmount,
      result,
      profit,
      timestamp: new Date().toISOString(),
      game_data: gameData,
    },
  ])

  if (error) {
    console.error("Erro ao registrar aposta:", error)
    return { success: false, message: "Erro ao registrar aposta" }
  }

  return {
    success: true,
    newBalance,
  }
}

// Função para obter histórico de apostas do usuário
export async function getUserBetHistory() {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "Usuário não autenticado" }
  }

  const { data: bets, error } = await supabase
    .from("bet_history")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Erro ao buscar histórico de apostas:", error)
    return { success: false, message: "Erro ao buscar histórico de apostas" }
  }

  return {
    success: true,
    bets: bets.map((bet) => ({
      id: bet.id,
      userId: bet.user_id,
      gameType: bet.game_type,
      betAmount: bet.bet_amount,
      result: bet.result,
      profit: bet.profit,
      timestamp: new Date(bet.timestamp),
      gameData: bet.game_data,
    })),
  }
}

// Funções específicas para cada jogo - convertendo para async
export async function generateMines(totalTiles: number, minesCount: number) {
  const mines = new Set<number>()

  while (mines.size < minesCount) {
    const mine = Math.floor(Math.random() * totalTiles)
    mines.add(mine)
  }

  return Array.from(mines)
}

export async function generateCrashPoint() {
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

export async function generatePlinkoResult(riskLevel: "low" | "medium" | "high") {
  const multipliers = {
    low: [0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3],
    medium: [0.1, 0.3, 0.5, 1, 2, 3, 5, 10],
    high: [0, 0.2, 0.5, 1, 2, 5, 10, 45],
  }

  const probabilities = {
    low: [5, 10, 15, 20, 20, 15, 10, 5],
    medium: [5, 10, 15, 20, 20, 15, 10, 5],
    high: [5, 10, 15, 20, 20, 15, 10, 5],
  }

  const selectedMultipliers = multipliers[riskLevel]
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
