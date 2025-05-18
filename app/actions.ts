"use server"

import { placeBet, getUserBetHistory, getAllUsers, updateUserBalance } from "@/lib/games-db"

// Server action to place a bet
export async function placeBetAction(gameType: string, betAmount: number, result: number, gameData: any = {}) {
  return await placeBet(gameType, betAmount, result, gameData)
}

// Server action to get user bet history
export async function getUserBetHistoryAction(userId?: string) {
  return await getUserBetHistory(userId)
}

// Server action to get all users (admin only)
export async function getAllUsersAction() {
  return await getAllUsers()
}

// Server action to update user balance (admin only)
export async function updateUserBalanceAction(userId: string, newBalance: number) {
  return await updateUserBalance(userId, newBalance)
}
