"use server"

import { cookies } from "next/headers"
import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

// Tipos para os usuários
export type User = {
  id: string
  name: string
  email: string
  password: string // Em produção, use hash de senha
  balance: number
  isAdmin: boolean
  createdAt: Date
}

// Função para registrar um novo usuário
export async function registerUser(name: string, email: string, password: string) {
  // Verificar se o email já está em uso
  const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single()

  if (existingUser) {
    return { success: false, message: "Email já cadastrado" }
  }

  // Criar novo usuário
  const userId = uuidv4()
  const { error } = await supabase.from("users").insert([
    {
      id: userId,
      name,
      email,
      password, // Em produção, use hash de senha
      balance: 0,
      is_admin: false,
      created_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error("Erro ao registrar usuário:", error)
    return { success: false, message: "Erro ao registrar usuário" }
  }

  // Definir cookie de autenticação
  cookies().set("user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
  })

  return {
    success: true,
    user: {
      id: userId,
      name,
      email,
      balance: 0,
      isAdmin: false,
      createdAt: new Date(),
    },
  }
}

// Função para fazer login
export async function loginUser(email: string, password: string) {
  // Buscar usuário pelo email
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password) // Em produção, use hash de senha
    .single()

  if (error || !user) {
    return { success: false, message: "Email ou senha incorretos" }
  }

  // Definir cookie de autenticação
  cookies().set("user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
  })

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.is_admin,
      createdAt: new Date(user.created_at),
    },
  }
}

// Função para obter o usuário atual
export async function getCurrentUser() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return null
  }

  const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !user) {
    return null
  }

  // Retornar usuário sem a senha
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    isAdmin: user.is_admin,
    createdAt: new Date(user.created_at),
  }
}

// Função para fazer logout
export async function logoutUser() {
  cookies().delete("user_id")
  return { success: true }
}

// Funções para o painel administrativo

// Obter todos os usuários (apenas para admin)
export async function getAllUsers() {
  const currentUser = await getCurrentUser()

  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: "Acesso negado" }
  }

  const { data: users, error } = await supabase.from("users").select("*")

  if (error) {
    console.error("Erro ao buscar usuários:", error)
    return { success: false, message: "Erro ao buscar usuários" }
  }

  // Retornar todos os usuários sem as senhas
  return {
    success: true,
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.is_admin,
      createdAt: new Date(user.created_at),
    })),
  }
}

// Atualizar saldo de um usuário (apenas para admin)
export async function updateUserBalance(userId: string, newBalance: number) {
  const currentUser = await getCurrentUser()

  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: "Acesso negado" }
  }

  const { data: user, error } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar saldo:", error)
    return { success: false, message: "Erro ao atualizar saldo" }
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.is_admin,
      createdAt: new Date(user.created_at),
    },
  }
}

// Função para atualizar o próprio saldo (usado nos jogos)
export async function updateOwnBalance(newBalance: number) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Usuário não autenticado" }
  }

  const { data: user, error } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar saldo:", error)
    return { success: false, message: "Erro ao atualizar saldo" }
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.is_admin,
      createdAt: new Date(user.created_at),
    },
  }
}
