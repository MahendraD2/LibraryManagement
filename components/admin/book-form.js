"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Save, Check } from "lucide-react";
import { searchBooks } from "@/services/book-api";

export default function BookForm({ book, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    publishedYear: "",
    publisher: "",
    pages: "",
    language: "English",
    copies: 1,
    coverImage: "/abstract-novel-cover.png",
    branch: "branch-1",
  });

  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load branches
    const storedBranches = JSON.parse(localStorage.getItem("branches") || "[]");
    setBranches(storedBranches);

    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        category: book.category || "",
        description: book.description || "",
        publishedYear: book.publishedYear || "",
        publisher: book.publisher || "",
        pages: book.pages || "",
        language: book.language || "English",
        copies: book.copies || 1,
        coverImage: book.coverImage || "/abstract-novel-cover.png",
        branch: book.branch || "branch-1",
        // Preserve Firestore ID if it exists
        firestoreId: book.firestoreId || null,
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(true);

    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = (selectedBook) => {
    setFormData({
      ...formData,
      title: selectedBook.title,
      author: selectedBook.author,
      isbn: selectedBook.isbn,
      category: selectedBook.category,
      description: selectedBook.description,
      publishedYear: selectedBook.publishedYear,
      publisher: selectedBook.publisher,
      pages: selectedBook.pages,
      language: selectedBook.language,
      coverImage: selectedBook.coverImage,
    });
    setShowResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Add source information to indicate this book was added by an admin
      const bookData = {
        ...book,
        ...formData,
        source: "admin",
      };

      await onSave(bookData);
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Failed to save book. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-card rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-border slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg mr-3 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold">
              {book ? "Edit Book" : "Add New Book"}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Book Search Section */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">
            Search for a book to auto-fill details
          </h4>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by title, author, or ISBN..."
              className="input flex-1"
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {showResults && (
            <div className="mt-4">
              {isSearching ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-sm text-gray-500">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-0"
                      onClick={() => handleSelectBook(result)}
                    >
                      <img
                        src={result.coverImage || "/placeholder.svg"}
                        alt={`Cover of ${result.title}`}
                        className="w-10 h-14 object-cover rounded mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate">
                          {result.title}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          by {result.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {result.publishedYear} • {result.pages} pages
                        </p>
                      </div>
                      <button
                        className="ml-2 p-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBook(result);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-sm text-gray-500">
                  No books found. Try a different search term.
                </p>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="author"
              >
                Author
              </label>
              <input
                id="author"
                name="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="isbn">
                ISBN
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                value={formData.isbn}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="category"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="">Select a category</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Thriller">Thriller</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="publisher"
              >
                Publisher
              </label>
              <input
                id="publisher"
                name="publisher"
                type="text"
                value={formData.publisher}
                onChange={handleChange}
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="publishedYear"
                >
                  Published Year
                </label>
                <input
                  id="publishedYear"
                  name="publishedYear"
                  type="text"
                  value={formData.publishedYear}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="pages"
                >
                  Pages
                </label>
                <input
                  id="pages"
                  name="pages"
                  type="number"
                  min="1"
                  value={formData.pages}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="language"
                >
                  Language
                </label>
                <input
                  id="language"
                  name="language"
                  type="text"
                  value={formData.language}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="copies"
                >
                  Number of Copies
                </label>
                <input
                  id="copies"
                  name="copies"
                  type="number"
                  min="1"
                  value={formData.copies}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="branch"
              >
                Library Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Book Cover
              </label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-center mb-4">
                  <img
                    src={formData.coverImage || "/placeholder.svg"}
                    alt="Book cover preview"
                    className="h-64 object-contain rounded"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    id="coverImage"
                    name="coverImage"
                    type="text"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="input w-full text-xs"
                    placeholder="Cover image URL"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Cover image URL will be automatically filled when you search
                    for a book
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input w-full"
                rows="8"
                required
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
