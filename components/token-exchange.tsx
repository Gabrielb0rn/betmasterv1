"use client"

import type { TokenExchange } from "@/lib/types"
import { Coins } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { exchangeTokens } from "@/lib/gamification"
import { toast } from "@/components/ui/use-toast"

interface TokenExchangeProps {
  items: TokenExchange[]
  userTokens: number
  className?: string
  onExchange?: (success: boolean) => void
}

export function TokenExchangeComponent({ items, userTokens, className, onExchange }: TokenExchangeProps) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleExchange = async (item: TokenExchange) => {
    if (userTokens < item.tokenCost) {
      toast({
        title: "Fichas insuficientes",
        description: `Você precisa de ${item.tokenCost} fichas para trocar por este item.`,
        variant: "destructive",
      })
      return
    }

    setProcessing(item.id)
    try {
      const result = await exchangeTokens(item.id)

      if (result.success) {
        toast({
          title: "Troca realizada com sucesso!",
          description: result.message,
        })
        if (onExchange) onExchange(true)
      } else {
        toast({
          title: "Erro na troca",
          description: result.message,
          variant: "destructive",
        })
        if (onExchange) onExchange(false)
      }
    } catch (error) {
      toast({
        title: "Erro na troca",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      })
      if (onExchange) onExchange(false)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Loja de Recompensas</h3>
        <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
          <Coins className="h-4 w-4 text-amber-600 mr-1.5" />
          <span className="font-medium text-amber-800">{userTokens} fichas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const canAfford = userTokens >= item.tokenCost

          return (
            <Card
              key={item.id}
              className={cn(
                "border overflow-hidden transition-all duration-300",
                canAfford ? "border-amber-200 hover:border-amber-300" : "border-gray-200 opacity-70",
              )}
            >
              <div className="h-32 bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Coins className="h-12 w-12 text-white" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 text-amber-600 mr-1" />
                    <span className="font-medium">{item.tokenCost}</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={!canAfford || processing === item.id}
                    onClick={() => handleExchange(item)}
                    className={cn(canAfford ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-400 cursor-not-allowed")}
                  >
                    {processing === item.id ? "Processando..." : "Trocar"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
