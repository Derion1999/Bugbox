import { useState, useEffect } from 'react';
import { X, Upload, FileImage, FileVideo, Trash2 } from 'lucide-react';
import { Bug } from '../lib/supabase';

type BugFormProps = {
  onClose: () => void;
  onSave: (bug: Partial<Bug>, files?: File[]) => Promise<void>;
  bug?: Bug | null;
};

export function BugForm({ onClose, onSave, bug }: BugFormProps) {
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [status, setStatus] = useState<'open' | 'in_progress' | 'closed'>('open');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (bug) {
      setTitle(bug.title);
      setSteps(bug.steps);
      setExpected(bug.expected);
      setActual(bug.actual);
      setSeverity(bug.severity);
      setStatus(bug.status);
    }
  }, [bug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isUnder10MB = file.size <= 10 * 1024 * 1024;
        return (isImage || isVideo) && isUnder10MB;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await onSave({
      title,
      steps,
      expected,
      actual,
      severity,
      status,
    }, selectedFiles);

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-slate-900">
            {bug ? 'Edit Bug Report' : 'New Bug Report'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Brief description of the bug"
            />
          </div>

          <div>
            <label htmlFor="steps" className="block text-sm font-semibold text-slate-700 mb-1">
              Steps to Reproduce
            </label>
            <textarea
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
            />
          </div>

          <div>
            <label htmlFor="expected" className="block text-sm font-semibold text-slate-700 mb-1">
              Expected Behavior
            </label>
            <textarea
              id="expected"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              placeholder="What should happen..."
            />
          </div>

          <div>
            <label htmlFor="actual" className="block text-sm font-semibold text-slate-700 mb-1">
              Actual Behavior
            </label>
            <textarea
              id="actual"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              placeholder="What actually happens..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="severity" className="block text-sm font-semibold text-slate-700 mb-1">
                Severity
              </label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Attachments (Images & Videos)
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50/50 transition">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-red-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Images or videos (max 10MB each)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => {
                    const isVideo = file.type.startsWith('video/');
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        {isVideo ? (
                          <FileVideo className="w-5 h-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <FileImage className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-slate-200 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
