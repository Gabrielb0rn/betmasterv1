import type { LeaderboardEntry } from "@/lib/types"
import { Medal, Trophy, Award } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  title?: string
  className?: string
}

export function Leaderboard({ entries, title = "Classificação", className }: LeaderboardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Posição</TableHead>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-right">Pontuação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.userId} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center">
                    {entry.rank === 1 ? (
                      <div className="bg-yellow-500 text-white p-1 rounded-full">
                        <Trophy className="h-4 w-4" />
                      </div>
                    ) : entry.rank === 2 ? (
                      <div className="bg-gray-400 text-white p-1 rounded-full">
                        <Medal className="h-4 w-4" />
                      </div>
                    ) : entry.rank === 3 ? (
                      <div className="bg-amber-700 text-white p-1 rounded-full">
                        <Award className="h-4 w-4" />
                      </div>
                    ) : (
                      <span className="font-medium text-gray-500 ml-2">{entry.rank}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs mr-2">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{entry.score.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
