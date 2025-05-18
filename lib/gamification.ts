import { getCurrentUser } from "./auth"
import type { GameUser, Achievement, LeaderboardEntry, TokenExchange, UserLevel } from "./types"

// Função para calcular o nível com base no XP
function calculateLevel(xp: number): UserLevel {
  const baseXP = 100
  const multiplier = 1.5

  let level = 1
  let requiredXP = baseXP
  let currentXP = xp

  while (currentXP >= requiredXP) {
    currentXP -= requiredXP
    level++
    requiredXP = Math.floor(baseXP * Math.pow(multiplier, level - 1))
  }

  return {
    level,
    currentXP,
    requiredXP,
  }
}

// Conquistas disponíveis no sistema
const availableAchievements: Achievement[] = [
  {
    id: "first-win",
    name: "Primeira Vitória",
    description: "Ganhe sua primeira aposta",
    icon: "trophy",
    unlockedAt: null,
  },
  {
    id: "big-win",
    name: "Grande Vitória",
    description: "Ganhe mais de R$100 em uma única aposta",
    icon: "award",
    unlockedAt: null,
  },
  {
    id: "streak-3",
    name: "Sequência de Vitórias",
    description: "Ganhe 3 apostas consecutivas",
    icon: "zap",
    unlockedAt: null,
  },
  {
    id: "mines-expert",
    name: "Especialista em Mines",
    description: "Ganhe 10 vezes no jogo Mines",
    icon: "bomb",
    unlockedAt: null,
  },
  {
    id: "crash-master",
    name: "Mestre do Crash",
    description: "Retire com multiplicador acima de 10x",
    icon: "rocket",
    unlockedAt: null,
  },
  {
    id: "high-roller",
    name: "Apostador VIP",
    description: "Aposte mais de R$1000 no total",
    icon: "diamond",
    unlockedAt: null,
  },
  {
    id: "daily-login-7",
    name: "Jogador Dedicado",
    description: "Faça login 7 dias consecutivos",
    icon: "calendar",
    unlockedAt: null,
  },
  {
    id: "all-games",
    name: "Explorador",
    description: "Jogue todos os jogos disponíveis",
    icon: "map",
    unlockedAt: null,
  },
  {
    id: "token-collector",
    name: "Colecionador de Fichas",
    description: "Acumule 100 fichas",
    icon: "coins",
    unlockedAt: null,
  },
  {
    id: "referral",
    name: "Influenciador",
    description: "Convide 3 amigos para a plataforma",
    icon: "users",
    unlockedAt: null,
  },
]

// Itens disponíveis para troca por fichas
const availableTokenExchanges: TokenExchange[] = [
  {
    id: "bonus-50",
    name: "Bônus de R$50",
    description: "Adicione R$50 ao seu saldo",
    tokenCost: 100,
    image: "/images/bonus.png",
  },
  {
    id: "free-bet-10",
    name: "Aposta Grátis R$10",
    description: "Uma aposta grátis de R$10 em qualquer jogo",
    tokenCost: 20,
    image: "/images/free-bet.png",
  },
  {
    id: "multiplier-boost",
    name: "Boost de Multiplicador",
    description: "Aumente seus multiplicadores em 10% por 24h",
    tokenCost: 50,
    image: "/images/boost.png",
  },
  {
    id: "vip-status",
    name: "Status VIP (1 semana)",
    description: "Acesso a jogos exclusivos e bônus diários",
    tokenCost: 200,
    image: "/images/vip.png",
  },
]

// Função para obter o usuário com dados de gamificação
export async function getGameUser(): Promise<GameUser> {
  // Obter dados básicos do usuário
  const user = await getCurrentUser()

  // Simular dados de gamificação (em produção, isso viria do banco de dados)
  const xp = Math.floor(Math.random() * 1000)
  const level = calculateLevel(xp)
  const tokens = Math.floor(Math.random() * 200)

  // Simular algumas conquistas desbloqueadas
  const unlockedAchievements = availableAchievements.slice(0, Math.floor(Math.random() * 5)).map((achievement) => ({
    ...achievement,
    unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }))

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    createdAt: user.createdAt,
    level,
    tokens,
    achievements: unlockedAchievements,
  }
}

// Função para obter a tabela de classificação
export async function getLeaderboard(gameType = "all", limit = 10): Promise<LeaderboardEntry[]> {
  // Simular dados de leaderboard (em produção, isso viria do banco de dados)
  const leaderboard: LeaderboardEntry[] = []

  for (let i = 0; i < limit; i++) {
    leaderboard.push({
      userId: `user-${i}`,
      username: `Jogador${i + 1}`,
      score: Math.floor(Math.random() * 10000),
      rank: i + 1,
    })
  }

  // Ordenar por pontuação
  return leaderboard.sort((a, b) => b.score - a.score)
}

// Função para obter as conquistas disponíveis
export function getAvailableAchievements(): Achievement[] {
  return availableAchievements
}

// Função para obter os itens disponíveis para troca por fichas
export function getTokenExchanges(): TokenExchange[] {
  return availableTokenExchanges
}

// Função para adicionar XP ao usuário
export async function addUserXP(xpAmount: number): Promise<UserLevel> {
  // Em produção, isso atualizaria o XP no banco de dados
  const user = await getGameUser()
  const totalXP = user.level.currentXP + xpAmount + (user.level.level - 1) * user.level.requiredXP
  return calculateLevel(totalXP)
}

// Função para desbloquear uma conquista
export async function unlockAchievement(achievementId: string): Promise<Achievement | null> {
  // Em produção, isso atualizaria as conquistas no banco de dados
  const achievement = availableAchievements.find((a) => a.id === achievementId)

  if (achievement) {
    return {
      ...achievement,
      unlockedAt: new Date(),
    }
  }

  return null
}

// Função para trocar fichas por um item
export async function exchangeTokens(exchangeId: string): Promise<{ success: boolean; message: string }> {
  // Em produção, isso atualizaria o saldo de fichas e aplicaria a recompensa
  const exchange = availableTokenExchanges.find((e) => e.id === exchangeId)
  const user = await getGameUser()

  if (!exchange) {
    return { success: false, message: "Item não encontrado" }
  }

  if (user.tokens < exchange.tokenCost) {
    return { success: false, message: "Fichas insuficientes" }
  }

  // Simular troca bem-sucedida
  return { success: true, message: `Você trocou ${exchange.tokenCost} fichas por ${exchange.name}` }
}
