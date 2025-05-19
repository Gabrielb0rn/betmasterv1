"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";

// Tipos para os usuários
export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // Em produção, use hash de senha
  balance: number;
  isAdmin: boolean;
  createdAt: Date;
};

// Função para registrar um novo usuário
export async function registerUser(name: string, email: string, password: string) {
  try {
    // Verificar se o email já está em uso
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return { success: false, message: "Email já cadastrado" };
    }

    // Criar novo usuário
    const userId = uuidv4();
    db.prepare(
      "INSERT INTO users (id, name, email, password, balance, is_admin) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(userId, name, email, password, 0, false);

    // Definir cookie de autenticação
    cookies().set("user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    });

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
    };
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return { success: false, message: "Erro ao registrar usuário" };
  }
}

// Função para fazer login
export async function loginUser(email: string, password: string) {
  try {
    const user = db
      .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
      .get(email, password);

    if (!user) {
      return { success: false, message: "Email ou senha incorretos" };
    }

    // Definir cookie de autenticação
    cookies().set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    });

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
    };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return { success: false, message: "Erro ao fazer login" };
  }
}

// Função para obter o usuário atual
export async function getCurrentUser() {
  try {
    const userId = cookies().get("user_id")?.value;

    if (!userId) {
      return null;
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.is_admin,
      createdAt: new Date(user.created_at),
    };
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    return null;
  }
}

// Função para fazer logout
export async function logoutUser() {
  cookies().delete("user_id");
  return { success: true };
}

// Funções para o painel administrativo

// Obter todos os usuários (apenas para admin)
export async function getAllUsers() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.isAdmin) {
      return { success: false, message: "Acesso negado" };
    }

    const users = db.prepare("SELECT * FROM users").all();

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
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return { success: false, message: "Erro ao buscar usuários" };
  }
}

// Atualizar saldo de um usuário (apenas para admin)
export async function updateUserBalance(userId: string, newBalance: number) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.isAdmin) {
      return { success: false, message: "Acesso negado" };
    }

    const user = db
      .prepare("UPDATE users SET balance = ? WHERE id = ? RETURNING *")
      .get(newBalance, userId);

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
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
    };
  } catch (error) {
    console.error("Erro ao atualizar saldo:", error);
    return { success: false, message: "Erro ao atualizar saldo" };
  }
}

// Função para atualizar o próprio saldo (usado nos jogos)
export async function updateOwnBalance(newBalance: number) {
  try {
    const userId = cookies().get("user_id")?.value;

    if (!userId) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const user = db
      .prepare("UPDATE users SET balance = ? WHERE id = ? RETURNING *")
      .get(newBalance, userId);

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
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
    };
  } catch (error) {
    console.error("Erro ao atualizar saldo:", error);
    return { success: false, message: "Erro ao atualizar saldo" };
  }
}
