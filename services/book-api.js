// Service for fetching book data from Google Books API

/**
 * Search for books using the Google Books API
 * @param {string} query - Search query (title, author, ISBN)
 * @returns {Promise<Array>} - Array of book results
 */
export async function searchBooks(query) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=10`
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item) => {
      const volumeInfo = item.volumeInfo;

      // Get the thumbnail URL, ensuring it uses HTTPS
      let coverImage = null;
      if (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) {
        coverImage = volumeInfo.imageLinks.thumbnail.replace("http:", "https:");
      }

      // Log the cover image URL for debugging
      console.log(`Book: ${volumeInfo.title}, Cover: ${coverImage}`);

      return {
        id: item.id,
        title: volumeInfo.title || "Unknown Title",
        author: volumeInfo.authors
          ? volumeInfo.authors.join(", ")
          : "Unknown Author",
        isbn: volumeInfo.industryIdentifiers
          ? volumeInfo.industryIdentifiers.find((id) => id.type === "ISBN_13")
              ?.identifier ||
            volumeInfo.industryIdentifiers[0]?.identifier ||
            "Unknown ISBN"
          : "Unknown ISBN",
        description: volumeInfo.description || "No description available.",
        publishedYear: volumeInfo.publishedDate
          ? volumeInfo.publishedDate.substring(0, 4)
          : "Unknown",
        coverImage: coverImage,
        publisher: volumeInfo.publisher || "Unknown Publisher",
        pages: volumeInfo.pageCount || 0,
        language: volumeInfo.language || "en",
        category: volumeInfo.categories
          ? volumeInfo.categories[0]
          : "Uncategorized",
      };
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

/**
 * Get book details by ISBN
 * @param {string} isbn - ISBN of the book
 * @returns {Promise<Object|null>} - Book details or null if not found
 */
export async function getBookByISBN(isbn) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    const volumeInfo = item.volumeInfo;

    // Get the thumbnail URL, ensuring it uses HTTPS
    let coverImage = null;
    if (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) {
      coverImage = volumeInfo.imageLinks.thumbnail.replace("http:", "https:");
    }

    return {
      id: item.id,
      title: volumeInfo.title || "Unknown Title",
      author: volumeInfo.authors
        ? volumeInfo.authors.join(", ")
        : "Unknown Author",
      isbn: isbn,
      description: volumeInfo.description || "No description available.",
      publishedYear: volumeInfo.publishedDate
        ? volumeInfo.publishedDate.substring(0, 4)
        : "Unknown",
      coverImage: coverImage,
      publisher: volumeInfo.publisher || "Unknown Publisher",
      pages: volumeInfo.pageCount || 0,
      language: volumeInfo.language || "en",
      category: volumeInfo.categories
        ? volumeInfo.categories[0]
        : "Uncategorized",
    };
  } catch (error) {
    console.error("Error fetching book by ISBN:", error);
    return null;
  }
}
