import { Edit2, Trash2, Clock, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';
import { Bug, BugAttachment, supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

type BugCardProps = {
  bug: Bug;
  onEdit: (bug: Bug) => void;
  onDelete: (id: string) => void;
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const statusColors = {
  open: 'bg-slate-100 text-slate-800 border-slate-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-green-100 text-green-800 border-green-200',
};

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

export function BugCard({ bug, onEdit, onDelete }: BugCardProps) {
  const [attachments, setAttachments] = useState<BugAttachment[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAttachments();
  }, [bug.id]);

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('bug_attachments')
      .select('*')
      .eq('bug_id', bug.id);

    if (!error && data) {
      setAttachments(data);

      const urls: Record<string, string> = {};
      for (const attachment of data) {
        const { data: urlData } = await supabase.storage
          .from('bug-attachments')
          .createSignedUrl(attachment.file_path, 3600);

        if (urlData) {
          urls[attachment.id] = urlData.signedUrl;
        }
      }
      setAttachmentUrls(urls);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{bug.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColors[bug.severity]}`}>
              {bug.severity.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[bug.status]}`}>
              {statusLabels[bug.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(bug)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Edit bug"
          >
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => onDelete(bug.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition"
            title="Delete bug"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {bug.description ? (
          <div>
            <div className="flex items-center gap-1 text-slate-600 font-semibold mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Description</span>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap pl-5">{bug.description}</p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-1 text-slate-600 font-semibold mb-1">
                <Clock className="w-4 h-4" />
                <span>Steps to Reproduce</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap pl-5">{bug.steps}</p>
            </div>

            <div>
              <div className="flex items-center gap-1 text-slate-600 font-semibold mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Expected Behavior</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap pl-5">{bug.expected}</p>
            </div>

            <div>
              <div className="flex items-center gap-1 text-slate-600 font-semibold mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Actual Behavior</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap pl-5">{bug.actual}</p>
            </div>
          </>
        )}

        {bug.reporter_name && (
          <div className="pt-2 border-t border-slate-200">
            <div className="text-slate-600 font-semibold mb-1">
              Reported by
            </div>
            <p className="text-slate-700 pl-5">
              {bug.reporter_name}
              {bug.reporter_email && (
                <span className="text-slate-500"> ({bug.reporter_email})</span>
              )}
            </p>
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1 text-slate-600 font-semibold mb-3">
            <ImageIcon className="w-4 h-4" />
            <span>Attachments ({attachments.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {attachments.map((attachment) => {
              const url = attachmentUrls[attachment.id];
              const isVideo = attachment.file_type.startsWith('video/');

              return (
                <a
                  key={attachment.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition"
                >
                  {url && (
                    isVideo ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <Video className="w-8 h-8 text-white" />
                        <video
                          src={url}
                          className="absolute inset-0 w-full h-full object-cover"
                          muted
                        />
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={attachment.file_name}
                        className="w-full h-full object-cover"
                      />
                    )
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium">
                        View
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Created {new Date(bug.created_at).toLocaleDateString()}</span>
        {bug.updated_at !== bug.created_at && (
          <span>Updated {new Date(bug.updated_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
