"use client";

import { useState } from "react";
import { AlertCircle, RefreshCw, Clock } from "lucide-react";
import { formatDate, calculateFine } from "@/utils/library-data";
import { updateBorrowingRecordInFirestore } from "@/services/firestore-service";

export default function BookReturnForm({
  book,
  onReturn,
  onCancel,
  currentUser,
}) {
  const [formData, setFormData] = useState({
    condition: "good",
    feedback: "",
    confirmReturn: false,
  });
  const [errors, setErrors] = useState({});

  const fine = calculateFine(book.dueDate);
  const isOverdue = new Date() > new Date(book.dueDate);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (!formData.confirmReturn) {
      newErrors.confirmReturn = "You must confirm the return";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Get borrowing records
    const borrowingRecords = JSON.parse(
      localStorage.getItem("borrowingRecords") || "[]"
    );

    // Find the active borrowing record for this book
    const recordIndex = borrowingRecords.findIndex(
      (record) => record.bookId === book.id && record.status === "borrowed"
    );

    if (recordIndex !== -1) {
      // Update the borrowing record
      const updatedRecord = {
        ...borrowingRecords[recordIndex],
        returnDate: new Date().toISOString(),
        status: "returned",
        condition: formData.condition,
        feedback: formData.feedback,
      };

      borrowingRecords[recordIndex] = updatedRecord;

      // Save to Firestore if there's a firestoreId
      if (updatedRecord.firestoreId) {
        try {
          await updateBorrowingRecordInFirestore(
            updatedRecord.firestoreId,
            updatedRecord
          );
        } catch (error) {
          console.error("Error updating borrowing record in Firestore:", error);
          // Continue with localStorage only if Firestore fails
        }
      }

      // Save to localStorage
      localStorage.setItem(
        "borrowingRecords",
        JSON.stringify(borrowingRecords)
      );
    }

    // Submit the form
    onReturn(book.id, formData);
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Return Book</h3>

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
              <Clock className="h-3 w-3 mr-1" />
              <span>Due: {formatDate(book.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {isOverdue && fine > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-red-700 dark:text-red-400">
                Overdue Notice
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                This book is overdue. A fine of ${fine} has been applied to your
                account.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Please pay the fine at the circulation desk or through your
                account.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="condition"
            >
              Book Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="excellent">Excellent - Like new</option>
              <option value="good">Good - Minor wear</option>
              <option value="fair">Fair - Visible wear but intact</option>
              <option value="poor">
                Poor - Damaged (please explain below)
              </option>
              <option value="damaged">
                Significantly Damaged (please explain below)
              </option>
            </select>
          </div>

          {(formData.condition === "poor" ||
            formData.condition === "damaged") && (
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="feedback"
              >
                Please describe the damage
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                className="input w-full"
                rows="2"
                placeholder="Please describe the damage to the book"
                required
              ></textarea>
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="feedback"
            >
              Feedback (optional)
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              className="input w-full"
              rows="3"
              placeholder="Share your thoughts about the book or your borrowing experience"
            ></textarea>
          </div>

          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="confirmReturn"
                name="confirmReturn"
                type="checkbox"
                checked={formData.confirmReturn}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="confirmReturn"
                className="font-medium text-gray-700 dark:text-gray-300"
              >
                I confirm that I am returning this book
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                I understand that I am responsible for any damages beyond normal
                wear.
              </p>
              {errors.confirmReturn && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.confirmReturn}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-md flex items-center text-sm shadow-sm hover:shadow transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Confirm Return
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
