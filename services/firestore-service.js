import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Collection names
const BOOKS_COLLECTION = "books";

/**
 * Add a new book to Firestore
 * @param {Object} bookData - The book data to add
 * @returns {Promise<string>} - The ID of the newly created book
 */
export async function addBookToFirestore(bookData) {
  try {
    const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
      ...bookData,
      createdAt: new Date().toISOString(),
      source: "admin", // Mark this book as added by admin
    });
    console.log("Book added to Firestore with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding book to Firestore:", error);
    throw error;
  }
}

/**
 * Get all books from Firestore
 * @returns {Promise<Array>} - Array of books
 */
export async function getBooksFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, BOOKS_COLLECTION));
    const books = [];
    querySnapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    console.log(`Retrieved ${books.length} books from Firestore`);
    return books;
  } catch (error) {
    console.error("Error getting books from Firestore:", error);
    return [];
  }
}

/**
 * Update a book in Firestore
 * @param {string} bookId - The ID of the book to update
 * @param {Object} bookData - The updated book data
 * @returns {Promise<void>}
 */
export async function updateBookInFirestore(bookId, bookData) {
  try {
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    await updateDoc(bookRef, {
      ...bookData,
      updatedAt: new Date().toISOString(),
    });
    console.log("Book updated in Firestore:", bookId);
  } catch (error) {
    console.error("Error updating book in Firestore:", error);
    throw error;
  }
}

/**
 * Delete a book from Firestore
 * @param {string} bookId - The ID of the book to delete
 * @returns {Promise<void>}
 */
export async function deleteBookFromFirestore(bookId) {
  try {
    await deleteDoc(doc(db, BOOKS_COLLECTION, bookId));
    console.log("Book deleted from Firestore:", bookId);
  } catch (error) {
    console.error("Error deleting book from Firestore:", error);
    throw error;
  }
}

/**
 * Get books borrowed by a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of books borrowed by the user
 */
export async function getUserBorrowedBooks(userId) {
  try {
    const q = query(
      collection(db, BOOKS_COLLECTION),
      where("borrowedBy", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const books = [];
    querySnapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    console.log(`Retrieved ${books.length} borrowed books for user ${userId}`);
    return books;
  } catch (error) {
    console.error("Error getting user borrowed books from Firestore:", error);
    return [];
  }
}

/**
 * Get borrowing records for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of borrowing records for the user
 */
export async function getUserBorrowingRecords(userId) {
  try {
    const q = query(
      collection(db, "borrowingRecords"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    console.log(
      `Retrieved ${records.length} borrowing records for user ${userId}`
    );
    return records;
  } catch (error) {
    console.error(
      "Error getting user borrowing records from Firestore:",
      error
    );
    return [];
  }
}

/**
 * Get active borrowing records for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of active borrowing records for the user
 */
export async function getUserActiveBorrowingRecords(userId) {
  try {
    const q = query(
      collection(db, "borrowingRecords"),
      where("userId", "==", userId),
      where("status", "==", "borrowed")
    );
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    console.log(
      `Retrieved ${records.length} active borrowing records for user ${userId}`
    );
    return records;
  } catch (error) {
    console.error(
      "Error getting user active borrowing records from Firestore:",
      error
    );
    return [];
  }
}

/**
 * Add a borrowing record to Firestore
 * @param {Object} recordData - The borrowing record data
 * @returns {Promise<string>} - The ID of the newly created record
 */
export async function addBorrowingRecordToFirestore(recordData) {
  try {
    const docRef = await addDoc(collection(db, "borrowingRecords"), {
      ...recordData,
      createdAt: new Date().toISOString(),
    });
    console.log("Borrowing record added to Firestore with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding borrowing record to Firestore:", error);
    throw error;
  }
}

/**
 * Update a borrowing record in Firestore
 * @param {string} recordId - The ID of the record to update
 * @param {Object} recordData - The updated record data
 * @returns {Promise<void>}
 */
export async function updateBorrowingRecordInFirestore(recordId, recordData) {
  try {
    const recordRef = doc(db, "borrowingRecords", recordId);
    await updateDoc(recordRef, {
      ...recordData,
      updatedAt: new Date().toISOString(),
    });
    console.log("Borrowing record updated in Firestore:", recordId);
  } catch (error) {
    console.error("Error updating borrowing record in Firestore:", error);
    throw error;
  }
}
