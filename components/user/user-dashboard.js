"use client"

import { useState } from "react"
import BookCatalog from "@/components/user/book-catalog"
import MyBooks from "@/components/user/my-books"
import { Library, BookOpen } from "lucide-react"

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("catalog")

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          User Dashboard
        </h1>

        <div className="mt-4 md:mt-0 bg-card rounded-lg p-1 shadow-sm">
          <div className="flex space-x-1">
            <button
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                activeTab === "catalog"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab("catalog")}
            >
              <Library className="h-4 w-4 mr-2" />
              Book Catalog
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                activeTab === "mybooks"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab("mybooks")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              My Books
            </button>
          </div>
        </div>
      </div>

      <div className="slide-up">{activeTab === "catalog" ? <BookCatalog /> : <MyBooks />}</div>
    </div>
  )
}
