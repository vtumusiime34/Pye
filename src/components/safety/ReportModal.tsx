import React, { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle, X, UserX } from 'lucide-react';
import { User, SafetyReport } from '../../types';
import { Storage } from '../../services/storage';

interface ReportModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: string;
  targetTitle?: string;
  onOpenAuth: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const [reason, setReason] = useState('Harassment or Bullying');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    'Harassment or Bullying',
    'Spam, Fraud, or Bot Activity',
    'Inappropriate Adult / NSFW Content',
    'Hate Speech or Discrimination',
    'Misinformation or Impersonation',
    'Violence or Dangerous Organizations',
    'Intellectual Property / Copyright',
    'Other Issue',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    Storage.submitReport({
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      reportedItemId: targetId,
      reportedItemType: targetType as SafetyReport['reportedItemType'],
      reportedTitle: targetTitle,
      reason,
      description: description.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f0f18] border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Safety & Moderation Report</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-zinc-400">
              Our moderation team reviews every queued report. Thank you for keeping PYE Universe safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-300">
              <div>
                Reporting <span className="font-bold uppercase text-rose-400">{targetType}</span>:
              </div>
              <div className="font-semibold text-white truncate mt-0.5">
                {targetTitle || `ID: ${targetId}`}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Select Concern Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {reportReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Additional Context (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any details to assist the safety team..."
                rows={3}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30"
              >
                Submit Report to Safety Center
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
