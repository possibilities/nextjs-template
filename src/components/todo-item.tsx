'use client'

import { Trash2 } from 'lucide-react'

interface TodoItemProps {
  id: string
  text: string
  onDelete: (id: string) => void
}

export function TodoItem({ id, text, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <span className="text-gray-900 dark:text-gray-100">{text}</span>
      <button
        onClick={() => onDelete(id)}
        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        aria-label="Delete todo"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}