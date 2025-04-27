"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Mail,
  Lock,
  LogIn,
  ArrowLeft,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { createAdminUser } from "@/utils/create-admin";

export default function AdminLogin({ onBackToLanding }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const user = await login(email, password);

      // Check if user is not admin and reject
      if (!user.isAdmin) {
        setError(
          "This portal is for library staff only. Please use the member login."
        );
        setIsLoading(false);
        return;
      }

      // Login successful - the auth context will handle updating the state
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setError("");
    setSuccess("");
    setIsCreatingAdmin(true);

    try {
      const result = await createAdminUser();
      if (result.success) {
        setSuccess(result.message);
        // Pre-fill the form with admin credentials
        setEmail("admin@library.com");
        setPassword("admin123");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-lg border border-border fade-in">
        <div className="flex items-center mb-6">
          <button
            onClick={onBackToLanding}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold">Staff Login</h2>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold">LibraHub Administration</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Staff access only
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 slide-up">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6 slide-up">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10 w-full"
                placeholder="staff@library.com"
                required
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 w-full"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Staff Login
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
            Demo Account:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg text-xs">
            <p className="font-semibold">Admin:</p>
            <p className="text-gray-600 dark:text-gray-400">
              admin@library.com / admin123
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={handleCreateAdmin}
              disabled={isCreatingAdmin}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 transition-colors"
            >
              {isCreatingAdmin ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Admin...
                </span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin Account
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Click this button to create the default admin account if it
              doesn't exist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
