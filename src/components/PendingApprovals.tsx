import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, X } from 'lucide-react'
import { supabase, type Bug } from '../lib/supabase'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader } from './ui/Card'

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

interface PendingApprovalsProps {
  onBugApproved?: () => void
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({ onBugApproved }) => {
  const [pendingBugs, setPendingBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingBugs()
  }, [])

  const fetchPendingBugs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPendingBugs(data)
    }
    setLoading(false)
  }

  const handleApprove = async (bugId: string) => {
    const { error } = await supabase
      .from('bugs')
      .update({ approved: true })
      .eq('id', bugId)

    if (!error) {
      await fetchPendingBugs()
      if (onBugApproved) {
        onBugApproved()
      }
    }
  }

  const handleReject = async (bugId: string) => {
    if (confirm('Are you sure you want to reject this bug report? This will permanently delete it.')) {
      const { error } = await supabase
        .from('bugs')
        .delete()
        .eq('id', bugId)

      if (!error) {
        await fetchPendingBugs()
      }
    }
  }

  if (loading) {
    return null
  }

  if (pendingBugs.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg shadow-md">
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center text-orange-900">
                <AlertCircle className="w-6 h-6 mr-2 text-orange-600" />
                Pending Approvals ({pendingBugs.length})
              </h2>
              <p className="text-sm text-orange-700 mt-1">
                Review and approve external bug submissions before they appear in your bug list
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingBugs.map((bug) => (
              <div
                key={bug.id}
                className="bg-white border-2 border-orange-300 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{bug.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColors[bug.severity]}`}>
                      {bug.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                {bug.description && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-3 border border-gray-200">
                      {bug.description}
                    </p>
                  </div>
                )}

                {bug.reporter_name && (
                  <div className="mb-3 bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      External Reporter
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      {bug.reporter_name}
                    </p>
                    {bug.reporter_email && (
                      <p className="text-sm text-gray-600">{bug.reporter_email}</p>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                  <span className="font-medium">Submitted:</span>
                  {new Date(bug.created_at).toLocaleDateString()} at {new Date(bug.created_at).toLocaleTimeString()}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleApprove(bug.id)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Add to Dashboard
                  </Button>
                  <Button
                    onClick={() => handleReject(bug.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-2 border-red-400 text-red-700 hover:bg-red-50 font-semibold"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject & Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
