"use server"

import { cookies } from "next/headers"
import { getServerSupabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

// Types for users
export type User = {
  id: string
  name: string
  email: string
  balance: number
  isAdmin: boolean
  createdAt: Date
}

// Register a new user
export async function registerUser(name: string, email: string, password: string) {
  const supabase = getServerSupabase()

  // Check if email is already in use
  const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single()

  if (existingUser) {
    return { success: false, message: "Email já cadastrado" }
  }

  // Create new user
  const userId = uuidv4()
  const { error } = await supabase.from("users").insert([
    {
      id: userId,
      name,
      email,
      password, // In production, use password hashing
      balance: 0,
      is_admin: false,
    },
  ])

  if (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "Erro ao registrar usuário" }
  }

  // Set authentication cookie
  cookies().set("user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
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

// Login user
export async function loginUser(email: string, password: string) {
  const supabase = getServerSupabase()

  // Find user by email and password
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password) // In production, use password hashing
    .single()

  if (error || !user) {
    return { success: false, message: "Email ou senha incorretos" }
  }

  // Set authentication cookie
  cookies().set("user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
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

// Get current user
export async function getCurrentUser() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return null
  }

  const supabase = getServerSupabase()
  const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !user) {
    return null
  }

  // Return user without password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    isAdmin: user.is_admin,
    createdAt: new Date(user.created_at),
  }
}

// Logout user
export async function logoutUser() {
  cookies().delete("user_id")
  return { success: true }
}

// Admin functions

// Get all users (admin only)
export async function getAllUsers() {
  const currentUser = await getCurrentUser()

  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: "Acesso negado" }
  }

  const supabase = getServerSupabase()
  const { data: users, error } = await supabase.from("users").select("*")

  if (error) {
    console.error("Error fetching users:", error)
    return { success: false, message: "Erro ao buscar usuários" }
  }

  // Return all users without passwords
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

// Update user balance (admin only)
export async function updateUserBalance(userId: string, newBalance: number) {
  const currentUser = await getCurrentUser()

  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: "Acesso negado" }
  }

  const supabase = getServerSupabase()
  const { data: user, error } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating balance:", error)
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

// Update own balance (used in games)
export async function updateOwnBalance(newBalance: number) {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return { success: false, message: "Usuário não autenticado" }
  }

  const supabase = getServerSupabase()
  const { data: user, error } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating balance:", error)
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
