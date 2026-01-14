import React, { useState, useEffect } from 'react'
import { Plus, Check, X, Calendar as CalendarIcon, Trash2, Edit2 } from 'lucide-react'
import { supabase, type Task } from '../lib/supabase'
import { useAuth } from './auth/AuthProvider'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader } from './ui/Card'
import { Input } from './ui/Input'

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
}

export const TaskManager: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('completed', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            ...formData,
            due_date: formData.due_date || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTask.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{
            ...formData,
            user_id: user!.id,
            due_date: formData.due_date || null,
          }])

        if (error) throw error
      }

      await fetchTasks()
      resetForm()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
    })
    setShowForm(false)
    setEditingTask(null)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    })
    setShowForm(true)
  }

  const handleToggleComplete = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)

    if (!error) {
      await fetchTasks()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (!error) {
        await fetchTasks()
      }
    }
  }

  const completedTasks = tasks.filter(t => t.completed)
  const incompleteTasks = tasks.filter(t => !t.completed)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h3 className="font-semibold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add task details"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No tasks yet. Create your first task to get started.</p>
              {!showForm && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {incompleteTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Active Tasks ({incompleteTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {incompleteTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggleComplete}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Completed Tasks ({completedTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggleComplete}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
      task.completed
        ? 'bg-gray-50 border-gray-200 opacity-60'
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}>
      <button
        onClick={() => onToggle(task)}
        className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-500'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h4>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4">
          {task.due_date && (
            <div className={`text-xs flex items-center gap-1 ${
              isOverdue ? 'text-red-600 font-semibold' : task.completed ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <CalendarIcon className="w-3 h-3" />
              Due: {new Date(task.due_date).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Edit task"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
