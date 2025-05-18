import type { UserLevel } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Zap } from "lucide-react"

interface LevelProgressProps {
  level: UserLevel
}

export function LevelProgress({ level }: LevelProgressProps) {
  const progressPercentage = Math.round((level.currentXP / level.requiredXP) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-100 p-1.5 rounded-full mr-2">
            <Zap className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Nível {level.level}</span>
        </div>
        <span className="text-xs text-gray-500">
          {level.currentXP}/{level.requiredXP} XP
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Nível {level.level}</span>
        <span>Nível {level.level + 1}</span>
      </div>
    </div>
  )
}
