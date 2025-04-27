"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { BookOpen, Mail, Lock, LogIn, UserPlus, ArrowLeft } from "lucide-react"

export default function Login({ onSwitchView, onBackToLanding }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const user = await login(email, password)

      // Check if user is admin and reject if trying to login through member portal
      if (user.isAdmin) {
        setError("Admin accounts should use the staff login portal.")
        setIsLoading(false)
        return
      }

      // Login successful - the auth context will handle updating the state
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-lg border border-border fade-in">
        <div className="flex items-center mb-6">
          <button onClick={onBackToLanding} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold">Member Login</h2>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold">Welcome to LibraHub</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your member account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10 w-full"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 w-full"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full btn-primary flex items-center justify-center" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-gray-500">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchView}
            className="w-full btn-secondary flex items-center justify-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create an account
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Demo Accounts:</p>
          <div className="space-y-2">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg text-xs">
              <p className="font-semibold">Member:</p>
              <p className="text-gray-600 dark:text-gray-400">user@library.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
