"use client"

import { useState } from "react"
import Header from "./header"
import StatCard from "./stat-card"
import TaskList from "./task-list"
import UserProfile from "./user-profile"

export default function Dashboard() {
  const [theme, setTheme] = useState("light")

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className={`dashboard ${theme}`}>
      <Header title="React Dashboard" theme={theme} onToggleTheme={toggleTheme} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <StatCard title="Total Users" value="1,245" change="+12%" icon="users" />
        <StatCard title="Revenue" value="$34,590" change="+8%" icon="dollar-sign" />
        <StatCard title="Active Tasks" value="27" change="-3%" icon="check-square" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2">
          <TaskList />
        </div>
        <div>
          <UserProfile />
        </div>
      </div>
    </div>
  )
}
