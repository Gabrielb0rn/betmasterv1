import type { Achievement } from "@/lib/types"
import { Award, Calendar, Check, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AchievementsShowcaseProps {
  achievements: Achievement[]
  availableAchievements: Achievement[]
  className?: string
}

export function AchievementsShowcase({ achievements, availableAchievements, className }: AchievementsShowcaseProps) {
  // Criar um mapa de conquistas desbloqueadas para fácil verificação
  const unlockedMap = new Map(achievements.map((a) => [a.id, a]))

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableAchievements.map((achievement) => {
          const isUnlocked = unlockedMap.has(achievement.id)
          const unlockedAchievement = isUnlocked ? unlockedMap.get(achievement.id) : null

          return (
            <Card
              key={achievement.id}
              className={cn(
                "border overflow-hidden transition-all duration-300",
                isUnlocked
                  ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200 opacity-70",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      isUnlocked ? "bg-yellow-500 text-white" : "bg-gray-300 text-gray-600",
                    )}
                  >
                    <Award className="h-5 w-5" />
                  </div>
                  <Badge
                    variant={isUnlocked ? "default" : "outline"}
                    className={cn(
                      isUnlocked ? "bg-green-500 hover:bg-green-500 text-white" : "text-gray-500 border-gray-300",
                    )}
                  >
                    {isUnlocked ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Desbloqueado
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" /> Bloqueado
                      </>
                    )}
                  </Badge>
                </div>
                <CardTitle className={cn("text-base", isUnlocked ? "text-amber-800" : "text-gray-700")}>
                  {achievement.name}
                </CardTitle>
                <CardDescription className={isUnlocked ? "text-amber-700" : "text-gray-500"}>
                  {achievement.description}
                </CardDescription>
              </CardHeader>
              {isUnlocked && unlockedAchievement?.unlockedAt && (
                <CardContent className="pt-0">
                  <div className="flex items-center text-xs text-amber-700">
                    <Calendar className="h-3 w-3 mr-1" />
                    Desbloqueado em {new Date(unlockedAchievement.unlockedAt).toLocaleDateString("pt-BR")}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
