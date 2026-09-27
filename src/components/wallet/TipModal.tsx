import React, { useState } from 'react';
import { Gift, Sparkles, Coins, X, CheckCircle } from 'lucide-react';
import { User } from '../../types';
import { Storage } from '../../services/storage';

interface TipModalProps {
  currentUser: User | null;
  targetUserId: string;
  targetName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onOpenAuth: () => void;
  onUserUpdated: (user: User) => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  currentUser,
  targetUserId,
  targetName,
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
  onUserUpdated,
}) => {
  if (!isOpen) return null;

  const [currency, setCurrency] = useState<'silver' | 'gold'>('silver');
  const [amount, setAmount] = useState<number>(50);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const silverPresets = [25, 50, 100, 500];
  const goldPresets = [5, 10, 25, 100];

  const handleSendTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const balance = currency === 'silver' ? currentUser.silverCoins : currentUser.goldCoins;
    if (balance < amount) {
      setError(`Insufficient ${currency.toUpperCase()} balance. Claim your daily faucet first.`);
      return;
    }

    const success = Storage.sendGift(
      targetUserId,
      currency,
      amount,
      note.trim() || 'Awesome content appreciation!'
    );

    if (success) {
      const updated = Storage.getCurrentUser();
      if (updated) onUserUpdated(updated);
      onSuccess(`Sent ${amount} PYE ${currency.toUpperCase()} to ${targetName}!`);
      onClose();
    } else {
      setError('Transaction could not be completed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f0f18] border border-white/10 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Send Creator Tip</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-zinc-300">
          Sending virtual rewards to <span className="font-bold text-white">{targetName}</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSendTip} className="space-y-4">
          {/* Currency Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setCurrency('silver');
                setAmount(50);
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                currency === 'silver'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-slate-300" />
              <span>PYE Silver ({currentUser?.silverCoins.toLocaleString() || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrency('gold');
                setAmount(10);
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                currency === 'gold'
                  ? 'bg-[#ffd700] text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>PYE Gold ({currentUser?.goldCoins.toLocaleString() || 0})</span>
            </button>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Select Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(currency === 'silver' ? silverPresets : goldPresets).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                    amount === val
                      ? 'border-[#ff1493] bg-[#ff1493]/20 text-white'
                      : 'border-white/5 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Encouragement Message (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Keep inspiring the universe! 🚀"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff1493]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#ff8c00] to-[#ff1493] text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition"
          >
            Send {amount} {currency.toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  );
};
