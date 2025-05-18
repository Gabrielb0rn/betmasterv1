import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  name: string
  email: string
  password?: string
  balance: number
  isAdmin: boolean
  createdAt: string
  level?: number
  xp?: number
}

// Get the current logged-in user
export async function getCurrentUser() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    // Get user data from the users table
    const { data: userData } = await supabase.from("users").select("*").eq("id", data.user.id).single()

    return { success: true, user: userData }
  } catch (error) {
    console.error("Error logging in:", error)
    return { success: false, message: "Erro ao fazer login" }
  }
}

// Register user
export async function registerUser(name: string, email: string, password: string) {
  try {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    if (!data.user) {
      return { success: false, message: "Erro ao criar usuário" }
    }

    // Create user in users table
    const { error: userError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        name,
        email,
        balance: 1000, // Initial balance
        isAdmin: false,
        createdAt: new Date().toISOString(),
        level: 1,
        xp: 0,
      },
    ])

    if (userError) {
      return { success: false, message: userError.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Error registering:", error)
    return { success: false, message: "Erro ao registrar usuário" }
  }
}

// Logout user
export async function logoutUser() {
  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    console.error("Error logging out:", error)
    return { success: false, message: "Erro ao fazer logout" }
  }
}
