"use client";

import { useState } from "react";
import { Clock, AlertCircle, BookOpen, CheckCircle } from "lucide-react";
import { formatDate } from "@/utils/library-data";

export default function BookBorrowForm({ book, onBorrow, onCancel }) {
  const [formData, setFormData] = useState({
    purpose: "personal",
    agreement: false,
    notes: "",
  });
  const [errors, setErrors] = useState({});

  // Calculate due date (14 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const formattedDueDate = formatDate(dueDate.toISOString());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (!formData.agreement) {
      newErrors.agreement = "You must agree to the terms and conditions";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onBorrow(book, formData);
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Borrow Request</h3>

      <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            <img
              src={
                book.coverImage ||
                "/placeholder.svg?height=400&width=300&query=Book cover"
              }
              alt={`Cover of ${book.title}`}
              className="w-16 h-24 object-cover rounded"
            />
          </div>
          <div>
            <h4 className="font-medium">{book.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {book.author}
            </p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <BookOpen className="h-3 w-3 mr-1" />
              <span>{book.pages} pages</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="purpose">
              Purpose of borrowing
            </label>
            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="personal">Personal Reading</option>
              <option value="academic">Academic Research</option>
              <option value="professional">Professional Development</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.purpose === "other" && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="notes">
                Please specify
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input w-full"
                rows="2"
                placeholder="Please specify your purpose for borrowing this book"
              ></textarea>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Loan Period Information</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This book is due to be returned by{" "}
                  <span className="font-semibold">{formattedDueDate}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Late returns will incur a fine of $0.50 per day.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="agreement"
                name="agreement"
                type="checkbox"
                checked={formData.agreement}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="agreement"
                className="font-medium text-gray-700 dark:text-gray-300"
              >
                I agree to the terms and conditions
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                I will return the book in good condition by the due date.
              </p>
              {errors.agreement && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.agreement}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Borrowing
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
