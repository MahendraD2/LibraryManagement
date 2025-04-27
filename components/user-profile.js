export default function UserProfile() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex flex-col items-center">
        <img src="/diverse-avatars.png" alt="User avatar" className="w-24 h-24 rounded-full mb-4" />
        <h2 className="text-xl font-bold">John Doe</h2>
        <p className="text-gray-500 dark:text-gray-400">Product Manager</p>

        <div className="w-full mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Profile Completion</span>
            <span className="text-sm font-medium">85%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
          </div>
        </div>

        <div className="w-full mt-6 space-y-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
              <span className="text-blue-500 dark:text-blue-300 text-sm font-bold">E</span>
            </div>
            <span>john.doe@example.com</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
              <span className="text-green-500 dark:text-green-300 text-sm font-bold">P</span>
            </div>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
              <span className="text-purple-500 dark:text-purple-300 text-sm font-bold">L</span>
            </div>
            <span>San Francisco, CA</span>
          </div>
        </div>
      </div>
    </div>
  )
}
