import React, { useState } from 'react';
import {
  Coins,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Clock,
  CheckCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { User, CoinTransaction } from '../../types';
import { Storage } from '../../services/storage';

interface PyeWalletModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

export const PyeWalletModal: React.FC<PyeWalletModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  if (!isOpen || !currentUser) return null;

  const [transactions, setTransactions] = useState<CoinTransaction[]>(() =>
    Storage.getTransactions(currentUser.id)
  );
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const handleClaimDaily = () => {
    const res = Storage.claimDailyReward();
    if (res.ok) {
      setClaimStatus(res.message);
      const updated = Storage.getCurrentUser();
      if (updated) onUserUpdated(updated);
      setTransactions(Storage.getTransactions(currentUser.id));
      setTimeout(() => setClaimStatus(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0f0f18] border border-white/10 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ffd700] to-[#ff8c00] flex items-center justify-center text-black">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                PYE Economy & Virtual Vault
              </h2>
              <div className="text-[11px] text-zinc-400">
                Authoritative Ledger · ID: {currentUser.pieId}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claim status toast */}
        {claimStatus && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{claimStatus}</span>
          </div>
        )}

        {/* Currency Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* PYE Silver */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-slate-300">PYE SILVER</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300">
                Activity Currency
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {currentUser.silverCoins.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400">
              Earned via posts, comments, daily streaks, and room engagement.
            </p>
          </div>

          {/* PYE Gold */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#ffd700]/15 to-zinc-900 border border-[#ffd700]/40 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#ffd700]">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> PYE GOLD
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffd700]/20 text-[#ffd700] font-bold">
                Creator Tier
              </span>
            </div>
            <div className="text-2xl font-black text-[#ffd700] font-mono tabular-nums">
              {currentUser.goldCoins.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400">
              Used to tip creator streams, unlock VIP summits, and volumetric gifts.
            </p>
          </div>
        </div>

        {/* Daily Faucet Grant CTA */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ff1493]/20 via-[#ff8c00]/20 to-transparent border border-white/10 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#ff8c00]" />
              <span>Daily Universe Faucet Grant</span>
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Claim free +250 PYE Silver & +10 PYE Gold every day to support creators.
            </p>
          </div>

          <button
            onClick={handleClaimDaily}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white text-xs font-bold whitespace-nowrap shadow-md hover:opacity-95 transition"
          >
            Claim Free Grant
          </button>
        </div>

        {/* Transaction History Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Transaction Ledger</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {transactions.length} entries
            </span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="text-center text-xs text-zinc-500 py-6">
                No coin transactions recorded yet.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'credit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate max-w-xs">{tx.reason}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                        <span>{tx.id}</span>
                        <span>·</span>
                        <time>{new Date(tx.timestamp).toLocaleDateString()}</time>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-bold tabular-nums ${
                        tx.type === 'credit' ? 'text-emerald-400' : 'text-zinc-200'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}
                      {tx.amount.toLocaleString()} {tx.currency === 'gold' ? 'GLD' : 'SLV'}
                    </div>
                    <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety Note */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-2 border-t border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Real-money payments are disabled in development mode. Virtual currencies are managed by the authoritative platform engine.
          </span>
        </div>
      </div>
    </div>
  );
};
