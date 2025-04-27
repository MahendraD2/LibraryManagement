"use client";

import { useState } from "react";
import { X, Star, BookOpen, Users, Calendar } from "lucide-react";
import { formatDate } from "@/utils/library-data";
import BookBorrowForm from "./book-borrow-form";
import { useAuth } from "@/context/auth-context";

export default function BookDetails({ book, onClose, onBorrow }) {
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const { currentUser } = useAuth();

  // Calculate average rating
  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1);
  };

  // Render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 text-yellow-400 fill-yellow-400"
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="h-4 w-4 text-yellow-400 fill-yellow-400 opacity-50"
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const handleBorrowClick = () => {
    setShowBorrowForm(true);
  };

  const handleBorrowSubmit = (book, formData) => {
    onBorrow(book, formData);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-border slide-up">
        {!showBorrowForm ? (
          <div className="flex flex-col md:flex-row">
            {/* Book Cover */}
            <div className="md:w-1/3 p-6 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-600/10">
              <img
                src={getBookCoverImage(book) || "/placeholder.svg"}
                alt={`Cover of ${book.title}`}
                className="w-full max-w-[200px] object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Book Details */}
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                  {book.category}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                by {book.author}
              </p>

              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {renderStars(getAverageRating(book.ratings))}
                  <span className="ml-1 text-sm font-medium">
                    {getAverageRating(book.ratings)} (
                    {book.ratings ? book.ratings.length : 0} ratings)
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Published: {book.publishedYear}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 text-indigo-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {book.pages} pages
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-indigo-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {book.availableCopies} of {book.copies} available
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                ISBN: {book.isbn}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Publisher: {book.publisher}
              </p>

              <div className="border-t border-b border-border py-4 my-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {book.description}
                </p>
              </div>

              {book.reviews && book.reviews.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Reviews</h3>
                  <div className="space-y-3">
                    {book.reviews.map((review, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
                <button
                  onClick={handleBorrowClick}
                  className="btn-primary"
                  disabled={book.availableCopies <= 0}
                >
                  Borrow Book
                </button>
              </div>
            </div>
          </div>
        ) : (
          <BookBorrowForm
            book={book}
            onBorrow={handleBorrowSubmit}
            onCancel={() => setShowBorrowForm(false)}
          />
        )}
      </div>
    </div>
  );
}
