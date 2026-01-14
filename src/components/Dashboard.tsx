import { useState, useEffect } from 'react';
import { Plus, LogOut, Bug as BugIcon, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Bug } from '../lib/supabase';
import { BugForm } from './BugForm';
import { BugCard } from './BugCard';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [filteredBugs, setFilteredBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBugs();
  }, []);

  useEffect(() => {
    filterBugs();
  }, [bugs, severityFilter, statusFilter]);

  const fetchBugs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBugs(data);
    }
    setLoading(false);
  };

  const filterBugs = () => {
    let filtered = [...bugs];

    if (severityFilter !== 'all') {
      filtered = filtered.filter(bug => bug.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bug => bug.status === statusFilter);
    }

    setFilteredBugs(filtered);
  };

  const handleSave = async (bugData: Partial<Bug>) => {
    if (editingBug) {
      const { error } = await supabase
        .from('bugs')
        .update({ ...bugData, updated_at: new Date().toISOString() })
        .eq('id', editingBug.id);

      if (!error) {
        await fetchBugs();
      }
    } else {
      const { error } = await supabase
        .from('bugs')
        .insert([{ ...bugData, user_id: user!.id }]);

      if (!error) {
        await fetchBugs();
      }
    }

    setShowForm(false);
    setEditingBug(null);
  };

  const handleEdit = (bug: Bug) => {
    setEditingBug(bug);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bug report?')) {
      const { error } = await supabase
        .from('bugs')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchBugs();
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBug(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-lg">
                <BugIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">BugBox</h1>
                <p className="text-sm text-slate-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Bug Reports</h2>
            <p className="text-slate-600 mt-1">
              {filteredBugs.length} {filteredBugs.length === 1 ? 'bug' : 'bugs'} found
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Bug Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-red-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading bug reports...</p>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <BugIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bugs found</h3>
            <p className="text-slate-600 mb-6">
              {bugs.length === 0
                ? "Get started by creating your first bug report"
                : "No bugs match your current filters"}
            </p>
            {bugs.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
              >
                <Plus className="w-5 h-5" />
                Create Bug Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
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
      </main>

      {showForm && (
        <BugForm
          onClose={handleCloseForm}
          onSave={handleSave}
          bug={editingBug}
        />
      )}
    </div>
  );
}
