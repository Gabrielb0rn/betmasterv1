"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Bomb, ChevronRight, Coins, Droplets, Rocket, CircleDashed, Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { motion } from "framer-motion"

export default function JogosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const jogos = [
    {
      id: "mines",
      nome: "Mines",
      descricao: "Encontre os quadrados seguros e evite as minas para ganhar!",
      icone: <Bomb className="h-12 w-12 text-white" />,
      cor: "from-purple-500 to-purple-700",
      popularidade: "Alta",
    },
    {
      id: "crash",
      nome: "Crash",
      descricao: "Aposte e retire antes que o foguete caia para multiplicar seus ganhos!",
      icone: <Rocket className="h-12 w-12 text-white" />,
      cor: "from-red-500 to-red-700",
      popularidade: "Muito Alta",
    },
    {
      id: "plinko",
      nome: "Plinko",
      descricao: "Veja as bolinhas caírem e acertarem multiplicadores aleatórios!",
      icone: <Droplets className="h-12 w-12 text-white" />,
      cor: "from-blue-500 to-blue-700",
      popularidade: "Média",
    },
    {
      id: "roleta",
      nome: "Roleta",
      descricao: "Aposte em números, cores ou paridade e veja a roleta girar!",
      icone: <CircleDashed className="h-12 w-12 text-white" />,
      cor: "from-green-500 to-green-700",
      popularidade: "Alta",
    },
    {
      id: "dados",
      nome: "Dados",
      descricao: "Aposte no resultado dos dados e multiplique suas chances!",
      icone: <Dices className="h-12 w-12 text-white" />,
      cor: "from-yellow-500 to-yellow-700",
      popularidade: "Baixa",
      emBreve: true,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <MainNav />

        <main className="container mx-auto px-4 py-24">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Jogos Disponíveis</h1>
              <p className="text-muted-foreground">Escolha entre nossa variedade de jogos emocionantes</p>
            </div>
            <div className="balance-badge mt-4 md:mt-0">
              <Coins className="h-5 w-5 text-accent" />
              <span className="font-medium">R$ {user?.balance.toFixed(2)}</span>
            </div>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {jogos.map((jogo) => (
              <motion.div key={jogo.id} variants={item}>
                <Link href={jogo.emBreve ? "#" : `/jogos/${jogo.id}`}>
                  <Card className="game-card h-full cursor-pointer overflow-hidden border-0 shadow-lg">
                    <div className={`game-card-gradient bg-gradient-to-br ${jogo.cor}`}>
                      {jogo.emBreve && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Em breve
                        </div>
                      )}
                    </div>
                    <div className="game-card-content">
                      <div className="flex justify-between items-start">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">{jogo.icone}</div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full mb-2">
                            Popularidade: {jogo.popularidade}
                          </span>
                          <ChevronRight className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mt-4 mb-2">{jogo.nome}</h3>
                      <p className="text-white/80 mb-4">{jogo.descricao}</p>
                      <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm" disabled={jogo.emBreve}>
                        {jogo.emBreve ? "Em breve" : "Jogar Agora"}
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </AuthCheck>
  )
}
