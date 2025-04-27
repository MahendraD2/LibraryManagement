import { initializeLibrary } from "./library-data";

export async function resetLibraryData() {
  // Clear all book data
  localStorage.removeItem("books");

  console.log("Books data cleared, reinitializing...");

  // Reinitialize with fresh data
  await initializeLibrary();

  console.log("Library data reinitialized");

  // Force page reload to reflect changes
  window.location.reload();
}
