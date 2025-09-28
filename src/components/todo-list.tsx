'use client'

import { useState, useEffect } from 'react'
import PouchDB from 'pouchdb-browser'
import { Plus } from 'lucide-react'
import { TodoItem } from './todo-item'

interface TodoDoc {
  _id: string
  _rev?: string
  text: string
  createdAt: number
}

const db = new PouchDB('todos')

export function TodoList() {
  const [newTodo, setNewTodo] = useState('')
  const [todos, setTodos] = useState<TodoDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTodos = async () => {
    try {
      setLoading(true)
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'todo_',
        endkey: 'todo_\uffff',
        descending: true
      })

      const todosList = result.rows
        .map(row => row.doc as TodoDoc)
        .filter(doc => doc && doc.text)
        .sort((a, b) => b.createdAt - a.createdAt)

      setTodos(todosList)
      setError(null)
    } catch (err) {
      console.error('Error loading todos:', err)
      setError('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()

    const changes = db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', () => {
      loadTodos()
    })

    return () => {
      changes.cancel()
    }
  }, [])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      await db.put({
        _id: `todo_${Date.now()}`,
        text: newTodo.trim(),
        createdAt: Date.now()
      })
      setNewTodo('')
    } catch (err) {
      console.error('Error adding todo:', err)
      setError('Failed to add todo')
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const doc = await db.get(id)
      await db.remove(doc)
    } catch (err) {
      console.error('Error deleting todo:', err)
      setError('Failed to delete todo')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">Loading todos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center text-red-500">Error: {error}</div>
        <button
          onClick={loadTodos}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Todo List
      </h2>

      <form onSubmit={addTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Add todo"
          >
            <Plus size={20} />
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No todos yet. Add one above!
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo._id}
              id={todo._id}
              text={todo.text}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>
    </div>
  )
}