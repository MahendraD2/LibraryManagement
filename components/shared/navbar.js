"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { BookOpen, User, LogOut, Menu, X, Moon, Sun } from "lucide-react"

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    // Check if user has a theme preference
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <span className="font-bold text-xl">Libra</span>
              <span className="font-light">Hub</span>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="flex items-center bg-white/10 px-3 py-2 rounded-lg">
              <User className="h-5 w-5 mr-2" />
              <span>
                {currentUser.name}{" "}
                <span className="text-xs px-2 py-0.5 ml-1 bg-white/20 rounded-full">{isAdmin ? "Admin" : "User"}</span>
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 slide-up">
            <div className="flex items-center py-2 px-3 rounded-lg bg-white/10 mb-2">
              <User className="h-5 w-5 mr-2" />
              <span>
                {currentUser.name}{" "}
                <span className="text-xs px-2 py-0.5 ml-1 bg-white/20 rounded-full">{isAdmin ? "Admin" : "User"}</span>
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
