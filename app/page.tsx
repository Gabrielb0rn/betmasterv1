import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Trophy, Users, Shield, Gift, Zap } from "lucide-react"
import { MainNav } from "@/components/main-nav"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="hero-gradient text-white py-20 md:py-32">
          <div className="container mx-auto px-4 text-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow">
                Bem-vindo ao <span className="text-accent">BetMaster</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
                A melhor plataforma de apostas online. Cadastre-se agora e comece a jogar!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-black font-bold px-8 py-6 text-lg">
                    Começar Agora
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                  >
                    Já tenho uma conta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Por que escolher o <span className="text-primary">BetMaster</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
                      <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Jogos Emocionantes</h3>
                    <p className="text-muted-foreground">Diversos jogos de apostas para você se divertir e ganhar.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="bg-secondary/10 p-3 rounded-full inline-flex mb-4">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Comunidade Ativa</h3>
                    <p className="text-muted-foreground">Faça parte de uma comunidade de apostadores apaixonados.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="bg-accent/10 p-3 rounded-full inline-flex mb-4">
                      <DollarSign className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Gestão de Saldo</h3>
                    <p className="text-muted-foreground">Acompanhe seu saldo e histórico de apostas facilmente.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Benefícios Exclusivos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">Segurança Garantida</h3>
                <p className="text-muted-foreground">
                  Sua conta e transações são protegidas com a mais alta tecnologia de segurança.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Gift className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-lg font-bold mb-2">Bônus Diários</h3>
                <p className="text-muted-foreground">
                  Receba bônus diários e promoções exclusivas para aumentar suas chances.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Zap className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-lg font-bold mb-2">Pagamentos Rápidos</h3>
                <p className="text-muted-foreground">Saques e depósitos processados com rapidez e eficiência.</p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">Suporte 24/7</h3>
                <p className="text-muted-foreground">
                  Nossa equipe está sempre disponível para ajudar com qualquer dúvida.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/10 dark:bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
              Junte-se a milhares de jogadores e comece a sua jornada de apostas agora mesmo.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-card py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">BetMaster</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} BetMaster. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
