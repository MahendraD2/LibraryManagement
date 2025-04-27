import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function createAdminUser() {
  try {
    // Check if the admin user already exists
    const adminEmail = "admin@library.com";
    const adminPassword = "admin123";

    // Check if the admin user already exists in Firestore
    const adminDoc = await getDoc(doc(db, "users", "admin@library.com"));
    if (adminDoc.exists()) {
      return { success: false, message: "Admin account already exists." };
    }

    // Create the admin user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    const user = userCredential.user;

    // Generate a staff ID
    const staffId = "STAFF-" + Math.floor(10000 + Math.random() * 90000);

    // Create a staff document in Firestore
    await setDoc(doc(db, "staff", user.uid), {
      id: user.uid,
      name: "Admin User",
      email: adminEmail,
      isAdmin: true,
      role: "System Administrator",
      staffId: staffId,
      registeredDate: new Date().toISOString(),
      branch: "branch-1",
    });

    return { success: true, message: "Admin account created successfully!" };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, message: error.message };
  }
}

export async function testFirestoreConnection() {
  try {
    // Attempt to read a document from Firestore
    const docRef = doc(db, "settings", "librarySettings");
    await getDoc(docRef);

    return {
      success: true,
      message: "Firestore connection successful!",
    };
  } catch (error) {
    console.error("Firestore connection test failed:", error);
    return {
      success: false,
      message: `Firestore connection test failed: ${error.message}`,
    };
  }
}
