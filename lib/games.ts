export type BetHistory = {
  id: string
  userId: string
  gameType: string
  betAmount: number
  result: number
  profit: number
  timestamp: string
  gameData: any
}

// Re-export functions from games-db.ts
export * from "./games-db"

// Local game logic functions

// Mines game
export async function playMinesGame(grid: boolean[], mineCount: number, selectedCells: number[]) {
  // Create a copy of the grid
  const newGrid = [...grid]

  // Check if the selected cell has a mine
  const hasMine = selectedCells.some((index) => newGrid[index])

  // Calculate result multiplier based on risk and number of selected cells
  let multiplier = 0

  if (!hasMine) {
    // Calculate multiplier based on probability
    // The more mines and fewer selected cells, the higher the multiplier
    const gridSize = newGrid.length
    const safeCount = gridSize - mineCount
    const selectedSafeCount = selectedCells.length

    // Basic formula: (gridSize / safeCount) * (selectedSafeCount / gridSize)
    multiplier = (gridSize / safeCount) * (selectedSafeCount / safeCount)

    // Round to 2 decimal places
    multiplier = Math.round(multiplier * 100) / 100
  }

  return {
    hasMine,
    multiplier,
    grid: newGrid,
  }
}

// Crash game
export async function playCrashGame(cashoutMultiplier: number) {
  // Generate a random crash point with a house edge
  // The distribution is exponential with a house edge

  // House edge (5%)
  const houseEdge = 0.05

  // Generate a random number between 0 and 1
  const rand = Math.random()

  // Calculate crash point with house edge
  // Formula: 99 / (1 - r) * (1 - houseEdge)
  // This creates an exponential distribution with a minimum of 1.0
  const crashPoint = Math.max(1.0, (99 / (100 * rand)) * (1 - houseEdge))

  // Round to 2 decimal places
  const roundedCrashPoint = Math.floor(crashPoint * 100) / 100

  // Check if player cashed out before crash
  const playerWon = cashoutMultiplier <= roundedCrashPoint

  // Calculate multiplier
  const multiplier = playerWon ? cashoutMultiplier : 0

  return {
    crashPoint: roundedCrashPoint,
    playerWon,
    multiplier,
  }
}

// Plinko game
export async function playPlinkoGame(rows: number, riskLevel: "low" | "medium" | "high") {
  // Define multipliers based on risk level
  const multipliers = {
    low: [1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 2, 3, 5],
    medium: [0.5, 0.8, 1, 1.5, 2, 3, 5, 10, 20],
    high: [0.2, 0.3, 0.5, 0.8, 1.5, 3, 10, 25, 50],
  }

  // Simulate ball path
  // For each row, the ball has a 50% chance to go left or right
  let position = 0
  for (let i = 0; i < rows; i++) {
    position += Math.random() < 0.5 ? -1 : 1
  }

  // Normalize position to get the multiplier index
  const maxPosition = rows
  const normalizedPosition = Math.floor(
    ((position + maxPosition) / (2 * maxPosition)) * (multipliers[riskLevel].length - 1),
  )

  // Get the multiplier
  const multiplier = multipliers[riskLevel][normalizedPosition]

  return {
    position,
    multiplier,
    path: [], // In a real implementation, we would track the full path
  }
}

// Roulette game
export async function playRouletteGame(bets: any[]) {
  // Generate a random number (0-36)
  const result = Math.floor(Math.random() * 37)

  // Determine color
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  const color = result === 0 ? "green" : redNumbers.includes(result) ? "red" : "black"

  // Check each bet to see if it's a winner
  let totalMultiplier = 0

  for (const bet of bets) {
    let win = false

    if (bet.type === "number" && bet.value === result) {
      win = true
      totalMultiplier += bet.odds
    } else if (bet.type === "color" && bet.value === color) {
      win = true
      totalMultiplier += bet.odds
    } else if (bet.type === "parity") {
      if (result !== 0) {
        if (bet.value === "even" && result % 2 === 0) win = true
        if (bet.value === "odd" && result % 2 !== 0) win = true
        if (win) totalMultiplier += bet.odds
      }
    } else if (bet.type === "range") {
      if (bet.value === "1-18" && result >= 1 && result <= 18) {
        win = true
        totalMultiplier += bet.odds
      }
      if (bet.value === "19-36" && result >= 19 && result <= 36) {
        win = true
        totalMultiplier += bet.odds
      }
    } else if (bet.type === "dozen") {
      if (bet.value === "1st" && result >= 1 && result <= 12) {
        win = true
        totalMultiplier += bet.odds
      }
      if (bet.value === "2nd" && result >= 13 && result <= 24) {
        win = true
        totalMultiplier += bet.odds
      }
      if (bet.value === "3rd" && result >= 25 && result <= 36) {
        win = true
        totalMultiplier += bet.odds
      }
    } else if (bet.type === "column") {
      if (result !== 0) {
        const column = ((result - 1) % 3) + 1
        if (bet.value === column) {
          win = true
          totalMultiplier += bet.odds
        }
      }
    }
  }

  return {
    result,
    color,
    totalMultiplier,
  }
}
