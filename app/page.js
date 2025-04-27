"use client"

import { AuthProvider } from "@/context/auth-context"
import AppRouter from "@/components/app-router"

export default function Home() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
