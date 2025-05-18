"use client"

import { getServerSupabase } from "./supabase"
import { getCurrentUser, updateOwnBalance } from "./auth"
import {
  generateCrashPoint as generateCrashPointDB,
  generateMines as generateMinesDB,
  generatePlinkoResult as generatePlinkoResultDB,
  placeBet as placeBetDB,
} from "./games-db"

// Type for bet history
export type BetHistory = {
  id: string
  userId: string
  gameType: "mines" | "crash" | "plinko" | "roulette"
  betAmount: number
  result: number // final multiplier
  profit: number // profit (negative for losses)
  timestamp: Date
  gameData: any // game-specific data
}

// Record a bet
export async function placeBet(
  gameType: "mines" | "crash" | "plinko" | "roulette",
  betAmount: number,
  result: number,
  gameData: any,
) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "Usuário não autenticado" }
  }

  // Check if user has enough balance
  if (user.balance < betAmount && result === 0) {
    return { success: false, message: "Saldo insuficiente" }
  }

  // Calculate profit
  const profit = betAmount * result - betAmount

  // Update user balance
  const newBalance = user.balance + profit
  const updateResult = await updateOwnBalance(newBalance)

  if (!updateResult.success) {
    return updateResult
  }

  // Record bet in history
  const supabase = getServerSupabase()
  const { error } = await supabase.from("bet_history").insert([
    {
      user_id: user.id,
      game_type: gameType,
      bet_amount: betAmount,
      result,
      profit,
      game_data: gameData,
    },
  ])

  if (error) {
    console.error("Error recording bet:", error)
    return { success: false, message: "Erro ao registrar aposta" }
  }

  return {
    success: true,
    newBalance,
  }
}

// Get user bet history
export async function getUserBetHistory() {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "Usuário não autenticado" }
  }

  const supabase = getServerSupabase()
  const { data: bets, error } = await supabase
    .from("bet_history")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching bet history:", error)
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

// Game-specific functions - converted to async
export async function generateMines(totalTiles: number, minesCount: number) {
  return await generateMinesDB(totalTiles, minesCount)
}

export async function generateCrashPoint() {
  return await generateCrashPointDB()
}

export async function generatePlinkoResult(riskLevel: "low" | "medium" | "high") {
  return await generatePlinkoResultDB(riskLevel)
}

export async function generateRouletteResult() {
  // Gera um número aleatório entre 0 e 36
  return Math.floor(Math.random() * 37)
}

// Função para registrar uma aposta (wrapper client-side)
export async function placeBetClient(
  gameType: "mines" | "crash" | "plinko",
  betAmount: number,
  result: number,
  gameData: any,
) {
  return await placeBetDB(gameType, betAmount, result, gameData)
}

// Função para gerar minas (wrapper client-side)
export async function generateMinesClient(totalTiles: number, minesCount: number) {
  return await generateMines(totalTiles, minesCount)
}

// Função para gerar ponto de crash (wrapper client-side)
export async function generateCrashPointClient() {
  return await generateCrashPoint()
}

// Função para gerar resultado do Plinko (wrapper client-side)
export async function generatePlinkoResultClient(riskLevel: "low" | "medium" | "high") {
  return await generatePlinkoResult(riskLevel)
}
