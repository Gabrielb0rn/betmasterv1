"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AuthCheck from "@/components/auth-check"
import { getAllUsers, logoutUser, updateUserBalance, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { DollarSign, LogOut, Search, Trophy, Users } from "lucide-react"

type UserWithoutPassword = Omit<User, "password">

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithoutPassword[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<{ id: string; balance: number } | null>(null)

  useEffect(() => {
    async function loadUsers() {
      try {
        const result = await getAllUsers()
        if (result.success) {
          setUsers(result.users)
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const startEditBalance = (user: UserWithoutPassword) => {
    setEditingUser({ id: user.id, balance: user.balance })
  }

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        balance: Number.parseFloat(e.target.value) || 0,
      })
    }
  }

  const saveBalance = async () => {
    if (editingUser) {
      try {
        const result = await updateUserBalance(editingUser.id, editingUser.balance)
        if (result.success) {
          // Atualizar a lista de usuários
          setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, balance: editingUser.balance } : user)))
          setEditingUser(null)
        }
      } catch (error) {
        console.error("Erro ao atualizar saldo:", error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  return (
    <AuthCheck adminOnly>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-purple-700" />
                <h1 className="text-xl font-bold text-purple-700">BetMaster Admin</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Painel Administrativo</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-700" />
                  Total de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-purple-700">{users.length}</div>
                  <p className="text-sm text-gray-500 mt-2">Usuários cadastrados na plataforma</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-purple-700" />
                  Saldo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-purple-700">
                    R$ {users.reduce((total, user) => total + user.balance, 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Saldo total de todos os usuários</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-700" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuários por nome ou email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Saldo (R$)</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>
                            {editingUser && editingUser.id === user.id ? (
                              <Input
                                type="number"
                                value={editingUser.balance}
                                onChange={handleBalanceChange}
                                className="w-24"
                              />
                            ) : (
                              user.balance.toFixed(2)
                            )}
                          </TableCell>
                          <TableCell>
                            {editingUser && editingUser.id === user.id ? (
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={saveBalance} className="bg-green-600 hover:bg-green-700">
                                  Salvar
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => startEditBalance(user)}
                                className="bg-purple-700 hover:bg-purple-800"
                              >
                                Editar Saldo
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthCheck>
  )
}
