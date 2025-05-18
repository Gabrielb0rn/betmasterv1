"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export default function CreateAdminPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Basic validations
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
      const supabase = getSupabase()

      // Check if email already exists
      const { data: existingUser } = await supabase.from("users").select("*").eq("email", formData.email).single()

      if (existingUser) {
        setError("Email já cadastrado")
        return
      }

      // Create admin user
      const userId = uuidv4()
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: userId,
          name: formData.name,
          email: formData.email,
          password: formData.password, // In production, use password hashing
          balance: 1000, // Give some initial balance
          is_admin: true, // This is an admin account
        },
      ])

      if (insertError) {
        console.error("Error creating admin:", insertError)
        setError("Erro ao criar administrador")
        return
      }

      setSuccess(true)
      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    } catch (err) {
      console.error("Error:", err)
      setError("Ocorreu um erro ao processar seu cadastro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Criar Conta de Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{error}</div>}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
              Administrador criado com sucesso! Agora você pode fazer login.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Digite seu nome completo"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar Administrador"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => router.push("/auth/login")}>
              Voltar para o login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
