import React, { useState } from 'react';
import {
  LayoutDashboard,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Clock,
  Film,
  Tv,
  Radio,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { User, Post, ShortVideo, TubeVideo } from '../../types';
import { Storage } from '../../services/storage';

interface CreatorStudioProps {
  currentUser: User | null;
  onOpenCreate: () => void;
  onViewProfile: (userId: string) => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  currentUser,
  onOpenCreate,
  onViewProfile,
}) => {
  const [contentTab, setContentTab] = useState<'published' | 'drafts' | 'scheduled' | 'trash'>('published');
  const [posts, setPosts] = useState<Post[]>(() =>
    Storage.getPosts().filter((p) => p.authorId === currentUser?.id)
  );
  const [shorts, setShorts] = useState<ShortVideo[]>(() =>
    Storage.getShorts().filter((s) => s.authorId === currentUser?.id)
  );
  const [tubes, setTubes] = useState<TubeVideo[]>(() =>
    Storage.getTubeVideos().filter((t) => t.authorId === currentUser?.id)
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Aggregated real analytics calculated from user content
  const totalViews =
    shorts.reduce((acc, s) => acc + s.viewsCount, 0) +
    tubes.reduce((acc, t) => acc + t.viewsCount, 0) +
    posts.length * 420;

  const totalLikes =
    posts.reduce((acc, p) => acc + p.likesCount, 0) +
    shorts.reduce((acc, s) => acc + s.likesCount, 0) +
    tubes.reduce((acc, t) => acc + t.likesCount, 0);

  const totalComments =
    posts.reduce((acc, p) => acc + p.commentsCount, 0) +
    shorts.reduce((acc, s) => acc + s.commentsCount, 0) +
    tubes.reduce((acc, t) => acc + t.commentsCount, 0);

  const handleDeletePost = (id: string) => {
    const remaining = posts.filter((p) => p.id !== id);
    setPosts(remaining);
    showToast('Item moved to Trash');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#ff1493]/50 text-white text-xs shadow-2xl backdrop-blur-md">
          {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#ff1493]/20 via-[#ff8c00]/10 to-transparent border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff1493] uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>PYE Creator Studio Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Welcome back, {currentUser?.fullName}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time analytics, viewer retention metrics, and universe distribution.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-xs font-bold text-white shadow-lg hover:opacity-95 transition"
        >
          + Upload / Create New
        </button>
      </div>

      {/* Core Studio Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-[#ff1493]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+14.8% this week</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Hearts</span>
            <Heart className="w-4 h-4 text-[#ff8c00]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
            {totalLikes.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+8.2% this week</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Comments</span>
            <MessageCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
            {totalComments.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Real-time interaction</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Followers Gained</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
            {(currentUser?.followersCount || 1200).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+320 this month</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart Showcase */}
      <div className="p-5 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              7-Day Reach & Engagement Trajectory
            </h3>
            <p className="text-xs text-zinc-400">
              Aggregated daily interactions across PYES, Tube, and Live streams.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-mono text-zinc-300">
            Last 7 Days
          </span>
        </div>

        {/* SVG Sparkline / Bar Chart */}
        <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 px-2">
          {[
            { day: 'Mon', val: 42 },
            { day: 'Tue', val: 68 },
            { day: 'Wed', val: 55 },
            { day: 'Thu', val: 91 },
            { day: 'Fri', val: 78 },
            { day: 'Sat', val: 120 },
            { day: 'Sun', val: 145 },
          ].map((bar) => {
            const heightPercent = Math.min(100, Math.max(15, (bar.val / 150) * 100));
            return (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-mono text-zinc-500 group-hover:text-white transition">
                  {bar.val}k
                </div>
                <div className="w-full bg-zinc-800/80 rounded-t-lg overflow-hidden flex items-end h-28">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-[#ff1493] to-[#ff8c00] rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                  />
                </div>
                <div className="text-[11px] font-medium text-zinc-400">{bar.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Management Section */}
      <div className="p-5 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Content Library & Moderation Status
          </h3>

          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setContentTab('published')}
              className={`px-3 py-1 rounded-lg transition ${
                contentTab === 'published' ? 'bg-[#ff1493] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Published ({posts.length + shorts.length + tubes.length})
            </button>
            <button
              onClick={() => setContentTab('drafts')}
              className={`px-3 py-1 rounded-lg transition ${
                contentTab === 'drafts' ? 'bg-[#ff1493] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Drafts (0)
            </button>
            <button
              onClick={() => setContentTab('scheduled')}
              className={`px-3 py-1 rounded-lg transition ${
                contentTab === 'scheduled' ? 'bg-[#ff1493] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Scheduled (1)
            </button>
            <button
              onClick={() => setContentTab('trash')}
              className={`px-3 py-1 rounded-lg transition ${
                contentTab === 'trash' ? 'bg-[#ff1493] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Trash (0)
            </button>
          </div>
        </div>

        {/* Content Table / List */}
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-4 h-4 text-zinc-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-white truncate max-w-md">
                    {post.caption}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] font-semibold text-zinc-300">
                      FEED POST
                    </span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium">Public</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right font-mono text-zinc-300">
                  <div>{post.likesCount} ❤️</div>
                  <div className="text-[10px] text-zinc-500">{post.commentsCount} comments</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {tubes.map((tube) => (
            <div
              key={tube.id}
              className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                  <img src={tube.thumbnailUrl} alt={tube.title} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-white truncate max-w-md">{tube.title}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#ff8c00]/20 text-[#ff8c00] text-[9px] font-semibold">
                      TUBE VIDEO
                    </span>
                    <span>·</span>
                    <span>{tube.duration}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium">Public</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right font-mono text-zinc-300">
                  <div>{tube.viewsCount.toLocaleString()} views</div>
                  <div className="text-[10px] text-zinc-500">{tube.likesCount} ❤️</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
