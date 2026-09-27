import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle,
  Sparkles,
  Send,
  Trash2,
  AlertTriangle,
  Gift,
  Image,
  Activity,
  Compass,
} from 'lucide-react';
import { Post, User, Comment } from '../../types';
import { Storage } from '../../services/storage';

interface HomeFeedProps {
  currentUser: User | null;
  onOpenCreate: () => void;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
  onReportItem: (itemId: string, itemType: string, title?: string) => void;
  onOpenTipModal: (targetUserId: string, targetName: string) => void;
  onViewProfile: (userId: string) => void;
  onSelectSpace?: (slug: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  currentUser,
  onOpenCreate,
  onOpenAuth,
  onReportItem,
  onOpenTipModal,
  onViewProfile,
  onSelectSpace,
}) => {
  const [feedTab, setFeedTab] = useState<'universe' | 'pulse' | 'following'>('universe');
  const [posts, setPosts] = useState<Post[]>(() => Storage.getPosts());
  
  // Comment drawer/inline state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});

  // Quick post inline state
  const [quickPostText, setQuickPostText] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLike = (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const res = Storage.toggleLike(postId, 'post');
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isLiked: res.isLiked, likesCount: res.likesCount } : p))
    );
  };

  const handleSave = (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const isSaved = Storage.togglePostSave(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved } : p))
    );
    showToast(isSaved ? 'Pulse saved to your vault' : 'Pulse removed from saved');
  };

  const handleFollowToggle = (authorId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const isNow = Storage.toggleFollow(authorId);
    setPosts(Storage.getPosts());
    showToast(isNow ? 'Followed creator!' : 'Unfollowed.');
  };

  const handleShare = async (post: Post) => {
    const shareUrl = `${window.location.origin}/#pulse-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PYE Universe: Pulse by @${post.author.username}`,
          text: post.caption,
          url: shareUrl,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(shareUrl);
    showToast('Pulse link copied to clipboard!');
  };

  const toggleComments = (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      if (!commentsMap[postId]) {
        const list = Storage.getComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: list }));
      }
    }
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim()) return;

    const newCmt = Storage.addComment(postId, commentText, 'post');
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [newCmt, ...(prev[postId] || [])],
    }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
    setCommentText('');
    showToast('Comment posted');
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    Storage.deleteComment(commentId);
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
      )
    );
    showToast('Comment deleted');
  };

  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!quickPostText.trim()) return;

    const created = Storage.addPost({
      authorId: currentUser.id,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        fullName: currentUser.fullName,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      caption: quickPostText.trim(),
      hashtags: ['PYEUniverse'],
      spaceSlug: 'future',
    });

    setPosts([created, ...posts]);
    setQuickPostText('');
    showToast('Pulse broadcasted to PYE Universe!');
  };

  // Filter posts based on real relationships
  const filteredPosts = posts.filter((post) => {
    if (feedTab === 'following') {
      if (!currentUser) return false;
      return Storage.isFollowing(post.authorId) || post.authorId === currentUser.id;
    }
    if (feedTab === 'pulse') {
      // PYE Pulse: Sort by engagement & freshness
      return true;
    }
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-20">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#FF007A]/60 text-white text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Guest Welcome & Onboarding Banner */}
      {!currentUser && (
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#FF007A]/15 via-[#FF5500]/10 to-[#FFA000]/15 border border-[#FF007A]/30 shadow-2xl backdrop-blur-md">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF007A]/20 border border-[#FF007A]/40 text-[#FFA000] text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                Join the Universe
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Ready to experience PYE Social Universe?
              </h3>
              <p className="text-xs text-zinc-300 max-w-md mt-1">
                Create an account in 15 seconds. Enjoy vertical reels, send real coin tips, and publish your own pulses with zero fake bots.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-xs font-bold text-white shadow-lg shadow-[#FF007A]/25 hover:scale-105 active:scale-95 transition"
              >
                Create Account
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white transition"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Tabs: PYE Universe / PYE Pulse / Following */}
      <div className="p-1 bg-[#0f0f18] rounded-2xl border border-white/5 flex items-center gap-1">
        <button
          onClick={() => setFeedTab('universe')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            feedTab === 'universe'
              ? 'bg-gradient-to-r from-[#FF007A] to-[#FF6A00] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universe</span>
        </button>

        <button
          onClick={() => setFeedTab('pulse')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            feedTab === 'pulse'
              ? 'bg-gradient-to-r from-[#FF007A] to-[#FF6A00] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>PYE Pulse</span>
        </button>

        <button
          onClick={() => setFeedTab('following')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            feedTab === 'following'
              ? 'bg-gradient-to-r from-[#FF007A] to-[#FF6A00] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>Following</span>
        </button>
      </div>

      {/* Quick Broadcast Pulse Box */}
      <div className="p-4 rounded-3xl bg-[#0f0f18] border border-white/5 shadow-xl">
        <form onSubmit={handleQuickPostSubmit} className="space-y-3">
          <div className="flex gap-3">
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest'}
              alt="Avatar"
              className="w-10 h-10 rounded-full bg-zinc-800 object-cover shrink-0 ring-2 ring-[#FF007A]/40"
            />
            <div className="flex-1">
              <textarea
                value={quickPostText}
                onChange={(e) => setQuickPostText(e.target.value)}
                placeholder={
                  currentUser
                    ? `What are you building or discovering today, ${currentUser.fullName.split(' ')[0]}?`
                    : 'Sign in to broadcast your ideas across PYE...'
                }
                rows={2}
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={currentUser ? onOpenCreate : () => onOpenAuth('signup')}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#FFA000] transition"
            >
              <Image className="w-4 h-4 text-[#FF007A]" />
              <span>Add Media / PYES / Video</span>
            </button>

            <button
              type="submit"
              disabled={!quickPostText.trim()}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition shadow-md shadow-[#FF007A]/20"
            >
              Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* Real Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0f0f18] border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 mx-auto flex items-center justify-center text-[#FF007A]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {feedTab === 'following'
              ? 'Your Following feed is clean'
              : 'Your PYE Universe is just beginning'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {feedTab === 'following'
              ? 'Follow creators across spaces to build your personal stream, or explore the Universe tab.'
              : 'No fake activity or bots here. Be one of the first creators to share a pulse!'}
          </p>
          <button
            onClick={currentUser ? onOpenCreate : () => onOpenAuth('signup')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-xs font-bold text-white shadow-lg"
          >
            {currentUser ? 'Share First Pulse' : 'Join PYE Universe'}
          </button>
        </div>
      ) : (
        filteredPosts.map((post) => {
          const isFollowingAuthor = Storage.isFollowing(post.authorId);
          const isOwnPost = currentUser?.id === post.authorId;
          const comments = commentsMap[post.id] || [];

          return (
            <article
              key={post.id}
              className="p-5 rounded-3xl bg-[#0f0f18] border border-white/5 shadow-xl space-y-3.5 transition hover:border-white/10"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onViewProfile(post.authorId)}
                    className="focus:outline-none"
                  >
                    <img
                      src={post.author.avatar}
                      alt={post.author.fullName}
                      className="w-10 h-10 rounded-full bg-zinc-800 object-cover ring-2 ring-[#FF007A]/40"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onViewProfile(post.authorId)}
                        className="text-xs sm:text-sm font-bold text-white hover:text-[#FF007A] transition text-left"
                      >
                        {post.author.fullName}
                      </button>
                      {post.author.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#FF007A] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <span>@{post.author.username}</span>
                      <span>·</span>
                      <time className="text-[10px] text-zinc-500 font-mono">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.spaceSlug && (
                    <button
                      onClick={() => onSelectSpace && onSelectSpace(post.spaceSlug!)}
                      className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-[#FFA000] uppercase tracking-wider"
                    >
                      {post.spaceSlug}
                    </button>
                  )}

                  {!isOwnPost && (
                    <button
                      onClick={() => handleFollowToggle(post.authorId)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        isFollowingAuthor
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white shadow-sm'
                      }`}
                    >
                      {isFollowingAuthor ? 'Following' : '+ Follow'}
                    </button>
                  )}

                  <button
                    onClick={() => onReportItem(post.id, 'post', post.caption.slice(0, 30))}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition"
                    title="Report"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Post Caption */}
              <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {post.caption}
              </div>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold text-[#FFA000] hover:underline cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Media */}
              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden bg-black border border-white/5 max-h-[460px]">
                  {post.mediaType === 'video' ? (
                    <video
                      src={post.mediaUrl}
                      controls
                      className="w-full h-auto max-h-[460px] object-cover"
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt="Post visual"
                      className="w-full h-auto max-h-[460px] object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              )}

              {/* Post Actions Bar with REAL numbers */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition group ${
                      post.isLiked ? 'text-[#FF007A]' : 'hover:text-[#FF007A]'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition group-active:scale-125 ${
                        post.isLiked ? 'fill-[#FF007A] text-[#FF007A]' : ''
                      }`}
                    />
                    <span className="tabular-nums font-mono font-semibold">{post.likesCount}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 hover:text-white transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="tabular-nums font-mono font-semibold">{post.commentsCount}</span>
                  </button>

                  {/* Tip Creator */}
                  {!isOwnPost && (
                    <button
                      onClick={() => onOpenTipModal(post.authorId, post.author.fullName)}
                      className="flex items-center gap-1 hover:text-[#FFA000] text-amber-400/90 transition"
                      title="Send PYE Coins to Creator"
                    >
                      <Gift className="w-4 h-4" />
                      <span className="hidden sm:inline">Tip</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare(post)}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition"
                    title="Share pulse"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSave(post.id)}
                    className={`p-1.5 rounded-lg transition ${
                      post.isSaved
                        ? 'text-[#FFA000]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Save pulse"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${post.isSaved ? 'fill-[#FFA000]' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* Comments Section Drawer */}
              {activeCommentPostId === post.id && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-in fade-in duration-200">
                  <form
                    onSubmit={(e) => handleAddComment(post.id, e)}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts on this pulse..."
                      className="flex-1 py-2 px-3.5 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="p-2 px-3 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold disabled:opacity-40 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <div className="text-center text-[11px] text-zinc-500 py-4">
                        No comments yet on this pulse.
                      </div>
                    ) : (
                      comments.map((cmt) => (
                        <div
                          key={cmt.id}
                          className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start justify-between gap-2"
                        >
                          <div className="flex items-start gap-2.5">
                            <img
                              src={cmt.author.avatar}
                              alt={cmt.author.fullName}
                              className="w-6 h-6 rounded-full bg-zinc-800 object-cover mt-0.5"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">
                                  {cmt.author.fullName}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  @{cmt.author.username}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
                                {cmt.text}
                              </p>
                            </div>
                          </div>

                          {currentUser && cmt.author.id === currentUser.id && (
                            <button
                              onClick={() => handleDeleteComment(post.id, cmt.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
};
