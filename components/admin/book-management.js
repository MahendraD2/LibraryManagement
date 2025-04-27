"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Check, X, Star, AlertCircle } from "lucide-react"
import BookForm from "@/components/admin/book-form"
import { formatDate } from "@/utils/library-data"
import {
  addBookToFirestore,
  updateBookInFirestore,
  deleteBookFromFirestore,
  getBooksFromFirestore,
} from "@/services/firestore-service"

export default function BookManagement() {
  const [books, setBooks] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentBook, setCurrentBook] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("table") // table or grid
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load books from localStorage and Firestore
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First load from localStorage (for backward compatibility)
      const storedBooks = JSON.parse(localStorage.getItem("books") || "[]")

      // Then try to load from Firestore
      const firestoreBooks = await getBooksFromFirestore()

      // Combine books, preferring Firestore versions if there are duplicates
      const firestoreBookIds = firestoreBooks.map((book) => book.id)
      const filteredLocalBooks = storedBooks.filter((book) => !firestoreBookIds.includes(book.id))

      const combinedBooks = [...firestoreBooks, ...filteredLocalBooks]

      setBooks(combinedBooks)
      localStorage.setItem("books", JSON.stringify(combinedBooks))
      console.log(`Loaded ${combinedBooks.length} books (${firestoreBooks.length} from Firestore)`)
    } catch (err) {
      console.error("Error loading books:", err)
      setError("Failed to load books. Please try again.")

      // Fallback to localStorage only
      const storedBooks = JSON.parse(localStorage.getItem("books") || "[]")
      setBooks(storedBooks)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBook = async (book) => {
    try {
      let updatedBooks
      let savedBook

      if (book.id && book.firestoreId) {
        // Update existing Firestore book
        await updateBookInFirestore(book.firestoreId, book)
        savedBook = { ...book }
        updatedBooks = books.map((b) => (b.id === book.id ? savedBook : b))
      } else if (book.id) {
        // Existing local book, save to Firestore
        const firestoreId = await addBookToFirestore(book)
        savedBook = { ...book, firestoreId }
        updatedBooks = books.map((b) => (b.id === book.id ? savedBook : b))
      } else {
        // New book
        const newBook = {
          ...book,
          id: Date.now().toString(),
          available: true,
          borrowedBy: null,
          dueDate: null,
          availableCopies: book.copies || 1,
          copies: book.copies || 1,
          ratings: [],
          reviews: [],
        }

        // Save to Firestore
        const firestoreId = await addBookToFirestore(newBook)
        savedBook = { ...newBook, firestoreId }
        updatedBooks = [...books, savedBook]
      }

      setBooks(updatedBooks)
      localStorage.setItem("books", JSON.stringify(updatedBooks))
      setIsModalOpen(false)
      setCurrentBook(null)

      // Show success message
      alert(book.id ? "Book updated successfully!" : "Book added successfully!")
    } catch (err) {
      console.error("Error saving book:", err)
      alert("Failed to save book. Please try again.")
    }
  }

  const handleEditBook = (book) => {
    setCurrentBook(book)
    setIsModalOpen(true)
  }

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const bookToDelete = books.find((book) => book.id === id)

        // If the book has a firestoreId, delete it from Firestore
        if (bookToDelete && bookToDelete.firestoreId) {
          await deleteBookFromFirestore(bookToDelete.firestoreId)
        }

        const updatedBooks = books.filter((book) => book.id !== id)
        setBooks(updatedBooks)
        localStorage.setItem("books", JSON.stringify(updatedBooks))

        alert("Book deleted successfully!")
      } catch (err) {
        console.error("Error deleting book:", err)
        alert("Failed to delete book. Please try again.")
      }
    }
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm),
  )

  // Calculate average rating
  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0
    const sum = ratings.reduce((a, b) => a + b, 0)
    return (sum / ratings.length).toFixed(1)
  }

  // Function to get a fallback image if the cover image is not available
  const getBookCoverImage = (book) => {
    if (!book.coverImage || book.coverImage.includes("placeholder.svg")) {
      return `/placeholder.svg?height=400&width=300&query=${encodeURIComponent(book.title)} book cover`
    }
    return book.coverImage
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-semibold">Book Management</h2>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <div className="bg-card rounded-lg p-1 shadow-sm">
            <div className="flex space-x-1">
              <button
                className={`flex items-center px-3 py-1 rounded-md transition-all ${
                  viewMode === "table"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setViewMode("table")}
              >
                Table
              </button>
              <button
                className={`flex items-center px-3 py-1 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentBook(null)
              setIsModalOpen(true)
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Book
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search books by title, author or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {viewMode === "table" ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={getBookCoverImage(book) || "/placeholder.svg"}
                            alt={`Cover of ${book.title}`}
                            className="h-10 w-8 object-cover rounded mr-3"
                          />
                          <span>{book.title}</span>
                          {book.source === "admin" && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.isbn}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            book.availableCopies > 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {book.availableCopies > 0 ? (
                            <>
                              <Check className="h-3 w-3 mr-1" /> Available
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" /> Borrowed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {book.borrowedBy
                          ? (() => {
                              const users = JSON.parse(localStorage.getItem("users") || "[]")
                              const borrower = users.find((user) => user.id === book.borrowedBy)
                              return borrower ? (
                                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded text-xs">
                                  {borrower.name}
                                </span>
                              ) : (
                                "Unknown user"
                              )
                            })()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.dueDate ? formatDate(book.dueDate) : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-100 dark:bg-red-900/30 p-1 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div key={book.id} className="card overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={getBookCoverImage(book) || "/placeholder.svg"}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-md text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-md text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {book.source === "admin" && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Admin
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{book.author}</p>

                  <div className="flex items-center mt-2 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm">{getAverageRating(book.ratings)}</span>
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{book.category}</span>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        book.availableCopies > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {book.availableCopies} of {book.copies} available
                    </span>
                    {book.borrowedBy && <span className="text-xs text-gray-500">Due: {formatDate(book.dueDate)}</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 card p-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No books found</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <BookForm
          book={currentBook}
          onSave={handleSaveBook}
          onCancel={() => {
            setIsModalOpen(false)
            setCurrentBook(null)
          }}
        />
      )}
    </div>
  )
}
