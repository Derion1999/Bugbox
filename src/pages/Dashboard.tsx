import React, { useState, useEffect } from 'react'
import { useAuth } from '../components/auth/AuthProvider'
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus'
import { PendingApprovals } from '../components/PendingApprovals'
import { TaskManager } from '../components/TaskManager'
import { CalendarManager } from '../components/CalendarManager'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Bug, Plus, Link2, Copy, CheckCircle, ListTodo } from 'lucide-react'
import { supabase, type Bug as BugType } from '../lib/supabase'
import { BugForm } from '../components/BugForm'
import { BugCard } from '../components/BugCard'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'bugs' | 'todo'>('bugs')
  const [bugs, setBugs] = useState<BugType[]>([])
  const [filteredBugs, setFilteredBugs] = useState<BugType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBug, setEditingBug] = useState<BugType | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchBugs()
  }, [])

  useEffect(() => {
    filterBugs()
  }, [bugs, severityFilter, statusFilter])

  const fetchBugs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBugs(data)
    }
    setLoading(false)
  }

  const filterBugs = () => {
    let filtered = [...bugs]

    if (severityFilter !== 'all') {
      filtered = filtered.filter(bug => bug.severity === severityFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bug => bug.status === statusFilter)
    }

    setFilteredBugs(filtered)
  }

  const handleSave = async (bugData: Partial<BugType>, files?: File[]) => {
    try {
      let bugId = editingBug?.id

      if (editingBug) {
        const { error } = await supabase
          .from('bugs')
          .update({ ...bugData, updated_at: new Date().toISOString() })
          .eq('id', editingBug.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('bugs')
          .insert([{ ...bugData, user_id: user!.id, approved: true }])
          .select()
          .single()

        if (error) throw error
        bugId = data.id
      }

      if (files && files.length > 0 && bugId) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${bugId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('bug-attachments')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { error: attachmentError } = await supabase
            .from('bug_attachments')
            .insert([{
              bug_id: bugId,
              file_name: file.name,
              file_path: fileName,
              file_type: file.type,
              file_size: file.size
            }])

          if (attachmentError) throw attachmentError
        }
      }

      await fetchBugs()
      setShowForm(false)
      setEditingBug(null)
    } catch (error) {
      console.error('Error saving bug:', error)
      alert('Failed to save bug. Please try again.')
    }
  }

  const handleEdit = (bug: BugType) => {
    setEditingBug(bug)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bug report?')) {
      const { error } = await supabase
        .from('bugs')
        .delete()
        .eq('id', id)

      if (!error) {
        await fetchBugs()
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBug(null)
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/report/${user!.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openBugs = bugs.filter(b => b.status === 'open').length
  const inProgressBugs = bugs.filter(b => b.status === 'in_progress').length
  const closedBugs = bugs.filter(b => b.status === 'closed').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email}
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your bug reports and track issues efficiently
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('bugs')}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'bugs'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bug className="w-5 h-5" />
              Bug Reports
            </button>
            <button
              onClick={() => setActiveTab('todo')}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'todo'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ListTodo className="w-5 h-5" />
              Tasks & Calendar
            </button>
          </nav>
        </div>

        {activeTab === 'bugs' ? (
          <>
            <PendingApprovals onBugApproved={fetchBugs} />

            <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Bug className="w-5 h-5 mr-2" />
                    Bug Reports ({filteredBugs.length})
                  </h2>
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Bug
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="all">All Severities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                ) : filteredBugs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">
                      {bugs.length === 0
                        ? 'No bug reports yet. Create your first bug report to get started.'
                        : 'No bugs match your current filters.'
                      }
                    </p>
                    {bugs.length === 0 && (
                      <Button size="sm" onClick={() => setShowForm(true)} className="mt-4">
                        <Plus className="w-4 h-4 mr-1" />
                        Create Bug Report
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBugs.map((bug) => (
                      <BugCard
                        key={bug.id}
                        bug={bug}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Quick Stats</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{openBugs}</div>
                    <div className="text-sm text-gray-600">Open Bugs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{inProgressBugs}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{closedBugs}</div>
                    <div className="text-sm text-gray-600">Resolved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center">
                  <Link2 className="w-5 h-5 mr-2" />
                  Public Report Link
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Share this link with external users to allow them to submit bug reports directly to you.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3 break-all text-sm text-gray-700 border border-gray-200">
                  {window.location.origin}/report/{user!.id}
                </div>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <SubscriptionStatus />
          </div>
        </div>

            {showForm && (
              <BugForm
                onClose={handleCloseForm}
                onSave={handleSave}
                bug={editingBug}
              />
            )}
          </>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <TaskManager />
            <CalendarManager />
          </div>
        )}
      </div>
    </div>
  )
}