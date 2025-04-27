"use client";

import { useState, useEffect } from "react";
import { RefreshCw, BookX, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { formatDate, calculateFine } from "@/utils/library-data";
import BookReturnForm from "./book-return-form";

export default function MyBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const { currentUser, updateUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log("Current user in MyBooks:", currentUser);
      console.log("Borrowed books IDs:", currentUser.borrowedBooks);
      loadBorrowedBooks();
    }
  }, [currentUser]);

  const loadBorrowedBooks = () => {
    if (!currentUser || !currentUser.borrowedBooks) {
      console.log("No borrowed books found in user data");
      setBorrowedBooks([]);
      return;
    }

    const allBooks = JSON.parse(localStorage.getItem("books") || "[]");

    // Get books that match the IDs in the user's borrowedBooks array
    const userBorrowedBooks = allBooks.filter((book) =>
      currentUser.borrowedBooks.includes(book.id)
    );

    console.log("User borrowed books from localStorage:", userBorrowedBooks);

    // Also check for books where borrowedBy matches the user's ID
    // This is for backward compatibility with the old system
    const booksBorrowedByUserId = allBooks.filter(
      (book) => book.borrowedBy === currentUser.id
    );

    console.log("Books borrowed by user ID:", booksBorrowedByUserId);

    // Combine both sets of books and remove duplicates
    const combinedBooks = [...userBorrowedBooks];

    booksBorrowedByUserId.forEach((book) => {
      if (!combinedBooks.some((b) => b.id === book.id)) {
        combinedBooks.push(book);
      }
    });

    console.log("Combined borrowed books:", combinedBooks);
    setBorrowedBooks(combinedBooks);
  };

  const handleReturnClick = (book) => {
    setSelectedBook(book);
    setShowReturnForm(true);
  };

  const handleReturnBook = async (bookId, formData) => {
    try {
      // Update book status
      const allBooks = JSON.parse(localStorage.getItem("books") || "[]");
      const updatedBooks = allBooks.map((book) => {
        if (book.id === bookId) {
          return {
            ...book,
            available: true,
            borrowedBy: null,
            dueDate: null,
            availableCopies: book.availableCopies + 1,
          };
        }
        return book;
      });

      // Update user's borrowed books
      const updatedBorrowedBooks = (currentUser.borrowedBooks || []).filter(
        (id) => id !== bookId
      );

      // Update the user object
      const updatedUser = {
        ...currentUser,
        borrowedBooks: updatedBorrowedBooks,
      };

      // Get borrowing records
      const borrowingRecords = JSON.parse(
        localStorage.getItem("borrowingRecords") || "[]"
      );

      // Update the borrowing record
      const updatedRecords = borrowingRecords.map((record) => {
        if (
          record.bookId === bookId &&
          record.userId === currentUser.id &&
          record.status === "borrowed"
        ) {
          return {
            ...record,
            returnDate: new Date().toISOString(),
            status: "returned",
            condition: formData.condition,
            feedback: formData.feedback,
          };
        }
        return record;
      });

      // Save changes to localStorage
      localStorage.setItem("books", JSON.stringify(updatedBooks));
      localStorage.setItem("borrowingRecords", JSON.stringify(updatedRecords));

      // Update user in Firebase
      await updateUser({
        borrowedBooks: updatedBorrowedBooks,
      });

      // Update state
      setShowReturnForm(false);
      setSelectedBook(null);
      loadBorrowedBooks();

      // Show success message
      alert("Book returned successfully!");
    } catch (error) {
      console.error("Error returning book:", error);
      alert("There was an error returning the book. Please try again.");
    }
  };

  // Check if a book is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Borrowed Books</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {borrowedBooks.length} {borrowedBooks.length === 1 ? "book" : "books"}{" "}
          borrowed
        </div>
      </div>

      {showReturnForm && selectedBook ? (
        <div className="card overflow-hidden">
          <BookReturnForm
            book={selectedBook}
            onReturn={handleReturnBook}
            onCancel={() => {
              setShowReturnForm(false);
              setSelectedBook(null);
            }}
            currentUser={currentUser}
          />
        </div>
      ) : borrowedBooks.length > 0 ? (
        <div className="space-y-6">
          {borrowedBooks.map((book) => {
            const fine = calculateFine(book.dueDate);
            const bookIsOverdue = isOverdue(book.dueDate);

            return (
              <div
                key={book.id}
                className="card overflow-hidden hover:translate-y-[-2px] transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 p-4">
                    <img
                      src={getBookCoverImage(book) || "/placeholder.svg"}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-48 object-cover object-center rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex-grow p-4">
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      by {book.author}
                    </p>

                    <div className="flex flex-wrap items-center mt-2 mb-3">
                      <span className="badge bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 mr-2">
                        {book.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {formatDate(book.dueDate)}
                      </span>
                    </div>

                    {bookIsOverdue && (
                      <div
                        className={`flex items-center ${
                          fine > 0 ? "text-red-500" : "text-amber-500"
                        } text-sm mb-3`}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fine > 0 ? (
                          <span>Overdue! Fine: ${fine}</span>
                        ) : (
                          <span>
                            Overdue! Please return as soon as possible.
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {book.description}
                    </p>

                    <button
                      onClick={() => handleReturnClick(book)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-md flex items-center text-sm shadow-sm hover:shadow transition-all"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Return Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <BookX className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            You haven't borrowed any books yet
          </p>
          <button
            onClick={() => (window.location.href = "#")}
            className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Browse the catalog
          </button>
        </div>
      )}
    </div>
  );
}
