import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  MessageSquare,
  Sparkles,
  Link,
  Code,
} from 'lucide-react';
import { PyesVideo, User } from '../../types';
import { Storage } from '../../services/storage';

interface PyesShareModalProps {
  pyes: PyesVideo;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const PyesShareModal: React.FC<PyesShareModalProps> = ({
  pyes,
  currentUser,
  isOpen,
  onClose,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [dmNote, setDmNote] = useState<string>('Check out this PYES video on PYE!');
  const [isSending, setIsSending] = useState(false);

  const shareUrl = `${window.location.origin}/#pyes_${pyes.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      Storage.recordPyesShare(pyes.id);
      onShowToast('PYES video link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pyes.title || 'PYES on PYE Universe',
          text: pyes.caption,
          url: shareUrl,
        });
        Storage.recordPyesShare(pyes.id);
        onShowToast('Shared successfully!');
        onClose();
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onShowToast('Please sign in to send PYE messages.');
      return;
    }
    if (!selectedRecipientId) {
      onShowToast('Please select a recipient.');
      return;
    }

    setIsSending(true);
    try {
      const fullMessage = `${dmNote}\n\n▶ PYES: ${pyes.title || pyes.caption.slice(0, 40)}\n${shareUrl}`;
      Storage.sendMessage(selectedRecipientId, fullMessage);
      Storage.recordPyesShare(pyes.id);
      onShowToast('PYES shared directly via PYE Message!');
      onClose();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  // Get available users to share with (all genuine users excluding self)
  const availableUsers = Storage.getUsers().filter((u) => u.id !== currentUser?.id);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0d0d16] border border-white/10 rounded-3xl p-5 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-[#FF007A] to-[#FFA000] text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Share PYES
              </h3>
              <p className="text-[11px] text-zinc-400">
                Broadcast this vertical video across PYE or external apps.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video preview summary card */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="relative aspect-[9/16] w-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
            <video
              src={pyes.videoUrl}
              poster={pyes.posterUrl}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {pyes.title || pyes.caption.slice(0, 30)}
            </div>
            <div className="text-[11px] text-zinc-400 truncate">@{pyes.author.username}</div>
            <div className="text-[10px] text-[#FFA000] font-mono mt-0.5">
              {pyes.likesCount} likes · {pyes.commentsCount} comments
            </div>
          </div>
        </div>

        {/* Quick Share Action Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-900/90 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Copy className="w-5 h-5 text-[#FFA000]" />
            )}
            <span>{copied ? 'Copied Link!' : 'Copy PYES Link'}</span>
          </button>

          {/* Native Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 text-white hover:bg-white/10 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition"
          >
            <Share2 className="w-5 h-5 text-[#FF007A]" />
            <span>Native Share</span>
          </button>
        </div>

        {/* Direct PYE Message Sharing */}
        {currentUser && availableUsers.length > 0 && (
          <form onSubmit={handleSendDM} className="space-y-2.5 pt-2 border-t border-white/10">
            <label className="block text-xs font-semibold text-zinc-300">
              Send directly to PYE Member
            </label>

            {/* Recipient user select */}
            <div className="flex gap-2 overflow-x-auto pb-1.5">
              {availableUsers.map((u) => {
                const isSelected = selectedRecipientId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedRecipientId(u.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border shrink-0 transition ${
                      isSelected
                        ? 'bg-[#FF007A]/20 border-[#FF007A] text-white'
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.fullName}
                      className="w-9 h-9 rounded-full object-cover bg-zinc-800"
                    />
                    <span className="text-[10px] font-medium max-w-[64px] truncate">
                      @{u.username}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={dmNote}
                onChange={(e) => setDmNote(e.target.value)}
                placeholder="Add a quick note..."
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
              />
              <button
                type="submit"
                disabled={!selectedRecipientId || isSending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold disabled:opacity-40 hover:opacity-95 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
