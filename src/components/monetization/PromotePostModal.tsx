import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Coins,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
} from 'lucide-react';
import { Post, PyesVideo, User } from '../../types';
import { Storage } from '../../services/storage';

interface PromotePostModalProps {
  item: Post | PyesVideo;
  itemType: 'post' | 'pyes';
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onOpenWallet: () => void;
}

export const PromotePostModal: React.FC<PromotePostModalProps> = ({
  item,
  itemType,
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  onOpenWallet,
}) => {
  if (!isOpen || !currentUser) return null;

  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'reach1k'>('starter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plans = {
    starter: {
      id: 'starter',
      costSPC: 15,
      title: 'Starter Algorithmic Boost',
      description: 'Pushes this transmission into high-priority algorithmic discovery across the feed for 24 hours.',
      targetReach: '300+ Active Pye Users',
    },
    reach1k: {
      id: 'reach1k',
      costSPC: 60,
      title: '1,000+ Target Audience Reach',
      description: 'Guaranteed high-visibility placement across the Universe feed until 1,000+ genuine views are reached.',
      targetReach: '1,000+ Target Audience',
    },
  };

  const activePlan = plans[selectedPlan];
  const userBalance = currentUser.silverCoins;
  const canAfford = userBalance >= activePlan.costSPC;

  const handlePromote = () => {
    setErrorMsg(null);
    if (!canAfford) {
      setErrorMsg(`Insufficient PYE Silver Coins (SPC). You have ${userBalance} SPC, but need ${activePlan.costSPC} SPC.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Deduct coins atomically
      const updatedUser = Storage.getCurrentUser();
      if (!updatedUser || updatedUser.silverCoins < activePlan.costSPC) {
        throw new Error('Transaction could not be completed.');
      }

      updatedUser.silverCoins -= activePlan.costSPC;
      Storage.updateProfile(updatedUser);

      // Record transaction
      Storage.addTransaction({
        userId: currentUser.id,
        type: 'debit',
        currency: 'silver',
        amount: activePlan.costSPC,
        reason: `Promoted ${itemType === 'pyes' ? 'PYES Reel' : 'Universe Pulse'} (${activePlan.title})`,
      });

      // Update post state with promotion flag
      if (itemType === 'post') {
        const posts = Storage.getPosts({ activeOnly: false });
        const postIdx = posts.findIndex((p) => p.id === item.id);
        if (postIdx >= 0) {
          posts[postIdx].isPromoted = true;
          localStorage.setItem('pye_posts', JSON.stringify(posts));
        }
      } else {
        const shorts = Storage.getPyes('foryou', { activeOnly: false });
        const shortIdx = shorts.findIndex((s) => s.id === item.id);
        if (shortIdx >= 0) {
          shorts[shortIdx].isPromoted = true;
          localStorage.setItem('pye_pyes_reels', JSON.stringify(shorts));
        }
      }

      onSuccess(`Transmission promoted successfully with ${activePlan.costSPC} SPC! Target: ${activePlan.targetReach}.`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Promotion failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f0f18] border border-white/10 rounded-3xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF007A] to-[#FFA000] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0f0f18] rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#FFA000]" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Promote Transmission
              </h3>
              <p className="text-[11px] text-zinc-400">
                Boost your Pulse or PYES using PYE Silver Coins (SPC)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Content Preview */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-3">
          {('mediaUrl' in item ? item.mediaUrl : (item as PyesVideo).posterUrl || (item as PyesVideo).videoUrl) && (
            <img
              src={'mediaUrl' in item ? item.mediaUrl : (item as PyesVideo).posterUrl || (item as PyesVideo).videoUrl}
              alt="Preview"
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-[#FFA000] uppercase tracking-wider">
              {itemType === 'pyes' ? 'PYES Reel' : 'Universe Pulse'}
            </span>
            <p className="text-xs text-zinc-200 truncate font-semibold">
              {item.caption || (item as any).title || 'Selected post'}
            </p>
          </div>
        </div>

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Starter Plan (15 SPC) */}
          <div
            onClick={() => setSelectedPlan('starter')}
            className={`p-4 rounded-2xl border cursor-pointer transition relative ${
              selectedPlan === 'starter'
                ? 'bg-[#FF007A]/15 border-[#FF007A] shadow-lg shadow-[#FF007A]/20'
                : 'bg-zinc-900/40 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Starter Boost</span>
              <span className="text-sm font-black text-[#FFA000] font-mono">15 SPC</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
              High-priority algorithmic boost in discovery feeds for 24h.
            </p>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Target className="w-3 h-3 text-[#FF007A]" />
              <span>~300+ Pye Users</span>
            </div>
          </div>

          {/* 1,000+ Reach Plan (60 SPC) */}
          <div
            onClick={() => setSelectedPlan('reach1k')}
            className={`p-4 rounded-2xl border cursor-pointer transition relative ${
              selectedPlan === 'reach1k'
                ? 'bg-[#FFA000]/15 border-[#FFA000] shadow-lg shadow-[#FFA000]/20'
                : 'bg-zinc-900/40 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">1,000+ Reach</span>
              <span className="text-sm font-black text-[#FFA000] font-mono">60 SPC</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
              Targeted placement across Universe until 1,000+ views achieved.
            </p>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FFA000]" />
              <span>1,000+ Target Reach</span>
            </div>
          </div>
        </div>

        {/* Current Balance Bar */}
        <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FFA000]" />
            <span className="text-zinc-300">Your Silver Balance:</span>
            <span className="font-bold text-white font-mono">{userBalance.toLocaleString()} SPC</span>
          </div>

          {!canAfford && (
            <button
              onClick={() => {
                onClose();
                onOpenWallet();
              }}
              className="text-[11px] font-bold text-[#FF007A] hover:underline"
            >
              Get More Coins →
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handlePromote}
          disabled={!canAfford || isSubmitting}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold transition shadow-lg shadow-[#FF007A]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Confirm & Promote for {activePlan.costSPC} SPC</span>
        </button>
      </div>
    </div>
  );
};
