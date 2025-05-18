export interface UserLevel {
  level: number
  currentXP: number
  requiredXP: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date | null
}

export interface GameUser {
  id: string
  name: string
  email: string
  balance: number
  createdAt: Date
  level: UserLevel
  tokens: number
  achievements: Achievement[]
}

export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  rank: number
  avatar?: string
}

export interface TokenExchange {
  id: string
  name: string
  description: string
  tokenCost: number
  image: string
}
