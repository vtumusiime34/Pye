import React, { useState } from 'react';
import { Sparkles, CheckCircle, TrendingUp, Calendar, ChevronRight, Compass, Share2 } from 'lucide-react';
import { User, Conference } from '../../types';
import { PYE_SPACES } from '../../services/storage';

interface RightSidebarProps {
  creators: User[];
  conferences: Conference[];
  onFollowToggle: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  onNavigate: (view: string) => void;
  onSelectHashtag: (tag: string) => void;
  onSelectConference: (conf: Conference) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  creators,
  conferences,
  onFollowToggle,
  isFollowing,
  onNavigate,
  onSelectHashtag,
  onSelectConference,
}) => {
  const [copied, setCopied] = useState(false);

  const spaces = PYE_SPACES;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <aside className="hidden xl:flex flex-col w-80 h-[calc(100vh-4rem)] sticky top-16 border-l border-white/5 bg-[#07070b] p-4 overflow-y-auto space-y-5">
      {/* 1. Pioneers to Follow */}
      <div className="p-4 rounded-3xl bg-[#0f0f18] border border-white/5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF007A]" />
            <span>Pioneers on PYE</span>
          </div>
          <button
            onClick={() => onNavigate('rankings')}
            className="text-[11px] font-semibold text-[#FFA000] hover:underline"
          >
            Rankings
          </button>
        </div>

        {creators.length === 0 ? (
          <div className="py-4 text-center space-y-2">
            <p className="text-xs text-zinc-400">
              The universe is just beginning. Share PYE to welcome your first friends!
            </p>
            <button
              onClick={handleCopyInvite}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 mx-auto transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Universe Link!' : 'Invite Friends'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {creators.slice(0, 4).map((creator) => {
              const following = isFollowing(creator.id);
              return (
                <div key={creator.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={creator.avatar}
                      alt={creator.fullName}
                      className="w-8 h-8 rounded-full bg-zinc-800 object-cover shrink-0 ring-1 ring-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-white truncate">
                          {creator.fullName}
                        </span>
                        {creator.isVerified && (
                          <CheckCircle className="w-3 h-3 text-[#FF007A] shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">@{creator.username}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onFollowToggle(creator.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                      following
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white hover:opacity-95'
                    }`}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PYE Spaces Quick Discovery */}
      <div className="p-4 rounded-3xl bg-[#0f0f18] border border-white/5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#FFA000]" />
            <span>PYE Spaces</span>
          </div>
          <button
            onClick={() => onNavigate('spaces')}
            className="text-[11px] font-semibold text-[#FF007A] hover:underline"
          >
            All Spaces
          </button>
        </div>

        <div className="space-y-2">
          {spaces.slice(0, 5).map((sp) => (
            <button
              key={sp.id}
              onClick={() => onNavigate('spaces')}
              className="w-full flex items-center justify-between text-left p-2 rounded-xl hover:bg-white/5 transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{sp.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-[#FF007A] transition">
                    {sp.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 capitalize">{sp.category}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Upcoming Conference Stage Preview */}
      {conferences.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/30 to-[#0f0f18] border border-purple-500/20 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Upcoming Summit</span>
          </div>

          <div
            onClick={() => onSelectConference(conferences[0])}
            className="cursor-pointer group space-y-2"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-800">
              <img
                src={conferences[0].coverImage}
                alt={conferences[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-medium text-white">
                {conferences[0].scheduledDate} · {conferences[0].scheduledTime}
              </div>
            </div>

            <h4 className="text-xs font-bold text-white group-hover:text-[#FF007A] transition line-clamp-2">
              {conferences[0].title}
            </h4>
          </div>

          <button
            onClick={() => onNavigate('conferences')}
            className="w-full mt-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-bold text-purple-200 transition"
          >
            View Summit Stage
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-[11px] text-zinc-400 space-y-1.5 px-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <span className="hover:text-zinc-300 cursor-pointer">About PYE</span>
          <span>·</span>
          <span className="hover:text-zinc-300 cursor-pointer">Safety</span>
          <span>·</span>
          <span className="hover:text-zinc-300 cursor-pointer">Terms</span>
          <span>·</span>
          <span className="hover:text-zinc-300 cursor-pointer">Privacy</span>
        </div>
        <div>PYE Social Universe © 2026. Real connections, zero fake metrics.</div>
      </div>
    </aside>
  );
};
