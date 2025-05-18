"use client"

import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, description, icon: Icon, iconColor, trend }: StatsCardProps) {
  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {Icon && (
            <div className={cn("p-2 rounded-full bg-gray-100", iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>

          {trend && (
            <div
              className={cn(
                "flex items-center text-sm font-medium rounded-full px-2 py-1",
                trend.isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50",
              )}
            >
              <motion.div
                className={cn(
                  "w-0 h-0 border-x-4 border-x-transparent mr-1",
                  trend.isPositive
                    ? "border-b-0 border-t-4 border-t-green-700"
                    : "border-t-0 border-b-4 border-b-red-700",
                )}
                animate={{ y: trend.isPositive ? [-2, 0, -2] : [2, 0, 2] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              />
              {trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
