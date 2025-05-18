"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AuthCheck from "@/components/auth-check"
import { getCurrentUser } from "@/lib/auth"
import { Bomb, ChevronRight, Droplets, Rocket, CircleDashed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function JogosPage() {
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
      icone: <Bomb className="h-10 w-10 text-yellow-300" />,
      cor: "bg-gradient-to-br from-purple-600 to-purple-800",
      popularidade: "Popular",
      multiplicador: "Até 45x",
    },
    {
      id: "crash",
      nome: "Crash",
      descricao: "Aposte e retire antes que o foguete caia para multiplicar seus ganhos!",
      icone: <Rocket className="h-10 w-10 text-yellow-300" />,
      cor: "bg-gradient-to-br from-red-600 to-red-800",
      popularidade: "Hot",
      multiplicador: "Ilimitado",
    },
    {
      id: "plinko",
      nome: "Plinko",
      descricao: "Veja as bolinhas caírem e acertarem multiplicadores aleatórios!",
      icone: <Droplets className="h-10 w-10 text-yellow-300" />,
      cor: "bg-gradient-to-br from-blue-600 to-blue-800",
      popularidade: "Novo",
      multiplicador: "Até 45x",
    },
    {
      id: "roleta",
      nome: "Roleta",
      descricao: "Aposte em números, cores ou paridade e veja a roleta girar!",
      icone: <CircleDashed className="h-10 w-10 text-yellow-300" />,
      cor: "bg-gradient-to-br from-green-600 to-green-800",
      popularidade: "Clássico",
      multiplicador: "Até 36x",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AuthCheck>
      <div className="flex justify-between items-center mb-12">
        <motion.h1
          className="text-3xl font-bold text-gray-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Jogos Disponíveis
        </motion.h1>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/dashboard">
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              Voltar ao Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {jogos.map((jogo, index) => (
          <motion.div
            key={jogo.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Link href={`/jogos/${jogo.id}`} className="block h-full">
              <div
                className={`${jogo.cor} h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
              >
                <div className="p-8 text-white relative overflow-hidden h-full flex flex-col">
                  <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity">
                    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-black/10"></div>
                  </div>
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <div className="bg-white/20 p-3 rounded-full">{jogo.icone}</div>
                      <motion.div
                        className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                      >
                        {jogo.popularidade}
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{jogo.nome}</h3>
                    <p className="text-white/80 mb-6 flex-1">{jogo.descricao}</p>
                    <div className="flex justify-between items-center">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{jogo.multiplicador}</span>
                      <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </AuthCheck>
  )
}
