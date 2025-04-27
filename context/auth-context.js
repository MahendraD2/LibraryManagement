"use client";

import { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // This listens for when a user logs in or out
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // First check if the user is in the staff collection
          const staffDoc = await getDoc(doc(db, "staff", user.uid));

          if (staffDoc.exists()) {
            // User is a staff member
            const staffData = staffDoc.data();
            console.log("Staff user found:", staffData);
            setIsAdmin(true);
            setCurrentUser({
              ...user,
              ...staffData,
              isAdmin: true, // Ensure isAdmin is set for staff
              id: user.uid, // Ensure id is set for consistency
            });
          } else {
            // If not in staff collection, check regular users collection
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
              // Combine auth user with Firestore data
              const userData = userDoc.data();
              console.log("Regular user found:", userData);
              setIsAdmin(false);
              setCurrentUser({
                ...user,
                ...userData,
                isAdmin: false, // Ensure isAdmin is false for regular users
                id: user.uid, // Ensure id is set for consistency
                borrowedBooks: userData.borrowedBooks || [], // Ensure borrowedBooks is initialized
              });
            } else {
              // User exists in auth but not in Firestore
              console.log("User exists in auth but not in Firestore");
              // Check if this is the admin email
              const isAdminEmail = user.email === "admin@library.com";
              setIsAdmin(isAdminEmail);
              setCurrentUser({
                ...user,
                isAdmin: isAdminEmail,
                id: user.uid,
                borrowedBooks: [], // Initialize empty borrowedBooks array
              });
            }
          }
        } catch (error) {
          console.error("Error getting user data:", error);
          // Fallback: check if this is the admin email
          const isAdminEmail = user.email === "admin@library.com";
          setIsAdmin(isAdminEmail);
          setCurrentUser({
            ...user,
            isAdmin: isAdminEmail,
            id: user.uid,
            borrowedBooks: [], // Initialize empty borrowedBooks array
          });
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe; // Clean up the listener when component unmounts
  }, []);

  // Register a new user
  const register = async (
    name,
    email,
    password,
    isAdminUser = false,
    additionalData = {}
  ) => {
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Generate a library card number
      const libraryCardNumber =
        "LIB-" + Math.floor(10000 + Math.random() * 90000);

      // Get current date for registration
      const registeredDate = new Date().toISOString();

      // Create a user document in Firestore with additional data
      // Store in the appropriate collection based on isAdmin flag
      const collection = isAdminUser ? "staff" : "users";

      const userData = {
        name,
        email,
        isAdmin: isAdminUser,
        borrowedBooks: [],
        libraryCardNumber,
        registeredDate,
        branch: additionalData.branch || "branch-1",
        phone: additionalData.phone || "",
        address: additionalData.address || "",
      };

      await setDoc(doc(db, collection, user.uid), userData);

      console.log(`User created in ${collection} collection:`, userData);

      return user;
    } catch (error) {
      console.error("Error registering user:", error);
      throw new Error(error.message);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // First check if the user is in the staff collection
      const staffDoc = await getDoc(doc(db, "staff", user.uid));

      if (staffDoc.exists()) {
        const staffData = staffDoc.data();
        console.log("Staff login successful:", staffData);
        return { ...user, ...staffData, isAdmin: true, id: user.uid };
      }

      // If not in staff collection, check regular users collection
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User login successful:", userData);
        return {
          ...user,
          ...userData,
          isAdmin: false,
          id: user.uid,
          borrowedBooks: userData.borrowedBooks || [],
        };
      }

      // If user is not in either collection but email is admin@library.com
      if (email === "admin@library.com") {
        console.log("Admin email login without Firestore record");
        return {
          ...user,
          isAdmin: true,
          id: user.uid,
          borrowedBooks: [],
        };
      }

      console.log("Login successful but no Firestore record found");
      return {
        ...user,
        isAdmin: false,
        id: user.uid,
        borrowedBooks: [],
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message);
    }
  };

  // Logout user
  const logout = () => {
    return signOut(auth);
  };

  // Update user
  const updateUser = async (updatedUserData) => {
    if (!currentUser) {
      console.error("No current user to update");
      return;
    }

    try {
      // Determine which collection to update based on isAdmin flag
      const collection = isAdmin ? "staff" : "users";

      console.log(
        `Updating user in ${collection} collection:`,
        updatedUserData
      );
      console.log("Current user ID:", currentUser.uid);

      // Get the current document first
      const userDocRef = doc(db, collection, currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Update the document in Firestore
        await updateDoc(userDocRef, updatedUserData);

        // Update the local state
        const updatedUser = { ...currentUser, ...updatedUserData };
        setCurrentUser(updatedUser);

        console.log("User updated successfully:", updatedUser);
        return updatedUser;
      } else {
        // Document doesn't exist, create it
        console.log("User document doesn't exist, creating it");
        await setDoc(userDocRef, {
          ...updatedUserData,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email.split("@")[0],
          isAdmin: isAdmin,
          borrowedBooks: updatedUserData.borrowedBooks || [],
        });

        // Update the local state
        const updatedUser = {
          ...currentUser,
          ...updatedUserData,
          borrowedBooks: updatedUserData.borrowedBooks || [],
        };
        setCurrentUser(updatedUser);

        console.log("User created successfully:", updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error("Error updating user:", error);

      // Update local state anyway to maintain functionality
      const updatedUser = { ...currentUser, ...updatedUserData };
      setCurrentUser(updatedUser);

      console.log(
        "Updated local user state despite Firestore error:",
        updatedUser
      );
      return updatedUser;
    }
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    updateUser,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
