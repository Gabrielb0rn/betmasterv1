import Link from "next/link"
import { Trophy, Twitter, Instagram, Facebook, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold">BetMaster</span>
            </div>
            <p className="text-gray-400 text-sm">
              A melhor plataforma de apostas online. Jogue com responsabilidade e divirta-se!
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Jogos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jogos/mines" className="text-gray-400 hover:text-white transition-colors">
                  Mines
                </Link>
              </li>
              <li>
                <Link href="/jogos/crash" className="text-gray-400 hover:text-white transition-colors">
                  Crash
                </Link>
              </li>
              <li>
                <Link href="/jogos/plinko" className="text-gray-400 hover:text-white transition-colors">
                  Plinko
                </Link>
              </li>
              <li>
                <Link href="/jogos/roleta" className="text-gray-400 hover:text-white transition-colors">
                  Roleta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-400 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/jogo-responsavel" className="text-gray-400 hover:text-white transition-colors">
                  Jogo Responsável
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-400 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/suporte" className="text-gray-400 hover:text-white transition-colors">
                  Suporte ao Cliente
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} BetMaster. Todos os direitos reservados.
          </div>
          <div className="flex space-x-4">
            <img
              src="/placeholder.svg?height=30&width=50"
              alt="Método de pagamento"
              className="h-8 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              src="/placeholder.svg?height=30&width=50"
              alt="Método de pagamento"
              className="h-8 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              src="/placeholder.svg?height=30&width=50"
              alt="Método de pagamento"
              className="h-8 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              src="/placeholder.svg?height=30&width=50"
              alt="Método de pagamento"
              className="h-8 opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
