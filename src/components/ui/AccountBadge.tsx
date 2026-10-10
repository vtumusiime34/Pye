import React from 'react';
import { Check, Sparkles, Star, ShieldCheck } from 'lucide-react';

interface AccountBadgeProps {
  followersCount?: number;
  isVerified?: boolean;
  role?: string;
  className?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface BadgeTier {
  type: 'white' | 'yellow' | 'blue' | 'silver' | 'gold' | 'gold_plus' | null;
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: 'check' | 'star' | 'sparkle';
}

export function getFollowerBadgeTier(followersCount: number = 0): BadgeTier {
  if (followersCount >= 10000000) {
    return {
      type: 'gold_plus',
      label: '10M+ Galactic Milestone',
      colorClass: 'text-amber-300 fill-amber-300',
      bgClass: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-amber-500/50',
      borderClass: 'border-yellow-200',
      icon: 'star',
    };
  }
  if (followersCount >= 1000000) {
    return {
      type: 'gold',
      label: '1M+ Golden Milestone',
      colorClass: 'text-yellow-400 fill-yellow-400',
      bgClass: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-yellow-500/40',
      borderClass: 'border-yellow-300',
      icon: 'check',
    };
  }
  if (followersCount >= 500000) {
    return {
      type: 'silver',
      label: '500K+ Silver Milestone',
      colorClass: 'text-slate-100 fill-slate-100',
      bgClass: 'bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400 shadow-slate-400/40',
      borderClass: 'border-slate-300',
      icon: 'check',
    };
  }
  if (followersCount >= 100000) {
    return {
      type: 'blue',
      label: '100K+ Diamond Blue Milestone',
      colorClass: 'text-sky-400 fill-sky-400',
      bgClass: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-blue-500/40',
      borderClass: 'border-sky-300',
      icon: 'check',
    };
  }
  if (followersCount >= 50000) {
    return {
      type: 'yellow',
      label: '50K+ Solar Yellow Milestone',
      colorClass: 'text-yellow-300 fill-yellow-300',
      bgClass: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-yellow-500/40',
      borderClass: 'border-yellow-400',
      icon: 'check',
    };
  }
  if (followersCount >= 10000) {
    return {
      type: 'white',
      label: '10K+ Creator Milestone',
      colorClass: 'text-white fill-white',
      bgClass: 'bg-white shadow-white/40',
      borderClass: 'border-zinc-200',
      icon: 'check',
    };
  }
  return {
    type: null,
    label: '',
    colorClass: '',
    bgClass: '',
    borderClass: '',
    icon: 'check',
  };
}

export const AccountBadge: React.FC<AccountBadgeProps> = ({
  followersCount = 0,
  isVerified = false,
  role = 'user',
  className = '',
  showTooltip = true,
  size = 'md',
}) => {
  const milestone = getFollowerBadgeTier(followersCount);
  const isAdmin = role === 'admin';

  const iconSizes = {
    sm: { container: 'w-3.5 h-3.5', icon: 'w-2 h-2' },
    md: { container: 'w-4 h-4', icon: 'w-2.5 h-2.5' },
    lg: { container: 'w-5 h-5', icon: 'w-3 h-3' },
  };

  const { container, icon } = iconSizes[size];

  return (
    <div className={`inline-flex items-center gap-1 shrink-0 ${className}`}>
      {/* 1. Official Identity Verification Tick */}
      {isVerified && (
        <span
          title={showTooltip ? 'Verified PYE Creator' : undefined}
          className={`relative ${container} rounded-full bg-gradient-to-tr from-[#FF007A] to-[#FFA000] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20`}
        >
          <Check className={`${icon} stroke-[3] text-white`} />
        </span>
      )}

      {/* 2. Follower Milestone Badge (10K White, 50K Yellow, 100K Blue, 500K Silver, 1M Gold, 10M+ Gold + Star) */}
      {milestone.type && (
        <span
          title={showTooltip ? milestone.label : undefined}
          className={`relative ${container} rounded-full ${milestone.bgClass} flex items-center justify-center text-zinc-900 shadow-md ring-1 ${milestone.borderClass}`}
        >
          {milestone.icon === 'star' ? (
            <Star className={`${icon} stroke-[3] fill-zinc-950 text-zinc-950`} />
          ) : (
            <Check className={`${icon} stroke-[3.5] text-zinc-950`} />
          )}
        </span>
      )}

      {/* 3. Official APPIX Administrator Badge */}
      {isAdmin && (
        <span
          title={showTooltip ? 'Authorized APPIX Administrator' : undefined}
          className="px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-400/40 text-[9px] font-black uppercase text-amber-300 font-mono flex items-center gap-0.5"
        >
          <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
          <span>ADMIN</span>
        </span>
      )}
    </div>
  );
};
