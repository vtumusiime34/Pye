import React, { useState } from 'react';
import { Compass, Sparkles, Plus, CheckCircle, Heart, MessageCircle, Share2 } from 'lucide-react';
import { PyeSpace, Post, User } from '../../types';
import { Storage, PYE_SPACES } from '../../services/storage';

interface PyeSpacesViewProps {
  currentUser: User | null;
  onOpenCreate: () => void;
  onOpenAuth: () => void;
  onViewProfile: (userId: string) => void;
  onReportItem: (itemId: string, itemType: string, title?: string) => void;
  onOpenTipModal: (targetUserId: string, targetName: string) => void;
}

export const PyeSpacesView: React.FC<PyeSpacesViewProps> = ({
  currentUser,
  onOpenCreate,
  onOpenAuth,
  onViewProfile,
  onReportItem,
  onOpenTipModal,
}) => {
  const [selectedSpaceSlug, setSelectedSpaceSlug] = useState<string>('all');
  const [posts, setPosts] = useState<Post[]>(() => Storage.getPosts());

  const spaces = PYE_SPACES;

  const handleLike = (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const res = Storage.toggleLike(postId, 'post');
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiked: res.isLiked, likesCount: res.likesCount } : p
      )
    );
  };

  const filteredPosts =
    selectedSpaceSlug === 'all'
      ? posts
      : posts.filter((p) => p.spaceSlug === selectedSpaceSlug);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FF007A]/20 via-[#FF5500]/10 to-transparent border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF007A] uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>PYE Themed Spaces</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-display">
          Discover Themed Knowledge Realms
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          Spaces are focused communities where creators, scientists, developers, and artists broadcast their pulses.
        </p>
      </div>

      {/* Spaces Grid Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <button
          onClick={() => setSelectedSpaceSlug('all')}
          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
            selectedSpaceSlug === 'all'
              ? 'bg-gradient-to-br from-[#FF007A] to-[#FF6A00] text-white font-bold border-transparent shadow-lg shadow-[#FF007A]/20'
              : 'bg-[#0f0f18] text-zinc-300 border-white/5 hover:border-white/20'
          }`}
        >
          <span className="text-lg">🌌</span>
          <span className="text-xs truncate w-full">All Spaces</span>
        </button>

        {spaces.map((space) => {
          const isSelected = selectedSpaceSlug === space.slug;
          return (
            <button
              key={space.id}
              onClick={() => setSelectedSpaceSlug(space.slug)}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#FF007A] to-[#FF6A00] text-white font-bold border-transparent shadow-lg shadow-[#FF007A]/20'
                  : 'bg-[#0f0f18] text-zinc-300 border-white/5 hover:border-white/20'
              }`}
            >
              <span className="text-lg">{space.icon}</span>
              <span className="text-xs truncate w-full">{space.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Space Spotlight if specific space selected */}
      {selectedSpaceSlug !== 'all' && (
        (() => {
          const currentSpace = spaces.find((s) => s.slug === selectedSpaceSlug);
          if (!currentSpace) return null;
          return (
            <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left z-10">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-2xl">{currentSpace.icon}</span>
                  <h2 className="text-lg font-bold text-white">{currentSpace.name} Space</h2>
                </div>
                <p className="text-xs text-zinc-300 max-w-lg">{currentSpace.description}</p>
              </div>

              <button
                onClick={onOpenCreate}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold shadow-lg shrink-0 flex items-center gap-1.5 z-10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post in {currentSpace.name.split(' ')[0]}</span>
              </button>
            </div>
          );
        })()
      )}

      {/* Space Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0f0f18] border border-white/5 space-y-3">
            <Sparkles className="w-8 h-8 text-[#FF007A] mx-auto" />
            <h3 className="text-sm font-bold text-white">No pulses in this Space yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Be the first pioneer to broadcast in this Space! Real posts by real creators appear here.
            </p>
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold shadow"
            >
              Share First Pulse
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => onViewProfile(post.authorId)}>
                    <img
                      src={post.author.avatar}
                      alt={post.author.fullName}
                      className="w-10 h-10 rounded-full bg-zinc-800 object-cover ring-2 ring-[#FF007A]/40"
                    />
                  </button>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onViewProfile(post.authorId)}
                        className="text-xs font-bold text-white hover:text-[#FF007A] transition"
                      >
                        {post.author.fullName}
                      </button>
                      {post.author.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#FF007A] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">@{post.author.username}</div>
                  </div>
                </div>

                {post.spaceSlug && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-[#FFA000] uppercase tracking-wider border border-white/5">
                    {post.spaceSlug}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {post.caption}
              </p>

              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden bg-black border border-white/5 max-h-96">
                  <img
                    src={post.mediaUrl}
                    alt="Media"
                    className="w-full h-auto object-cover max-h-96"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 transition ${
                    post.isLiked ? 'text-[#FF007A]' : 'hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#FF007A]' : ''}`} />
                  <span className="font-mono tabular-nums">{post.likesCount}</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="font-mono">{post.commentsCount} comments</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
