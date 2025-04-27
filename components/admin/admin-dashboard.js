"use client";

import { useState, useEffect } from "react";
import BookManagement from "@/components/admin/book-management";
import UserManagement from "@/components/admin/user-management";
import {
  Library,
  Users,
  RefreshCw,
  AlertTriangle,
  Database,
  ShieldCheck,
} from "lucide-react";
import { resetLibraryData } from "@/utils/reset-library";
import { migrateDataToFirebase } from "@/utils/migrate-to-firebase";
import { useAuth } from "@/context/auth-context";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("books");
  const [isResetting, setIsResetting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState("");
  const { currentUser, isAdmin } = useAuth();

  // Verify admin access
  useEffect(() => {
    console.log(
      "AdminDashboard mounted. Current user:",
      currentUser?.email,
      "isAdmin:",
      isAdmin
    );
  }, [currentUser, isAdmin]);

  const handleResetLibrary = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset the book catalog? This will fetch fresh data from the API."
      )
    ) {
      setIsResetting(true);
      try {
        await resetLibraryData();
        window.location.reload(); // Reload the page to show updated data
      } catch (error) {
        console.error("Error resetting library data:", error);
        alert(
          "There was an error resetting the library data. Please try again."
        );
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleMigrateToFirebase = async () => {
    if (
      window.confirm(
        "Are you sure you want to migrate all data to Firebase? This will create Firebase accounts for all users."
      )
    ) {
      setIsMigrating(true);
      setMigrationMessage(
        "Migration in progress... This may take a few minutes."
      );

      try {
        const success = await migrateDataToFirebase();
        if (success) {
          setMigrationMessage(
            "Migration completed successfully! You can now use Firebase for authentication and data storage."
          );
        } else {
          setMigrationMessage(
            "Migration failed. Please check the console for errors."
          );
        }
      } catch (error) {
        console.error("Error during migration:", error);
        setMigrationMessage("Migration failed: " + error.message);
      } finally {
        setIsMigrating(false);
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center">
          <ShieldCheck className="h-8 w-8 mr-3 text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button
            onClick={handleMigrateToFirebase}
            disabled={isMigrating}
            className="flex items-center px-4 py-2 text-sm bg-blue-500 text-white dark:bg-blue-600 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-md"
          >
            <Database
              className={`h-4 w-4 mr-2 ${isMigrating ? "animate-pulse" : ""}`}
            />
            {isMigrating ? "Migrating..." : "Migrate to Firebase"}
          </button>

          <button
            onClick={handleResetLibrary}
            disabled={isResetting}
            className="flex items-center px-4 py-2 text-sm bg-amber-500 text-white dark:bg-amber-600 rounded-md hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors shadow-md"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isResetting ? "animate-spin" : ""}`}
            />
            {isResetting ? "Refreshing..." : "Refresh Book Catalog"}
          </button>

          <div className="bg-card rounded-lg p-1 shadow-sm">
            <div className="flex space-x-1">
              <button
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  activeTab === "books"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("books")}
              >
                <Library className="h-4 w-4 mr-2" />
                Book Management
              </button>
              <button
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  activeTab === "users"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </button>
            </div>
          </div>
        </div>
      </div>

      {migrationMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Database className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">{migrationMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alert banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              If you're seeing issues with book covers, please click the
              "Refresh Book Catalog" button above to fetch fresh data from the
              Google Books API.
            </p>
          </div>
        </div>
      </div>

      <div className="slide-up">
        {activeTab === "books" ? <BookManagement /> : <UserManagement />}
      </div>
    </div>
  );
}
