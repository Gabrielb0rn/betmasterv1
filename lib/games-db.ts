import { supabase } from "./auth"
import { v4 as uuidv4 } from "uuid"

// Get user bet history
export async function getUserBetHistory(userId?: string) {
  try {
    let userIdToUse = userId

    if (!userIdToUse) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return { success: false, message: "Usuário não autenticado", bets: [] }
      }

      userIdToUse = session.user.id
    }

    const { data, error } = await supabase
      .from("bet_history")
      .select("*")
      .eq("userId", userIdToUse)
      .order("timestamp", { ascending: false })

    if (error) {
      return { success: false, message: error.message, bets: [] }
    }

    return { success: true, bets: data || [] }
  } catch (error) {
    console.error("Error getting bet history:", error)
    return { success: false, message: "Erro ao obter histórico de apostas", bets: [] }
  }
}

// Place a bet and update user balance
export async function placeBet(gameType: string, betAmount: number, result: number, gameData: any = {}) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, message: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Get current user balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return { success: false, message: "Erro ao obter saldo do usuário" }
    }

    // Calculate profit
    const profit = betAmount * result - betAmount

    // Update user balance
    const newBalance = userData.balance + profit

    // Update user balance in database
    const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

    if (updateError) {
      return { success: false, message: "Erro ao atualizar saldo" }
    }

    // Record bet in history
    const { error: historyError } = await supabase.from("bet_history").insert([
      {
        id: uuidv4(),
        userId,
        gameType,
        betAmount,
        result,
        profit,
        timestamp: new Date().toISOString(),
        gameData,
      },
    ])

    if (historyError) {
      console.error("Error recording bet history:", historyError)
    }

    // Update user XP if they won
    if (profit > 0) {
      const xpGained = Math.floor(betAmount * 0.1)

      const { data: userXpData } = await supabase.from("users").select("xp, level").eq("id", userId).single()

      if (userXpData) {
        const newXp = (userXpData.xp || 0) + xpGained
        let newLevel = userXpData.level || 1

        // Check if user should level up
        const { data: levelData } = await supabase
          .from("levels")
          .select("level, xp_required")
          .order("level", { ascending: true })

        if (levelData) {
          for (const level of levelData) {
            if (newXp >= level.xp_required && level.level > newLevel) {
              newLevel = level.level
            }
          }
        }

        // Update user XP and level
        await supabase.from("users").update({ xp: newXp, level: newLevel }).eq("id", userId)
      }
    }

    return { success: true, newBalance }
  } catch (error) {
    console.error("Error placing bet:", error)
    return { success: false, message: "Erro ao processar aposta" }
  }
}

// Get all users (for admin)
export async function getAllUsers() {
  try {
    const { data, error } = await supabase.from("users").select("*").order("createdAt", { ascending: false })

    if (error) {
      return { success: false, message: error.message, users: [] }
    }

    return { success: true, users: data || [] }
  } catch (error) {
    console.error("Error getting users:", error)
    return { success: false, message: "Erro ao obter usuários", users: [] }
  }
}

// Get all bets (for admin)
export async function getAllBets() {
  try {
    const { data, error } = await supabase
      .from("bet_history")
      .select("*, users(name)")
      .order("timestamp", { ascending: false })

    if (error) {
      return { success: false, message: error.message, bets: [] }
    }

    return { success: true, bets: data || [] }
  } catch (error) {
    console.error("Error getting bets:", error)
    return { success: false, message: "Erro ao obter apostas", bets: [] }
  }
}

// Update user balance (for admin)
export async function updateUserBalance(userId: string, newBalance: number) {
  try {
    const { error } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating user balance:", error)
    return { success: false, message: "Erro ao atualizar saldo do usuário" }
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      return { success: false, message: error.message, user: null }
    }

    return { success: true, user: data }
  } catch (error) {
    console.error("Error getting user:", error)
    return { success: false, message: "Erro ao obter usuário", user: null }
  }
}

// Get game statistics
export async function getGameStatistics() {
  try {
    const { data, error } = await supabase.from("bet_history").select("gameType, betAmount, profit")

    if (error) {
      return { success: false, message: error.message, stats: null }
    }

    // Process statistics
    const stats = {
      totalBets: data.length,
      totalBetAmount: data.reduce((sum, bet) => sum + bet.betAmount, 0),
      totalProfit: data.reduce((sum, bet) => sum + bet.profit, 0),
      gameBreakdown: {} as Record<string, { bets: number; amount: number; profit: number }>,
    }

    // Calculate per-game statistics
    data.forEach((bet) => {
      if (!stats.gameBreakdown[bet.gameType]) {
        stats.gameBreakdown[bet.gameType] = { bets: 0, amount: 0, profit: 0 }
      }

      stats.gameBreakdown[bet.gameType].bets += 1
      stats.gameBreakdown[bet.gameType].amount += bet.betAmount
      stats.gameBreakdown[bet.gameType].profit += bet.profit
    })

    return { success: true, stats }
  } catch (error) {
    console.error("Error getting game statistics:", error)
    return { success: false, message: "Erro ao obter estatísticas", stats: null }
  }
}

// Get user level information
export async function getUserLevelInfo(userId: string) {
  try {
    // Get user's current level and XP
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("level, xp")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return { success: false, message: "Erro ao obter informações do usuário", levelInfo: null }
    }

    // Get level requirements
    const { data: levelData, error: levelError } = await supabase
      .from("levels")
      .select("*")
      .order("level", { ascending: true })

    if (levelError || !levelData) {
      return { success: false, message: "Erro ao obter informações de níveis", levelInfo: null }
    }

    // Find current level info
    const currentLevelInfo = levelData.find((level) => level.level === userData.level) || levelData[0]

    // Find next level info
    const nextLevelInfo = levelData.find((level) => level.level === userData.level + 1)

    // Calculate progress to next level
    let progressToNextLevel = 100 // Default to 100% if at max level
    let xpNeededForNextLevel = 0

    if (nextLevelInfo) {
      const currentLevelXP = currentLevelInfo.xp_required
      const nextLevelXP = nextLevelInfo.xp_required
      const xpRange = nextLevelXP - currentLevelXP
      const userProgressInRange = userData.xp - currentLevelXP
      progressToNextLevel = Math.min(100, Math.max(0, (userProgressInRange / xpRange) * 100))
      xpNeededForNextLevel = nextLevelXP - userData.xp
    }

    return {
      success: true,
      levelInfo: {
        currentLevel: userData.level,
        currentXP: userData.xp,
        currentLevelInfo,
        nextLevelInfo,
        progressToNextLevel,
        xpNeededForNextLevel,
      },
    }
  } catch (error) {
    console.error("Error getting user level info:", error)
    return { success: false, message: "Erro ao obter informações de nível", levelInfo: null }
  }
}
