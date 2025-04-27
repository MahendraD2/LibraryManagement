"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Book, X, BookOpen } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { calculateDueDate } from "@/utils/library-data";
import BookDetails from "./book-details";
import {
  getBooksFromFirestore,
  updateBookInFirestore,
  addBorrowingRecordToFirestore,
} from "@/services/firestore-service";

export default function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, updateUser } = useAuth();

  useEffect(() => {
    // Load books from localStorage and Firestore
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      // First load from localStorage (for backward compatibility)
      const storedBooks = JSON.parse(localStorage.getItem("books") || "[]");

      // Then try to load from Firestore
      const firestoreBooks = await getBooksFromFirestore();

      // Combine books, preferring Firestore versions if there are duplicates
      const firestoreBookIds = firestoreBooks.map((book) => book.id);
      const filteredLocalBooks = storedBooks.filter(
        (book) => !firestoreBookIds.includes(book.id)
      );

      const combinedBooks = [...firestoreBooks, ...filteredLocalBooks];

      setBooks(combinedBooks);
      setFilteredBooks(combinedBooks);

      // Extract unique categories
      const uniqueCategories = [
        "All",
        ...new Set(combinedBooks.map((book) => book.category)),
      ];
      setCategories(uniqueCategories);

      // Update localStorage for backward compatibility
      localStorage.setItem("books", JSON.stringify(combinedBooks));
      console.log(
        `Loaded ${combinedBooks.length} books (${firestoreBooks.length} from Firestore)`
      );
    } catch (err) {
      console.error("Error loading books:", err);

      // Fallback to localStorage only
      const storedBooks = JSON.parse(localStorage.getItem("books") || "[]");
      setBooks(storedBooks);
      setFilteredBooks(storedBooks);

      // Extract unique categories
      const uniqueCategories = [
        "All",
        ...new Set(storedBooks.map((book) => book.category)),
      ];
      setCategories(uniqueCategories);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter books based on search term and category
    let result = books;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.description.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((book) => book.category === selectedCategory);
    }

    setFilteredBooks(result);
  }, [searchTerm, selectedCategory, books]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleCloseDetails = () => {
    setSelectedBook(null);
  };

  const handleBorrowBook = async (book, formData) => {
    try {
      // Calculate due date
      const dueDate = calculateDueDate();

      // Update book status
      const updatedBooks = books.map((b) => {
        if (b.id === book.id) {
          return {
            ...b,
            available: false,
            borrowedBy: currentUser.id,
            dueDate: dueDate,
            availableCopies: b.availableCopies - 1,
          };
        }
        return b;
      });

      // Update user's borrowed books
      const updatedUser = {
        ...currentUser,
        borrowedBooks: [...(currentUser.borrowedBooks || []), book.id],
      };

      console.log("Updating user with borrowed book:", updatedUser);

      // Create borrowing record
      const newRecord = {
        id: `record-${Date.now()}`,
        bookId: book.id,
        userId: currentUser.id,
        borrowDate: new Date().toISOString(),
        dueDate: dueDate,
        status: "borrowed",
        purpose: formData.purpose,
        notes: formData.notes,
      };

      // Save borrowing record to Firestore
      try {
        const firestoreRecordId = await addBorrowingRecordToFirestore(
          newRecord
        );
        newRecord.firestoreId = firestoreRecordId;
      } catch (error) {
        console.error("Error saving borrowing record to Firestore:", error);
        // Continue with localStorage only if Firestore fails
      }

      // Save changes to localStorage
      const borrowingRecords = JSON.parse(
        localStorage.getItem("borrowingRecords") || "[]"
      );
      localStorage.setItem(
        "borrowingRecords",
        JSON.stringify([...borrowingRecords, newRecord])
      );
      localStorage.setItem("books", JSON.stringify(updatedBooks));

      // If the book has a firestoreId, update it in Firestore
      const bookToUpdate = books.find((b) => b.id === book.id);
      if (bookToUpdate && bookToUpdate.firestoreId) {
        await updateBookInFirestore(bookToUpdate.firestoreId, {
          ...bookToUpdate,
          available: false,
          borrowedBy: currentUser.id,
          dueDate: dueDate,
          availableCopies: bookToUpdate.availableCopies - 1,
        });
      }

      // Update the user in Firebase
      await updateUser({
        borrowedBooks: updatedUser.borrowedBooks,
      });

      // Update local state
      setBooks(updatedBooks);
      setSelectedBook(null);

      // Show success message
      alert("Book borrowed successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user information. Please try again.");
    }
  };

  // Function to get a fallback image if the cover image is not available
  const getBookCoverImage = (book) => {
    if (!book.coverImage || book.coverImage.includes("placeholder.svg")) {
      return `/placeholder.svg?height=400&width=300&query=${encodeURIComponent(
        book.title
      )} book cover`;
    }
    return book.coverImage;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Book Catalog</h2>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input pl-9 w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm font-medium border-b border-border">
                    Categories
                  </div>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-accent hover:text-accent-foreground ${
                        selectedCategory === category
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCategory !== "All" && (
        <div className="mb-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Filtered by:
            </span>
            <span className="badge bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center gap-1">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory("All")}
                className="ml-1 hover:text-indigo-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        </div>
      )}

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleBookClick(book)}
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={getBookCoverImage(book) || "/placeholder.svg"}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                {book.availableCopies <= 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-full text-sm">
                      Not Available
                    </span>
                  </div>
                )}
                {book.source === "admin" && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Admin
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium line-clamp-1">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">
                  by {book.author}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {book.pages} pages
                  </span>
                  <span className="text-xs badge bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {book.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Book className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No books found matching your search criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {selectedBook && (
        <BookDetails
          book={selectedBook}
          onClose={handleCloseDetails}
          onBorrow={handleBorrowBook}
        />
      )}
    </div>
  );
}
