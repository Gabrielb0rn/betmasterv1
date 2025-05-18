"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/auth"
import { Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { AlertTriangle, Lock, Mail, User, Loader2, ArrowLeft, Check } from "lucide-react"
import { Notification } from "@/components/notification"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (!formData.name || !formData.email || !formData.password) {
      setError("Todos os campos são obrigatórios")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    try {
      setLoading(true)
      const result = await registerUser(formData.name, formData.email, formData.password)

      if (result.success) {
        setShowNotification(true)
        // Redirecionar para o dashboard após um breve delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError(result.message || "Erro ao cadastrar")
      }
    } catch (err) {
      setError("Ocorreu um erro ao processar seu cadastro")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Verificar força da senha
  const getPasswordStrength = () => {
    const { password } = formData
    if (!password) return { strength: 0, text: "" }

    let strength = 0
    let text = ""

    // Comprimento mínimo
    if (password.length >= 8) strength += 1

    // Contém números
    if (/\d/.test(password)) strength += 1

    // Contém letras minúsculas e maiúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1

    // Contém caracteres especiais
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1

    switch (strength) {
      case 0:
      case 1:
        text = "Fraca"
        break
      case 2:
        text = "Média"
        break
      case 3:
        text = "Boa"
        break
      case 4:
        text = "Forte"
        break
      default:
        text = ""
    }

    return { strength, text }
  }

  const passwordStrength = getPasswordStrength()
  const passwordStrengthColor = ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-green-600"][
    passwordStrength.strength
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      {showNotification && (
        <Notification
          type="success"
          message="Cadastro realizado com sucesso! Redirecionando..."
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
            <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center text-purple-100">
              Preencha os dados abaixo para criar sua conta
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
                <Label htmlFor="name" className="text-gray-700">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
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
                <Label htmlFor="password" className="text-gray-700">
                  Senha
                </Label>
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Força da senha:</span>
                      <span className="text-xs font-medium">{passwordStrength.text}</span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrengthColor}`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <Check
                          className={`h-3 w-3 mr-1 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`}
                        />
                        <span>Letra maiúscula</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Check
                          className={`h-3 w-3 mr-1 ${/[a-z]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`}
                        />
                        <span>Letra minúscula</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Check
                          className={`h-3 w-3 mr-1 ${/\d/.test(formData.password) ? "text-green-500" : "text-gray-300"}`}
                        />
                        <span>Número</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Check
                          className={`h-3 w-3 mr-1 ${formData.password.length >= 8 ? "text-green-500" : "text-gray-300"}`}
                        />
                        <span>Mínimo 8 caracteres</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-200"
                  />
                </div>
                {formData.password && formData.confirmPassword && (
                  <div className="flex items-center mt-1">
                    <Check
                      className={`h-4 w-4 mr-1 ${
                        formData.password === formData.confirmPassword ? "text-green-500" : "text-red-500"
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {formData.password === formData.confirmPassword ? "Senhas coincidem" : "Senhas não coincidem"}
                    </span>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 text-lg shadow-md hover:shadow-lg transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Cadastrando...
                  </span>
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center bg-gray-50 p-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-purple-700 hover:text-purple-900 font-medium hover:underline">
                  Faça login
                </Link>
              </p>
              <div>
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para a página inicial
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
