"use client"

import { useState } from "react"
import { CheckCircle, Circle, Plus, Trash2 } from "lucide-react"

export default function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review project proposal", completed: true },
    { id: 2, text: "Prepare presentation slides", completed: false },
    { id: 3, text: "Update client documentation", completed: false },
    { id: 4, text: "Schedule team meeting", completed: true },
  ])

  const [newTask, setNewTask] = useState("")

  const addTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
    }

    setTasks([...tasks, task])
    setNewTask("")
  }

  const toggleTask = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Tasks</h2>

      <form onSubmit={addTask} className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 flex items-center">
          <Plus size={20} />
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
          >
            <div className="flex items-center">
              <button
                onClick={() => toggleTask(task.id)}
                className="mr-2 text-gray-400 hover:text-blue-500"
                aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {task.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
              </button>
              <span className={task.completed ? "line-through text-gray-500" : ""}>{task.text}</span>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-400 hover:text-red-500"
              aria-label="Delete task"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
