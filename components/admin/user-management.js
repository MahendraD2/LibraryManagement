"use client";

import { useState, useEffect } from "react";
import {
  Search,
  UserX,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/utils/library-data";
import StaffRegistration from "./staff-registration";
import {
  getUserBorrowingRecords,
  getUserActiveBorrowingRecords,
} from "@/services/firestore-service";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteUserFromFirebase } from "@/services/auth-service";
import { useAuth } from "@/context/auth-context";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showStaffRegistration, setShowStaffRegistration] = useState(false);
  const [borrowingRecords, setBorrowingRecords] = useState({});
  const [isLoadingRecords, setIsLoadingRecords] = useState({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load users from both localStorage and Firestore
    loadUsers();

    // Load branches
    const storedBranches = JSON.parse(localStorage.getItem("branches") || "[]");
    setBranches(storedBranches);

    // Load borrowing records from localStorage
    const storedRecords = JSON.parse(
      localStorage.getItem("borrowingRecords") || "[]"
    );

    // Group records by user ID
    const recordsByUser = storedRecords.reduce((acc, record) => {
      if (!acc[record.userId]) {
        acc[record.userId] = [];
      }
      acc[record.userId].push(record);
      return acc;
    }, {});

    setBorrowingRecords(recordsByUser);
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);

    try {
      // First load from localStorage for backward compatibility
      const localUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Then try to load from Firestore
      let firestoreUsers = [];

      try {
        // Get regular users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const regularUsers = [];
        usersSnapshot.forEach((doc) => {
          regularUsers.push({
            id: doc.id,
            ...doc.data(),
            isAdmin: false, // Ensure regular users have isAdmin set to false
          });
        });

        // Get staff/admin users
        const staffSnapshot = await getDocs(collection(db, "staff"));
        const staffUsers = [];
        staffSnapshot.forEach((doc) => {
          staffUsers.push({
            id: doc.id,
            ...doc.data(),
            isAdmin: true, // Ensure staff users have isAdmin set to true
          });
        });

        firestoreUsers = [...regularUsers, ...staffUsers];
        console.log(
          `Loaded ${firestoreUsers.length} users from Firestore (${regularUsers.length} regular, ${staffUsers.length} staff)`
        );
      } catch (error) {
        console.error("Error loading users from Firestore:", error);
        // Continue with localStorage only
      }

      // Combine users, preferring Firestore versions if there are duplicates
      // Use email as the key for comparison since IDs might be different
      const emailMap = new Map();

      // First add Firestore users to the map
      firestoreUsers.forEach((user) => {
        if (user.email) {
          emailMap.set(user.email.toLowerCase(), user);
        }
      });

      // Then add localStorage users if they don't exist in Firestore
      localUsers.forEach((user) => {
        if (user.email && !emailMap.has(user.email.toLowerCase())) {
          emailMap.set(user.email.toLowerCase(), user);
        }
      });

      // Convert map back to array
      const combinedUsers = Array.from(emailMap.values());

      setUsers(combinedUsers);
      console.log(`Total users after combining: ${combinedUsers.length}`);

      // Update localStorage for backward compatibility
      localStorage.setItem("users", JSON.stringify(combinedUsers));
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again.");

      // Fallback to localStorage only
      const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
      setUsers(localUsers);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const getCurrentlyBorrowedBooks = (userId) => {
    // First check books with borrowedBy field
    const allBooks = JSON.parse(localStorage.getItem("books") || "[]");
    const booksBorrowedByField = allBooks.filter(
      (book) => book.borrowedBy === userId
    );

    // Then check borrowing records for active loans
    const borrowingRecords = JSON.parse(
      localStorage.getItem("borrowingRecords") || "[]"
    );
    const activeRecords = borrowingRecords.filter(
      (record) => record.userId === userId && record.status === "borrowed"
    );

    // Get book details for each active record
    const booksBorrowedByRecords = activeRecords.map((record) => {
      const book = allBooks.find((b) => b.id === record.bookId) || {
        id: record.bookId,
        title: "Unknown Book",
        author: "Unknown Author",
        dueDate: record.dueDate,
      };
      return book;
    });

    // Combine both lists, removing duplicates
    const combinedBooks = [...booksBorrowedByField];
    booksBorrowedByRecords.forEach((book) => {
      if (!combinedBooks.some((b) => b.id === book.id)) {
        combinedBooks.push(book);
      }
    });

    return combinedBooks;
  };

  const loadBorrowingHistory = async (userId) => {
    if (borrowingRecords[userId] && borrowingRecords[userId].length > 0) {
      // Already loaded
      return;
    }

    setIsLoadingRecords((prev) => ({ ...prev, [userId]: true }));

    try {
      // First get records from localStorage
      const storedRecords = JSON.parse(
        localStorage.getItem("borrowingRecords") || "[]"
      );
      const userRecords = storedRecords.filter(
        (record) => record.userId === userId
      );

      // Then try to get records from Firestore
      let firestoreRecords = [];
      try {
        firestoreRecords = await getUserBorrowingRecords(userId);

        // Also get active borrowing records
        const activeRecords = await getUserActiveBorrowingRecords(userId);

        // Add active records to the user's borrowedBooks array if they exist
        if (activeRecords.length > 0) {
          const userIndex = users.findIndex((u) => u.id === userId);
          if (userIndex !== -1) {
            const updatedUser = { ...users[userIndex] };
            updatedUser.borrowedBooks = updatedUser.borrowedBooks || [];

            // Add book IDs from active records if they're not already in the array
            activeRecords.forEach((record) => {
              if (!updatedUser.borrowedBooks.includes(record.bookId)) {
                updatedUser.borrowedBooks.push(record.bookId);
              }
            });

            // Update the users array
            const updatedUsers = [...users];
            updatedUsers[userIndex] = updatedUser;
            setUsers(updatedUsers);
          }
        }
      } catch (error) {
        console.error("Error fetching Firestore records:", error);
      }

      // Combine records, avoiding duplicates
      const allRecords = [...userRecords];
      firestoreRecords.forEach((record) => {
        if (!allRecords.some((r) => r.id === record.id)) {
          allRecords.push(record);
        }
      });

      // Sort records by borrow date (newest first)
      allRecords.sort(
        (a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)
      );

      setBorrowingRecords((prev) => ({
        ...prev,
        [userId]: allRecords,
      }));
    } catch (error) {
      console.error("Error loading borrowing history:", error);
    } finally {
      setIsLoadingRecords((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserExpand = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      loadBorrowingHistory(userId);
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name : "Unknown Branch";
  };

  const getBookDetails = (bookId) => {
    const allBooks = JSON.parse(localStorage.getItem("books") || "[]");
    return (
      allBooks.find((book) => book.id === bookId) || {
        title: "Unknown Book",
        author: "Unknown Author",
      }
    );
  };

  const BorrowedBooksDetails = ({ userId }) => {
    const currentlyBorrowed = getCurrentlyBorrowedBooks(userId);

    // Also check borrowing records directly
    const borrowingRecords = JSON.parse(
      localStorage.getItem("borrowingRecords") || "[]"
    );
    const activeRecords = borrowingRecords.filter(
      (record) => record.userId === userId && record.status === "borrowed"
    );

    if (currentlyBorrowed.length === 0 && activeRecords.length === 0) {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          No books currently borrowed
        </span>
      );
    }

    // If we have active records but no books, show the records
    if (currentlyBorrowed.length === 0 && activeRecords.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {activeRecords.map((record) => {
            const book = getBookDetails(record.bookId);
            return (
              <div
                key={record.id}
                className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg"
              >
                <img
                  src={book.coverImage || "/placeholder.svg"}
                  alt={`Cover of ${book.title}`}
                  className="h-12 w-8 object-cover rounded mr-3"
                />
                <div className="flex-grow">
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    by {book.author}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Due: {formatDate(record.dueDate)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="mt-3 space-y-2">
        {currentlyBorrowed.map((book) => (
          <div
            key={book.id}
            className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg"
          >
            <img
              src={book.coverImage || "/placeholder.svg"}
              alt={`Cover of ${book.title}`}
              className="h-12 w-8 object-cover rounded mr-3"
            />
            <div className="flex-grow">
              <p className="font-medium text-sm">{book.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                by {book.author}
              </p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Due: {formatDate(book.dueDate)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const BorrowingHistoryDetails = ({ userId }) => {
    const userRecords = borrowingRecords[userId] || [];

    if (isLoadingRecords[userId]) {
      return (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-sm text-gray-500">
            Loading borrowing history...
          </span>
        </div>
      );
    }

    if (userRecords.length === 0) {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          No borrowing history found
        </span>
      );
    }

    return (
      <div className="mt-3 space-y-3">
        {userRecords.map((record) => {
          const book = getBookDetails(record.bookId);
          const isReturned = record.status === "returned";

          return (
            <div
              key={record.id}
              className={`flex items-center p-3 rounded-lg ${
                isReturned
                  ? "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20"
                  : "bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20"
              }`}
            >
              <div className="flex-grow">
                <div className="flex items-center">
                  <p className="font-medium text-sm">{book.title}</p>
                  {isReturned ? (
                    <span className="ml-2 flex items-center text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" /> Returned
                    </span>
                  ) : (
                    <span className="ml-2 flex items-center text-xs text-amber-600 dark:text-amber-400">
                      <Clock className="h-3 w-3 mr-1" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  by {book.author}
                </p>

                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" /> Borrowed:{" "}
                    {formatDate(record.borrowDate)}
                  </span>
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" /> Due:{" "}
                    {formatDate(record.dueDate)}
                  </span>
                  {isReturned && record.returnDate && (
                    <span className="flex items-center text-gray-500 dark:text-gray-400">
                      <RefreshCw className="h-3 w-3 mr-1" /> Returned:{" "}
                      {formatDate(record.returnDate)}
                    </span>
                  )}
                </div>

                {record.notes && (
                  <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">
                    Note: {record.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDeleteUser = async (id) => {
    const user = users.find((u) => u.id === id);
    if (user && user.borrowedBooks && user.borrowedBooks.length > 0) {
      alert(
        "This user has borrowed books. They must return all books before they can be deleted."
      );
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this user? This will remove them from the database and authentication system."
      )
    ) {
      setIsDeleting(true);
      try {
        // Use the auth service to delete the user from both Firestore and Auth
        const result = await deleteUserFromFirebase(user, {
          currentAdmin: currentUser,
        });

        if (result.success) {
          // Update local state and localStorage
          const updatedUsers = users.filter((u) => u.id !== id);
          setUsers(updatedUsers);
          localStorage.setItem("users", JSON.stringify(updatedUsers));

          // Show appropriate message based on what was deleted
          if (result.authDeleted) {
            alert(
              "User successfully deleted from both database and authentication system."
            );
          } else {
            alert(
              result.message ||
                "User deleted from database. Note: The user may still exist in Firebase Authentication."
            );
          }
        } else {
          alert(result.message || "Failed to delete user. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(`Error deleting user: ${error.message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.libraryCardNumber &&
        user.libraryCardNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={loadUsers}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-colors"
            disabled={isDeleting}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Users
          </button>
          <button
            onClick={() => setShowStaffRegistration(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md shadow-sm hover:from-purple-600 hover:to-indigo-700 transition-colors"
            disabled={isDeleting}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Register Staff
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
          placeholder="Search users by name, email or library card..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {isLoadingUsers || isDeleting ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
            {isDeleting ? "Deleting user..." : "Loading users..."}
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const currentlyBorrowed = getCurrentlyBorrowedBooks(user.id);
              const isExpanded = expandedUser === user.id;

              return (
                <div key={user.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-full mr-3 ${
                          user.isAdmin
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {user.name || "Unnamed User"}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex flex-wrap items-center mt-1 gap-2">
                          <span
                            className={`badge text-xs ${
                              user.isAdmin
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {user.isAdmin ? user.role || "Admin" : "Member"}
                          </span>
                          {user.libraryCardNumber && (
                            <span className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                              <CreditCard className="h-3 w-3 mr-1" />
                              {user.libraryCardNumber}
                            </span>
                          )}
                          <span className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {(() => {
                              // Get books borrowed by borrowedBy field
                              const currentlyBorrowed =
                                getCurrentlyBorrowedBooks(user.id);

                              // Also check borrowing records
                              const borrowingRecords = JSON.parse(
                                localStorage.getItem("borrowingRecords") || "[]"
                              );
                              const activeRecords = borrowingRecords.filter(
                                (record) =>
                                  record.userId === user.id &&
                                  record.status === "borrowed"
                              );

                              // Use the larger count
                              const count = Math.max(
                                currentlyBorrowed.length,
                                activeRecords.length
                              );
                              return `${count} ${
                                count === 1 ? "book" : "books"
                              } borrowed`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {!user.isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-100 dark:bg-red-900/30 p-1 rounded mr-2"
                          title="Delete user"
                          disabled={isDeleting}
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleUserExpand(user.id)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 p-1 rounded"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {user.registeredDate && (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Registered:
                              </span>{" "}
                              <span className="font-medium">
                                {formatDate(user.registeredDate)}
                              </span>
                            </div>
                          </div>
                        )}
                        {user.branch && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Branch:
                              </span>{" "}
                              <span className="font-medium">
                                {getBranchName(user.branch)}
                              </span>
                            </div>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 text-gray-500 mr-2" />
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Phone:
                              </span>{" "}
                              <span className="font-medium">{user.phone}</span>
                            </div>
                          </div>
                        )}
                        {user.address && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Address:
                              </span>{" "}
                              <span className="font-medium">
                                {user.address}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <BookOpen className="h-4 w-4 mr-1 text-indigo-500" />
                            Currently Borrowed Books:
                          </h4>
                          <BorrowedBooksDetails userId={user.id} />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                            Borrowing History:
                          </h4>
                          <BorrowingHistoryDetails userId={user.id} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card p-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          )}
        </div>
      )}

      {showStaffRegistration && (
        <StaffRegistration onClose={() => setShowStaffRegistration(false)} />
      )}
    </div>
  );
}
