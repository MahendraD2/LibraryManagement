"use client";

import { useState, useEffect } from "react";

export default function DebugBookData() {
  const [books, setBooks] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [imageStatuses, setImageStatuses] = useState({});

  useEffect(() => {
    const storedBooks = JSON.parse(localStorage.getItem("books") || "[]");
    setBooks(storedBooks);
  }, []);

  const checkImageUrl = async (url, bookId) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      setImageStatuses((prev) => ({
        ...prev,
        [bookId]: response.ok ? "Valid" : "Invalid",
      }));
    } catch (error) {
      setImageStatuses((prev) => ({
        ...prev,
        [bookId]: "Error: " + error.message,
      }));
    }
  };

  useEffect(() => {
    if (isVisible) {
      books.forEach((book) => {
        if (book.coverImage && !book.coverImage.includes("placeholder.svg")) {
          checkImageUrl(book.coverImage, book.id);
        }
      });
    }
  }, [isVisible, books]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-md z-50"
      >
        Debug Books
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg p-4 max-w-4xl mx-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Book Data Debug</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-200 p-2 rounded-md"
          >
            Close
          </button>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500">
          <h3 className="font-bold">Instructions:</h3>
          <p>
            1. Log in as admin and click "Refresh Book Catalog" to fetch fresh
            data
          </p>
          <p>
            2. Check the "Cover URL" field below to see if valid URLs are being
            stored
          </p>
          <p>3. The "Image Status" shows if the URL is valid and accessible</p>
        </div>

        <div className="mb-4">
          <p>Total Books: {books.length}</p>
        </div>

        <div className="space-y-4">
          {books.map((book) => (
            <div key={book.id} className="border p-4 rounded-lg">
              <h3 className="font-bold">{book.title}</h3>
              <p>
                Cover URL:{" "}
                <code className="bg-gray-100 p-1 text-sm break-all">
                  {book.coverImage || "No cover image"}
                </code>
              </p>
              <p>
                Image Status:{" "}
                <span
                  className={`font-medium ${
                    imageStatuses[book.id]?.includes("Error") ||
                    imageStatuses[book.id] === "Invalid"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {imageStatuses[book.id] || "Checking..."}
                </span>
              </p>
              <div className="mt-2">
                <p>Testing image load:</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={`Cover of ${book.title}`}
                    className="h-20 border"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/placeholder.svg?height=400&width=300&query=${encodeURIComponent(
                        book.title
                      )}`;
                    }}
                  />
                  <div>
                    <p className="text-sm text-gray-500">
                      If you see a placeholder image instead of a book cover,
                      the API URL is not working.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
