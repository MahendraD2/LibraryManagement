"use client"

import { Moon, Sun } from "lucide-react"

export default function Header({ title, theme, onToggleTheme }) {
  return (
    <header className="flex justify-between items-center py-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  )
}
