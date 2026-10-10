import React, { useState } from 'react';
import {
  X,
  RotateCw,
  Download,
  Share2,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { User } from '../../types';
import { PyeLogo } from '../ui/PyeLogo';
import { AccountBadge } from '../ui/AccountBadge';

interface PyeIdCardModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const PyeIdCardModal: React.FC<PyeIdCardModalProps> = ({
  user,
  isOpen,
  onClose,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = `${window.location.origin}/#profile_${user.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    onShowToast('Pye ID profile link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    onShowToast(`Downloaded Pye ID Card for @${user.username} (PNG)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <PyeLogo size={24} />
            <span className="text-xs font-black tracking-widest text-white uppercase font-display">
              Official Pye ID
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-white/10"
              title="Flip Card"
            >
              <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? 'rotate-180 text-[#FFA000]' : ''}`} />
              <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Flipping Card Container */}
        <div
          className="w-full h-[460px] perspective-1000 cursor-pointer select-none"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT FACE */}
            <div className="absolute inset-0 backface-hidden rounded-3xl p-6 bg-gradient-to-br from-[#12121e] via-[#0b0b14] to-[#181124] border-2 border-white/15 shadow-[0_20px_50px_rgba(255,0,122,0.3)] flex flex-col justify-between overflow-hidden">
              {/* Holographic Watermark Glows */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-gradient-to-br from-[#FF007A]/30 to-[#FFA000]/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-gradient-to-tr from-[#FF007A]/20 to-[#00F0FF]/15 blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                <PyeLogo size={32} showText showAppixTag />
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    Digital Passport
                  </div>
                  <div className="text-xs font-black text-[#FFA000] font-mono">
                    {user.pieId || 'PYE-0001'}
                  </div>
                </div>
              </div>

              {/* User Photo & Info */}
              <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-3">
                <div className="relative group">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-2xl bg-zinc-900 object-cover ring-4 ring-[#FF007A]/40 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2">
                    <AccountBadge
                      followersCount={user.followersCount}
                      isVerified={user.isVerified}
                      role={user.role}
                      size="lg"
                    />
                  </div>
                </div>

                <div className="space-y-1 max-w-[90%]">
                  <h3 className="text-lg font-black text-white font-display truncate">
                    {user.fullName}
                  </h3>
                  <p className="text-xs font-bold text-[#FF007A] font-mono">
                    @{user.username}
                  </p>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed mt-1">
                    {user.bio || 'Pye user exploring the PYE Social Universe.'}
                  </p>
                </div>
              </div>

              {/* Card Footer: Metadata & Security Hash */}
              <div className="relative z-10 border-t border-white/10 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>APPIX SECURE ID</span>
                </div>
                <div className="text-right">
                  <span>TAP TO FLIP ↻</span>
                </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 bg-gradient-to-br from-[#181124] via-[#0b0b14] to-[#12121e] border-2 border-white/15 shadow-[0_20px_50px_rgba(255,160,0,0.3)] flex flex-col justify-between overflow-hidden">
              {/* Back Glows */}
              <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-gradient-to-br from-[#FFA000]/30 to-[#FF007A]/20 blur-3xl pointer-events-none" />

              {/* Back Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#FFA000]" />
                  <span className="text-xs font-bold text-white font-display">
                    PROFILE SCAN CODE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {user.pieId || 'PYE-0001'}
                </span>
              </div>

              {/* QR Code Simulation & Follower Stats */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-4 my-auto">
                {/* Visual QR Code Pattern */}
                <div className="p-4 rounded-2xl bg-white shadow-2xl flex flex-col items-center justify-center">
                  <div className="w-36 h-36 flex items-center justify-center bg-black p-2 rounded-xl">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                      <rect x="0" y="0" width="30" height="30" rx="4" />
                      <rect x="6" y="6" width="18" height="18" fill="black" rx="2" />
                      <rect x="11" y="11" width="8" height="8" fill="white" />
                      
                      <rect x="70" y="0" width="30" height="30" rx="4" />
                      <rect x="76" y="6" width="18" height="18" fill="black" rx="2" />
                      <rect x="81" y="11" width="8" height="8" fill="white" />
                      
                      <rect x="0" y="70" width="30" height="30" rx="4" />
                      <rect x="6" y="76" width="18" height="18" fill="black" rx="2" />
                      <rect x="11" y="81" width="8" height="8" fill="white" />
                      
                      <rect x="40" y="15" width="20" height="8" />
                      <rect x="45" y="35" width="10" height="30" />
                      <rect x="15" y="45" width="20" height="10" />
                      <rect x="65" y="45" width="25" height="10" />
                      <rect x="40" y="75" width="20" height="15" />
                      <rect x="75" y="75" width="15" height="15" />
                    </svg>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-xs font-bold text-white">
                    Scan to visit @{user.username}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-300">
                    <div>
                      <span className="font-bold text-white">{user.followersCount.toLocaleString()}</span> Followers
                    </div>
                    <div>•</div>
                    <div>
                      <span className="font-bold text-white">{user.followingCount.toLocaleString()}</span> Following
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Footer */}
              <div className="relative z-10 border-t border-white/10 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>PYE SOCIAL UNIVERSE BY APPIX</span>
                <span>TAP TO FLIP ↻</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Below Card */}
        <div className="w-full flex items-center gap-3 mt-4">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 active:scale-95 shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Copy Profile Link'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#FF007A]/30 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Pye ID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
