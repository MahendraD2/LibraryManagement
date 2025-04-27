"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import Login from "@/components/auth/login";
import AdminLogin from "@/components/auth/admin-login";
import Register from "@/components/auth/register";
import AdminDashboard from "@/components/admin/admin-dashboard";
import UserDashboard from "@/components/user/user-dashboard";
import Navbar from "@/components/shared/navbar";
import LandingPage from "@/components/landing-page";
import { initializeLibrary } from "@/utils/library-data";

export default function AppRouter() {
  const { currentUser, isAdmin } = useAuth();
  const [view, setView] = useState("landing");
  const [loginType, setLoginType] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize sample data if not exists
    const initialize = async () => {
      setIsInitializing(true);
      try {
        await initializeLibrary();
      } catch (error) {
        console.error("Error initializing library:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();

    // Check for theme preference
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const handleSelectLoginType = (type) => {
    setLoginType(type);
    setView(type === "admin" ? "adminLogin" : "userLogin");
  };

  // Determine which component to render
  const renderView = () => {
    if (isInitializing) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading library...
            </p>
          </div>
        </div>
      );
    }

    if (currentUser) {
      // Force check if the email is admin@library.com to ensure admin access
      const forceAdmin = currentUser.email === "admin@library.com" || isAdmin;

      console.log(
        "Rendering dashboard. isAdmin:",
        isAdmin,
        "forceAdmin:",
        forceAdmin
      );

      return forceAdmin ? <AdminDashboard /> : <UserDashboard />;
    }

    switch (view) {
      case "landing":
        return <LandingPage onSelectLoginType={handleSelectLoginType} />;
      case "userLogin":
        return (
          <Login
            onSwitchView={() => setView("register")}
            onBackToLanding={() => setView("landing")}
          />
        );
      case "adminLogin":
        return <AdminLogin onBackToLanding={() => setView("landing")} />;
      case "register":
        return (
          <Register
            onSwitchView={() => setView("userLogin")}
            onBackToLanding={() => setView("landing")}
          />
        );
      default:
        return <LandingPage onSelectLoginType={handleSelectLoginType} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentUser && <Navbar />}
      <main className={currentUser ? "container mx-auto px-4 py-8" : ""}>
        {renderView()}
      </main>
    </div>
  );
}
