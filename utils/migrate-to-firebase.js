import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

export async function migrateDataToFirebase() {
  try {
    // Get data from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const books = JSON.parse(localStorage.getItem("books") || "[]");
    const branches = JSON.parse(localStorage.getItem("branches") || "[]");
    const borrowingRecords = JSON.parse(
      localStorage.getItem("borrowingRecords") || "[]"
    );
    const settings = JSON.parse(localStorage.getItem("settings") || "{}");

    // Migrate users
    for (const user of users) {
      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        const firebaseUser = userCredential.user;

        // Store user data in Firestore (without the password)
        const { password, ...userData } = user;
        await setDoc(doc(db, "users", firebaseUser.uid), userData);

        console.log(`Migrated user: ${user.email}`);
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error);
        // Continue with next user
      }
    }

    // Migrate books
    for (const book of books) {
      try {
        await addDoc(collection(db, "books"), book);
        console.log(`Migrated book: ${book.title}`);
      } catch (error) {
        console.error(`Error migrating book ${book.title}:`, error);
      }
    }

    // Migrate branches
    for (const branch of branches) {
      try {
        await setDoc(doc(db, "branches", branch.id), branch);
        console.log(`Migrated branch: ${branch.name}`);
      } catch (error) {
        console.error(`Error migrating branch ${branch.name}:`, error);
      }
    }

    // Migrate borrowing records
    for (const record of borrowingRecords) {
      try {
        await addDoc(collection(db, "borrowingRecords"), record);
        console.log(`Migrated borrowing record`);
      } catch (error) {
        console.error(`Error migrating borrowing record:`, error);
      }
    }

    // Migrate settings
    try {
      await setDoc(doc(db, "settings", "librarySettings"), settings);
      console.log(`Migrated settings`);
    } catch (error) {
      console.error(`Error migrating settings:`, error);
    }

    console.log("Migration completed successfully!");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
}
