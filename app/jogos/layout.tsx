import type React from "react"

export default function GamesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="min-h-screen bg-gray-50 flex flex-col">{children}</div>
}
