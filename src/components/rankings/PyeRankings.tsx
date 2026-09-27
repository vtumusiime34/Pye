import React, { useState } from 'react';
import { Trophy, Flame, Heart, Users, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { RankingItem, User } from '../../types';
import { Storage } from '../../services/storage';

interface PyeRankingsProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onViewProfile: (userId: string) => void;
}

export const PyeRankings: React.FC<PyeRankingsProps> = ({
  currentUser,
  onOpenAuth,
  onViewProfile,
}) => {
  const [category, setCategory] = useState<RankingItem['category']>('creators');
  const [rankings, setRankings] = useState<RankingItem[]>(() => Storage.getRankings('creators'));

  const handleCategoryChange = (cat: RankingItem['category']) => {
    setCategory(cat);
    setRankings(Storage.getRankings(cat));
  };

  const handleFollowToggle = (userId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    Storage.toggleFollow(userId);
    setRankings(Storage.getRankings(category));
  };

  const top3 = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#ffd700]/10 via-[#ff1493]/10 to-[#ff8c00]/10 border border-[#ffd700]/20 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd700]/20 border border-[#ffd700]/40 mx-auto flex items-center justify-center text-[#ffd700] shadow-lg">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
          Official PYE Universe Rankings
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Recognizing the pioneering creators, visionary builders, and highest-impact contributors across the universe.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0f0f18] rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleCategoryChange('creators')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
            category === 'creators'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Top Creators</span>
        </button>

        <button
          onClick={() => handleCategoryChange('growth')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
            category === 'growth'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Most Followed</span>
        </button>

        <button
          onClick={() => handleCategoryChange('coins')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
            category === 'coins'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
          <span>Gold Activity</span>
        </button>
      </div>

      {/* Podium for Top 3 */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 pb-2">
          {/* #2 Rank (Silver) */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#0f0f18] border border-slate-400/30 flex flex-col items-center text-center space-y-2 h-[210px] justify-between shadow-xl">
            <div className="relative">
              <img
                src={top3[1].user.avatar}
                alt={top3[1].user.fullName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-800 object-cover ring-2 ring-slate-400"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 text-black text-xs font-black flex items-center justify-center shadow">
                2
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] sm:max-w-[140px]">
                {top3[1].user.fullName}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">@{top3[1].user.username}</div>
            </div>
            <div className="text-xs font-mono font-bold text-slate-300 tabular-nums">
              {top3[1].metricValue.toLocaleString()}
            </div>
          </div>

          {/* #1 Rank (Gold - Tallest) */}
          <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#ffd700]/20 to-[#0f0f18] border border-[#ffd700]/50 flex flex-col items-center text-center space-y-2.5 h-[240px] justify-between shadow-2xl relative">
            <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black text-[10px] font-black uppercase tracking-wider shadow">
              Champion
            </div>
            <div className="relative mt-2">
              <img
                src={top3[0].user.avatar}
                alt={top3[0].user.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800 object-cover ring-4 ring-[#ffd700] shadow-lg shadow-[#ffd700]/20"
              />
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#ffd700] text-black text-sm font-black flex items-center justify-center shadow">
                1
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] sm:max-w-[140px]">
                {top3[0].user.fullName}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">@{top3[0].user.username}</div>
            </div>
            <div className="text-xs sm:text-sm font-mono font-black text-[#ffd700] tabular-nums">
              {top3[0].metricValue.toLocaleString()}
            </div>
          </div>

          {/* #3 Rank (Bronze) */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#0f0f18] border border-amber-700/30 flex flex-col items-center text-center space-y-2 h-[190px] justify-between shadow-xl">
            <div className="relative">
              <img
                src={top3[2].user.avatar}
                alt={top3[2].user.fullName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-800 object-cover ring-2 ring-amber-700"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center shadow">
                3
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] sm:max-w-[140px]">
                {top3[2].user.fullName}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">@{top3[2].user.username}</div>
            </div>
            <div className="text-xs font-mono font-bold text-amber-500 tabular-nums">
              {top3[2].metricValue.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Ranks 4+ List */}
      <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-3 shadow-xl">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">
          Leaderboard Runners-Up
        </div>

        <div className="divide-y divide-white/5">
          {remaining.map((item) => {
            const isFollowing = Storage.isFollowing(item.user.id);
            return (
              <div
                key={item.id}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/5 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-mono font-bold text-zinc-400 text-xs">
                    #{item.rank}
                  </span>

                  <button onClick={() => onViewProfile(item.user.id)}>
                    <img
                      src={item.user.avatar}
                      alt={item.user.fullName}
                      className="w-9 h-9 rounded-full bg-zinc-800 object-cover"
                    />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onViewProfile(item.user.id)}
                        className="text-xs font-bold text-white hover:text-[#ff1493] transition truncate"
                      >
                        {item.user.fullName}
                      </button>
                      {item.user.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#ff1493] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      @{item.user.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-zinc-200 tabular-nums">
                      {item.metricValue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-400">{item.metricLabel}</div>
                  </div>

                  {currentUser?.id !== item.user.id && (
                    <button
                      onClick={() => handleFollowToggle(item.user.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        isFollowing
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
