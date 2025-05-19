"use server";

import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { getCurrentUser } from "./auth-local";

// Tipo para o histórico de apostas
export type BetHistory = {
  id: string;
  userId: string;
  gameType: string;
  betAmount: number;
  winAmount: number | null;
  createdAt: Date;
};

// Função para registrar uma aposta
export async function registerBet(
  gameType: string,
  betAmount: number,
  winAmount: number | null
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const betId = uuidv4();

    // Registrar a aposta
    db.prepare(
      "INSERT INTO bet_history (id, user_id, game_type, bet_amount, win_amount) VALUES (?, ?, ?, ?, ?)"
    ).run(betId, currentUser.id, gameType, betAmount, winAmount);

    // Atualizar o saldo do usuário
    const newBalance = currentUser.balance - betAmount + (winAmount || 0);
    db.prepare("UPDATE users SET balance = ? WHERE id = ?")
      .run(newBalance, currentUser.id);

    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar aposta:", error);
    return { success: false, message: "Erro ao registrar aposta" };
  }
}

// Função para obter o histórico de apostas de um usuário
export async function getBetHistory() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const bets = db
      .prepare("SELECT * FROM bet_history WHERE user_id = ? ORDER BY created_at DESC")
      .all(currentUser.id);

    return {
      success: true,
      bets: bets.map((bet) => ({
        id: bet.id,
        userId: bet.user_id,
        gameType: bet.game_type,
        betAmount: bet.bet_amount,
        winAmount: bet.win_amount,
        createdAt: new Date(bet.created_at),
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar histórico de apostas:", error);
    return { success: false, message: "Erro ao buscar histórico de apostas" };
  }
}
