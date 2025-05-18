"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DollarSign, Users, Gamepad2, Bomb, Rocket, Droplets, CircleDashed, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { FeaturedGame } from "@/components/featured-game"

export default function Home() {
  const featuredGames = [
    {
      title: "Mines",
      description: "Encontre os diamantes e evite as minas para multiplicar seus ganhos!",
      icon: Bomb,
      href: "/jogos/mines",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      title: "Crash",
      description: "Aposte e retire antes que o foguete caia para ganhar grandes multiplicadores!",
      icon: Rocket,
      href: "/jogos/crash",
      color: "bg-gradient-to-br from-red-600 to-red-800",
    },
    {
      title: "Plinko",
      description: "Veja as bolinhas caírem e acertarem multiplicadores aleatórios!",
      icon: Droplets,
      href: "/jogos/plinko",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
    },
    {
      title: "Roleta",
      description: "Aposte em números, cores ou paridade e veja a roleta girar!",
      icon: CircleDashed,
      href: "/jogos/roleta",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-yellow-400 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-purple-400 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500 blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center">
              <motion.div
                className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300">
                  Aposte, Ganhe e Divirta-se!
                </h1>
                <p className="text-xl mb-10 max-w-2xl mx-auto lg:mx-0 text-purple-100">
                  A melhor plataforma de apostas online. Jogos emocionantes, pagamentos rápidos e bônus exclusivos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 hover:from-yellow-300 hover:to-yellow-400 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                    >
                      Começar Agora
                    </Button>
                  </Link>
                  <Link href="/jogos">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-6 text-lg w-full sm:w-auto"
                    >
                      Explorar Jogos
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur-lg opacity-75 animate-pulse"></div>
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="BetMaster Platform"
                    className="relative rounded-lg shadow-2xl border border-purple-500/20 w-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-4 text-purple-900">Jogos em Destaque</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Experimente nossos jogos mais populares e tenha a chance de ganhar grandes prêmios!
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredGames.map((game, index) => (
                <FeaturedGame key={game.title} {...game} index={index} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/jogos">
                <Button className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6" size="lg">
                  Ver Todos os Jogos <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-4 text-purple-900">Por que escolher o BetMaster?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Oferecemos a melhor experiência de apostas online com recursos exclusivos e benefícios incríveis.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <motion.div
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full border border-gray-100">
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 text-white">
                    <div className="bg-white/20 p-3 rounded-full inline-flex mb-4">
                      <Gamepad2 className="h-8 w-8 text-yellow-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Jogos Emocionantes</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">
                      Diversos jogos de apostas para você se divertir e ganhar. Experimente Crash, Mines, Plinko e muito
                      mais!
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Jogos exclusivos
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Grandes multiplicadores
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Interface intuitiva
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full border border-gray-100">
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white">
                    <div className="bg-white/20 p-3 rounded-full inline-flex mb-4">
                      <Users className="h-8 w-8 text-yellow-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Comunidade Ativa</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">
                      Faça parte de uma comunidade de apostadores apaixonados. Compartilhe estratégias e celebre suas
                      vitórias!
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Chat ao vivo
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Torneios exclusivos
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Eventos especiais
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full border border-gray-100">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                    <div className="bg-white/20 p-3 rounded-full inline-flex mb-4">
                      <DollarSign className="h-8 w-8 text-yellow-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Pagamentos Rápidos</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">
                      Depósitos instantâneos e saques rápidos. Gerencie seu saldo com facilidade e segurança!
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Múltiplos métodos de pagamento
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Saques em até 24h
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span> Transações seguras
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">Pronto para começar a ganhar?</h2>
                <p className="text-xl mb-8 text-purple-100">
                  Junte-se a milhares de jogadores e comece sua jornada de apostas agora mesmo!
                </p>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 hover:from-yellow-300 hover:to-yellow-400 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Criar Conta Grátis
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
