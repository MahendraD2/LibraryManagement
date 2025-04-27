"use client";

import { useState } from "react";
import { testFirestoreConnection } from "@/utils/create-admin";
import { db } from "@/lib/firebase";

export default function FirebaseDiagnostics() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testFirestoreConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error running test: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Firebase Diagnostics</h3>

      <div className="space-y-4">
        <div>
          <button
            onClick={runConnectionTest}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Firestore Connection"}
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {showConfig ? "Hide Config" : "Show Config"}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-md ${
              testResult.success
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
            }`}
          >
            <p className="font-medium">
              {testResult.success ? "Success!" : "Error!"}
            </p>
            <p>{testResult.message}</p>
          </div>
        )}

        {showConfig && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md overflow-auto">
            <h4 className="font-medium mb-2">Firebase Configuration</h4>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(
                {
                  projectId: db?.app?.options?.projectId || "Not available",
                  databaseURL: db?.app?.options?.databaseURL || "Not available",
                  storageBucket:
                    db?.app?.options?.storageBucket || "Not available",
                  appId: db?.app?.options?.appId || "Not available",
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              Make sure your Firebase configuration in{" "}
              <code>lib/firebase.js</code> is correct
            </li>
            <li>
              Check that your Firestore security rules allow read/write access
            </li>
            <li>
              Verify that you've initialized Firestore in your Firebase project
            </li>
            <li>
              Ensure you're looking at the correct Firebase project in the
              console
            </li>
            <li>Try clearing your browser cache and reloading</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
