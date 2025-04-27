// Initialize sample data for the library
import { searchBooks } from "@/services/book-api";
import { getBooksFromFirestore } from "@/services/firestore-service";

export async function initializeLibrary() {
  // Check if data already exists
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const branches = JSON.parse(localStorage.getItem("branches") || "[]");

  // Only initialize if no data exists
  if (branches.length === 0) {
    // Create library branches
    const libraryBranches = [
      {
        id: "branch-1",
        name: "Main Library",
        address: "123 Library Street, Booktown, BT 12345",
        phone: "(555) 123-4567",
        email: "main@librahub.com",
        hours: "Mon-Fri: 9am-8pm, Sat: 10am-6pm, Sun: 12pm-5pm",
      },
      {
        id: "branch-2",
        name: "North Branch",
        address: "456 Reader Avenue, Booktown, BT 12346",
        phone: "(555) 987-6543",
        email: "north@librahub.com",
        hours: "Mon-Fri: 10am-7pm, Sat: 10am-5pm, Sun: Closed",
      },
      {
        id: "branch-3",
        name: "South Branch",
        address: "789 Book Boulevard, Booktown, BT 12347",
        phone: "(555) 456-7890",
        email: "south@librahub.com",
        hours: "Mon-Fri: 9am-7pm, Sat-Sun: 11am-4pm",
      },
    ];
    localStorage.setItem("branches", JSON.stringify(libraryBranches));
  }

  if (users.length === 0) {
    // Create admin user
    const adminUser = {
      id: "admin-1",
      name: "Admin User",
      email: "admin@library.com",
      password: "admin123",
      isAdmin: true,
      borrowedBooks: [],
      role: "System Administrator",
      libraryCardNumber: "ADMIN-001",
      registeredDate: "2023-01-15",
      branch: "branch-1",
    };

    // Create regular users
    const regularUser1 = {
      id: "user-1",
      name: "John Reader",
      email: "user@library.com",
      password: "user123",
      isAdmin: false,
      borrowedBooks: [],
      libraryCardNumber: "LIB-10042",
      registeredDate: "2023-03-22",
      branch: "branch-1",
      phone: "(555) 234-5678",
      address: "101 Reader Lane, Booktown, BT 12345",
    };

    const regularUser2 = {
      id: "user-2",
      name: "Sarah Bookworm",
      email: "sarah@example.com",
      password: "sarah123",
      isAdmin: false,
      borrowedBooks: [],
      libraryCardNumber: "LIB-10043",
      registeredDate: "2023-04-15",
      branch: "branch-2",
      phone: "(555) 345-6789",
      address: "202 Novel Street, Booktown, BT 12345",
    };

    localStorage.setItem(
      "users",
      JSON.stringify([adminUser, regularUser1, regularUser2])
    );
  }

  // Load books from Firestore first
  let allBooks = [];
  try {
    const firestoreBooks = await getBooksFromFirestore();
    console.log("Loaded books from Firestore:", firestoreBooks.length);
    allBooks = firestoreBooks;
  } catch (error) {
    console.error("Error loading books from Firestore:", error);
  }

  // If we don't have enough books from Firestore, fetch some from Google Books API
  if (allBooks.length < 5) {
    try {
      // Define popular books to fetch
      const bookTitles = [
        "To Kill a Mockingbird",
        "1984",
        "The Great Gatsby",
        "Pride and Prejudice",
        "The Hobbit",
        "Sapiens: A Brief History of Humankind",
        "The Alchemist",
        "Atomic Habits",
        "Educated",
        "The Silent Patient",
        "Dune",
        "The Midnight Library",
      ];

      // Create an array to store all book fetch promises
      const bookPromises = bookTitles.map((title) => searchBooks(title));

      // Wait for all book data to be fetched
      const bookResults = await Promise.all(bookPromises);

      // Process the results and create book objects
      const sampleBooks = bookResults.map((results, index) => {
        // Take the first result for each book title
        const bookData = results[0] || {};

        // Generate a unique placeholder if no cover image is available
        const fallbackCover = `/placeholder.svg?height=400&width=300&query=${encodeURIComponent(
          bookTitles[index]
        )} book cover`;

        // Log the cover image for debugging
        console.log(`Processing book: ${bookTitles[index]}`);
        console.log(`API cover image: ${bookData.coverImage}`);
        console.log(`Using cover: ${bookData.coverImage || fallbackCover}`);

        return {
          id: `book-${index + 1}`,
          title: bookData.title || bookTitles[index],
          author: bookData.author || "Unknown Author",
          isbn: bookData.isbn || `978000000000${index}`,
          category: bookData.category || "Fiction",
          description: bookData.description || "No description available.",
          publishedYear: bookData.publishedYear || "2000",
          available: true,
          borrowedBy: null,
          dueDate: null,
          coverImage: bookData.coverImage || fallbackCover,
          publisher: bookData.publisher || "Unknown Publisher",
          pages: bookData.pages || 300,
          language: bookData.language || "English",
          copies: 5,
          availableCopies: 5,
          branch: `branch-${(index % 3) + 1}`,
          ratings: [4, 5, 5, 4, 5].slice(0, (index % 5) + 1),
          reviews:
            index % 3 === 0
              ? [
                  {
                    userId: "user-2",
                    text: "A great read, highly recommended!",
                    rating: 5,
                    date: "2023-05-15",
                  },
                ]
              : [],
          source: "google_books", // Mark this book as from Google Books API
        };
      });

      // Combine with Firestore books
      allBooks = [...allBooks, ...sampleBooks];
    } catch (error) {
      console.error("Error fetching book data:", error);

      // Fallback to basic book data if API fails
      const fallbackBooks = [
        {
          id: "book-1",
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780061120084",
          category: "Fiction",
          description:
            "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
          publishedYear: "1960",
          available: true,
          borrowedBy: null,
          dueDate: null,
          coverImage: "/mockingbird-silhouette.png",
          publisher: "HarperCollins",
          pages: 336,
          language: "English",
          copies: 5,
          availableCopies: 5,
          branch: "branch-1",
          ratings: [4, 5, 5, 4, 5],
          reviews: [
            {
              userId: "user-2",
              text: "A timeless classic that everyone should read.",
              rating: 5,
              date: "2023-05-15",
            },
          ],
          source: "fallback",
        },
        // Add more fallback books as needed
      ];

      // Combine with any Firestore books we might have
      allBooks = [...allBooks, ...fallbackBooks];
    }
  }

  // Save all books to localStorage
  localStorage.setItem("books", JSON.stringify(allBooks));
  console.log(`Saved ${allBooks.length} books to localStorage`);

  // Initialize settings if they don't exist
  if (!localStorage.getItem("settings")) {
    const settings = {
      loanDuration: 14, // days
      maxBooksPerUser: 5,
      finePerDay: 0.5, // $0.50 per day overdue
      reservationDuration: 3, // days
    };
    localStorage.setItem("settings", JSON.stringify(settings));
  }

  // Initialize reservations if they don't exist
  if (!localStorage.getItem("reservations")) {
    localStorage.setItem("reservations", JSON.stringify([]));
  }

  // Initialize borrowing records if they don't exist
  if (!localStorage.getItem("borrowingRecords")) {
    localStorage.setItem("borrowingRecords", JSON.stringify([]));
  }
}

// Function to calculate due date
export function calculateDueDate() {
  const settings = JSON.parse(
    localStorage.getItem("settings") || '{"loanDuration": 14}'
  );
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + settings.loanDuration);
  return dueDate.toISOString();
}

// Function to calculate overdue fines
export function calculateFine(dueDate) {
  if (!dueDate) return 0;

  const settings = JSON.parse(
    localStorage.getItem("settings") || '{"finePerDay": 0.50}'
  );
  const today = new Date();
  const due = new Date(dueDate);

  if (today <= due) return 0;

  const diffTime = Math.abs(today - due);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (diffDays * settings.finePerDay).toFixed(2);
}

// Function to format date for display
export function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
