"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "@/lib/auth"
import { Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Lock, Mail, Loader2 } from "lucide-react"
import { Notification } from "@/components/notification"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validações básicas
    if (!formData.email || !formData.password) {
      setError("Todos os campos são obrigatórios")
      return
    }

    try {
      setLoading(true)
      const result = await loginUser(formData.email, formData.password)

      if (result.success) {
        setShowNotification(true)
        // Redirecionar para o dashboard ou página inicial após um breve delay
        setTimeout(() => {
          if (result.user.isAdmin) {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        }, 1500)
      } else {
        setError(result.message || "Credenciais inválidas")
      }
    } catch (err) {
      setError("Ocorreu um erro ao processar seu login")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      {showNotification && (
        <Notification
          type="success"
          message="Login realizado com sucesso! Redirecionando..."
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-indigo-500/5"></div>
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="space-y-1 bg-gradient-to-r from-purple-700 to-indigo-700 text-white pb-6">
            <div className="flex justify-center mb-4">
              <Link href="/" className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-300" />
                <span className="text-2xl font-bold text-white">BetMaster</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center text-purple-100">
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm flex items-start"
              >
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700">
                    Senha
                  </Label>
                  <Link href="/auth/forgot-password" className="text-sm text-purple-700 hover:text-purple-900">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 text-lg shadow-md hover:shadow-lg transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-gray-50 p-6">
            <p className="text-sm text-gray-600 text-center">
              Não tem uma conta?{" "}
              <Link href="/auth/register" className="text-purple-700 hover:text-purple-900 font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
            <div className="text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para a página inicial
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
