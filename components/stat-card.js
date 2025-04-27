import { CheckSquare, DollarSign, Users } from "lucide-react"

export default function StatCard({ title, value, change, icon }) {
  const isPositive = change.startsWith("+")

  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="h-8 w-8 text-blue-500" />
      case "dollar-sign":
        return <DollarSign className="h-8 w-8 text-green-500" />
      case "check-square":
        return <CheckSquare className="h-8 w-8 text-purple-500" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-sm mt-2 ${isPositive ? "text-green-500" : "text-red-500"}`}>{change} from last month</p>
        </div>
        <div>{getIcon()}</div>
      </div>
    </div>
  )
}
