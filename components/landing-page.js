"use client"

import { useState } from "react"
import { BookOpen, Users, Library, ChevronRight, User, ShieldCheck } from "lucide-react"

export default function LandingPage({ onSelectLoginType }) {
  const [isHoveringUser, setIsHoveringUser] = useState(false)
  const [isHoveringAdmin, setIsHoveringAdmin] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-6">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to LibraHub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your comprehensive library management system. Browse books, manage loans, and discover your next favorite
            read.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div
              className={`card p-8 text-center hover:shadow-xl transition-all duration-300 cursor-pointer ${
                isHoveringUser ? "transform -translate-y-2" : ""
              }`}
              onClick={() => onSelectLoginType("user")}
              onMouseEnter={() => setIsHoveringUser(true)}
              onMouseLeave={() => setIsHoveringUser(false)}
            >
              <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Member Login</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Access your account to borrow books, manage your loans, and discover new titles.
              </p>
              <button className="btn-primary w-full flex items-center justify-center">
                Login as Member <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div
              className={`card p-8 text-center hover:shadow-xl transition-all duration-300 cursor-pointer ${
                isHoveringAdmin ? "transform -translate-y-2" : ""
              }`}
              onClick={() => onSelectLoginType("admin")}
              onMouseEnter={() => setIsHoveringAdmin(true)}
              onMouseLeave={() => setIsHoveringAdmin(false)}
            >
              <div className="inline-flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
                <ShieldCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Staff Login</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Library staff can manage books, members, and oversee library operations.
              </p>
              <button className="btn-primary w-full flex items-center justify-center">
                Login as Staff <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="card p-6 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Extensive Collection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access thousands of books across multiple genres and categories.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Member Benefits</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Easy book reservations, renewals, and personalized recommendations.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <Library className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Branches</h3>
              <p className="text-gray-600 dark:text-gray-400">Visit any of our library branches across the city.</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2023 LibraHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
