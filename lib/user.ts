export type User = {
  id: string
  name: string
  email: string
  password?: string // Password is not always needed
  balance: number
  isAdmin: boolean
  createdAt: Date
}
