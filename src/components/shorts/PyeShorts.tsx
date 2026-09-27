import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Gift,
  MoreVertical,
  Send,
  X,
  Plus,
  Sparkles,
  Music,
  Repeat,
  Gauge,
  Flame,
  Search,
  RotateCw,
  Trash2,
  AlertCircle,
  ThumbsUp,
  Compass,
  Users,
} from 'lucide-react';
import { PyesVideo, User, Comment } from '../../types';
import { Storage } from '../../services/storage';
import { CreatePyesModal } from './CreatePyesModal';
import { PyesShareModal } from './PyesShareModal';

interface PyeShortsProps {
  currentUser: User | null;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
  onOpenTipModal: (targetUserId: string, targetName: string) => void;
  onReportItem: (itemId: string, itemType: string, title?: string) => void;
  onViewProfile: (userId: string) => void;
  onOpenCreate?: () => void;
}

export type PyesFeedFilter = 'foryou' | 'following' | 'discover';

export const PyeShorts: React.FC<PyeShortsProps> = ({
  currentUser,
  onOpenAuth,
  onOpenTipModal,
  onReportItem,
  onViewProfile,
  onOpenCreate,
}) => {
  // Feed state
  const [feedFilter, setFeedFilter] = useState<PyesFeedFilter>('foryou');
  const [pyesList, setPyesList] = useState<PyesVideo[]>(() => Storage.getPyes('foryou'));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);

  // Modals & Drawers
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  // UI state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [heartCoordinates, setHeartCoordinates] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Refs
  const lastTapRef = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const lastWheelTime = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoPreloadRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPyes = pyesList[currentIndex];
  const nextPyes = pyesList[currentIndex + 1];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Reload feed based on active filter
  const refreshFeed = useCallback(
    (filter: PyesFeedFilter = feedFilter) => {
      const items = Storage.getPyes(filter);
      setPyesList(items);
      if (currentIndex >= items.length) {
        setCurrentIndex(Math.max(0, items.length - 1));
      }
    },
    [feedFilter, currentIndex]
  );

  useEffect(() => {
    const items = Storage.getPyes(feedFilter);
    setPyesList(items);
    setCurrentIndex(0);
  }, [feedFilter]);

  // Load comments for current video
  const loadComments = useCallback((targetId: string) => {
    setComments(Storage.getComments(targetId));
  }, []);

  // Update playback when current PYES changes
  useEffect(() => {
    if (currentPyes) {
      loadComments(currentPyes.id);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setHasVideoError(false);
      setIsLoadingVideo(true);
      setCaptionExpanded(false);

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoadingVideo(false);
          })
          .catch(() => {
            // If browser blocks unmuted autoplay, mute and try again
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current
                .play()
                .then(() => {
                  setIsPlaying(true);
                  setIsLoadingVideo(false);
                })
                .catch(() => {
                  setIsPlaying(false);
                  setIsLoadingVideo(false);
                });
            }
          });
      }
    }
  }, [currentIndex, currentPyes, loadComments, playbackSpeed]);

  // Fallback Canvas Animation when video cannot load
  useEffect(() => {
    if (!hasVideoError || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.fillStyle = '#06060c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing PYE cyber gradient background
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        20,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8
      );
      grad.addColorStop(0, 'rgba(255, 0, 122, 0.25)');
      grad.addColorStop(0.5, 'rgba(255, 85, 0, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Concentric soundwave pulses
      const numWaves = 4;
      for (let i = 0; i < numWaves; i++) {
        const radius = ((tick * 1.5 + i * 80) % 360) + 20;
        const alpha = Math.max(0, 1 - radius / 380);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 160, 0, ${alpha * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Center glowing PYES emblem
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 15, 24, 0.9)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FF007A';
      ctx.shadowColor = '#FF007A';
      ctx.shadowBlur = 18;
      ctx.stroke();

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PYES', 0, 0);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [hasVideoError]);

  // Handle video progress updates
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress((cur / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsLoadingVideo(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < pyesList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      showToast('You reached the latest PYES transmission! 🚀');
    }
  }, [currentIndex, pyesList.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleVideoEnded = () => {
    if (autoAdvance && currentIndex < pyesList.length - 1) {
      handleNext();
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.key === 'l' && currentPyes) {
        e.preventDefault();
        handleLike();
      } else if (e.key === 'c') {
        e.preventDefault();
        setShowComments((prev) => !prev);
      } else if (e.key === 's' && currentPyes) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isPlaying, currentPyes]);

  // Touch Swipe for Mobile (Vertical Swipe Up / Down)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }
    touchStartY.current = null;
  };

  // Mouse wheel scroll with debounce
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 650) return;

    if (e.deltaY > 35) {
      lastWheelTime.current = now;
      handleNext();
    } else if (e.deltaY < -35) {
      lastWheelTime.current = now;
      handlePrev();
    }
  };

  // Container tap / Double tap for Like
  const handleContainerClick = (e: React.MouseEvent<HTMLElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (now - lastTapRef.current < 300) {
      // Double Tap: Trigger Like Burst
      setHeartCoordinates({ x, y });
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 900);

      if (currentPyes && !currentPyes.isLiked) {
        handleLike();
      }
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  };

  // Interactive timeline scrubber
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  // Speed cycle: 1x -> 1.25x -> 1.5x -> 2x -> 0.75x -> 1x
  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    showToast(`Speed: ${nextSpeed}x`);
  };

  // Real Database Likes
  const handleLike = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!currentPyes) return;

    const res = Storage.toggleLike(currentPyes.id, 'pyes');
    setPyesList((prev) =>
      prev.map((item) =>
        item.id === currentPyes.id
          ? { ...item, isLiked: res.isLiked, likesCount: res.likesCount }
          : item
      )
    );
  };

  // Real Database Saves / Bookmarks
  const handleSave = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!currentPyes) return;

    const saved = Storage.togglePyesSave(currentPyes.id);
    setPyesList((prev) =>
      prev.map((item) =>
        item.id === currentPyes.id ? { ...item, isSaved: saved } : item
      )
    );
    showToast(saved ? 'Saved to your PYES Vault' : 'Removed from Vault');
  };

  // Real Follow System
  const isFollowingAuthor = currentUser && currentPyes
    ? Storage.isFollowing(currentPyes.authorId)
    : false;

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!currentPyes || currentUser.id === currentPyes.authorId) return;

    const nowFollowing = Storage.toggleFollow(currentPyes.authorId);
    showToast(nowFollowing ? `Following @${currentPyes.author.username}` : `Unfollowed @${currentPyes.author.username}`);
  };

  // Real Comments Handlers
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!currentPyes || !commentText.trim()) return;

    try {
      const newComment = Storage.addComment(currentPyes.id, commentText.trim(), 'pyes');
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');

      setPyesList((prev) =>
        prev.map((item) =>
          item.id === currentPyes.id
            ? { ...item, commentsCount: item.commentsCount + 1 }
            : item
        )
      );
      showToast('Comment posted to PYES!');
    } catch (err: any) {
      showToast(err?.message || 'Could not post comment.');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Storage.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (currentPyes) {
      setPyesList((prev) =>
        prev.map((item) =>
          item.id === currentPyes.id
            ? { ...item, commentsCount: Math.max(0, item.commentsCount - 1) }
            : item
        )
      );
    }
    showToast('Comment deleted.');
  };

  const handleLikeComment = (commentId: string) => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    const res = Storage.toggleLike(commentId, 'comment');
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, isLiked: res.isLiked, likesCount: res.likesCount } : c
      )
    );
  };

  // Creation Success Callback
  const handlePyesCreated = (newVideo: PyesVideo) => {
    setPyesList((prev) => [newVideo, ...prev]);
    setCurrentIndex(0);
    showToast('Your PYES is now broadcasting live!');
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-[calc(100dvh-4rem-4rem)] lg:h-[calc(100vh-5rem)] max-h-[860px] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-4 z-50 px-4 py-2 rounded-full bg-black/90 border border-[#FF007A]/40 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#FFA000]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Theatre Wrapper (Responsive for Mobile, Tablet, PC) */}
      <div className="relative flex items-center justify-center gap-4 sm:gap-6 w-full h-full">
        {/* Ambient Backlight Glow Matching PYE Gradient */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-[#FF007A]/25 via-[#FF5500]/15 to-[#FFA000]/20 rounded-[44px] blur-3xl -z-10 opacity-70 pointer-events-none transition-all duration-700" />

        {/* Vertical Reel Phone Frame */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-[420px] h-full rounded-2xl sm:rounded-[32px] overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col justify-between"
        >
          {/* Preload subsequent video quietly in background for instantaneous transitions */}
          {nextPyes && (
            <video
              ref={nextVideoPreloadRef}
              src={nextPyes.videoUrl}
              preload="auto"
              className="hidden"
            />
          )}

          {/* STATE: NO CONTENT IN FEED */}
          {pyesList.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30 bg-black/90 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000] p-1 flex items-center justify-center shadow-2xl">
                <div className="w-full h-full bg-[#0b0b14] rounded-[22px] flex items-center justify-center">
                  <Flame className="w-8 h-8 text-[#FFA000]" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  PYES is waiting for your next discovery.
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  {feedFilter === 'following'
                    ? 'No videos from creators you follow yet. Discover trending creators or broadcast your own!'
                    : 'Be the pioneer to publish the first vertical transmission on PYES.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {feedFilter === 'following' && (
                  <button
                    onClick={() => setFeedFilter('foryou')}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition"
                  >
                    Switch to For You
                  </button>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold shadow-lg shadow-[#FF007A]/30 hover:opacity-95 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>CREATE PYES</span>
                </button>
              </div>
            </div>
          ) : hasVideoError ? (
            /* STATE: ERROR with procedural fallback visualizer + Retry */
            <div className="relative w-full h-full">
              <canvas
                ref={canvasRef}
                width={420}
                height={760}
                onClick={handleContainerClick}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              />
              <div className="absolute top-20 inset-x-4 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-center space-y-2 z-20">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-300">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Something went wrong loading this transmission.</span>
                </div>
                <button
                  onClick={() => {
                    setHasVideoError(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-[11px] font-bold shadow hover:opacity-95 transition inline-flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Transmission</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE: HTML5 VIDEO ELEMENT */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={currentPyes.videoUrl}
                poster={currentPyes.posterUrl}
                loop={!autoAdvance}
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onError={() => setHasVideoError(true)}
                onWaiting={() => setIsLoadingVideo(true)}
                onPlaying={() => setIsLoadingVideo(false)}
                onClick={handleContainerClick}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              />

              {/* STATE: LOADING SPINNER */}
              {isLoadingVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none z-20">
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[#FF007A] animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 font-mono">
                      PYES LOADING
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Double Tap Heart Burst Animation */}
          {heartBurst && (
            <div
              style={{ left: `${heartCoordinates.x}%`, top: `${heartCoordinates.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping duration-700"
            >
              <div className="relative text-[#FF007A] drop-shadow-2xl">
                <Heart className="w-24 h-24 fill-[#FF007A] stroke-white stroke-2" />
                <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-[#FFA000] animate-spin" />
              </div>
            </div>
          )}

          {/* STATE: PAUSED Holographic Play Overlay */}
          {!isPlaying && pyesList.length > 0 && !hasVideoError && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-20"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition">
                <Play className="w-8 h-8 ml-1 fill-white" />
              </div>
            </div>
          )}

          {/* TOP AREA: Clean, Futuristic, Responsive HUD */}
          <div className="relative z-30 p-3 sm:p-4 pt-3 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            {/* PYES Logo Badge & Navigation Segment */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#FF007A] animate-pulse" />
                <span className="text-xs font-black tracking-widest text-white font-display">
                  PYES
                </span>
              </div>

              {/* Feed Mode Selector: FOR YOU · FOLLOWING · DISCOVER */}
              <div className="flex items-center bg-black/50 backdrop-blur-md rounded-full p-0.5 border border-white/10 text-[10px] font-bold">
                <button
                  onClick={() => setFeedFilter('foryou')}
                  className={`px-2.5 py-1 rounded-full transition ${
                    feedFilter === 'foryou'
                      ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  For You
                </button>
                <button
                  onClick={() => setFeedFilter('following')}
                  className={`px-2.5 py-1 rounded-full transition ${
                    feedFilter === 'following'
                      ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Following
                </button>
                <button
                  onClick={() => setFeedFilter('discover')}
                  className={`hidden xs:inline-block px-2 py-1 rounded-full transition ${
                    feedFilter === 'discover'
                      ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Discover
                </button>
              </div>
            </div>

            {/* Top Right Utilities: Auto-advance, Speed, Audio, CREATE PYES */}
            <div className="flex items-center gap-1.5">
              {/* Loop / Auto Advance Toggle */}
              <button
                onClick={() => {
                  setAutoAdvance(!autoAdvance);
                  showToast(autoAdvance ? 'Loop current PYES' : 'Auto-advance to next PYES');
                }}
                className={`p-1.5 rounded-full border transition ${
                  autoAdvance
                    ? 'bg-[#FF007A]/25 border-[#FF007A]/60 text-white'
                    : 'bg-black/60 border-white/10 text-zinc-400'
                }`}
                title={autoAdvance ? 'Auto-play next PYES: ON' : 'Loop PYES: ON'}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              {/* Speed Controller */}
              <button
                onClick={cycleSpeed}
                className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:border-[#FFA000]/60 text-[10px] font-mono font-bold transition flex items-center gap-1"
                title="Playback Speed"
              >
                <Gauge className="w-3 h-3 text-[#FFA000]" />
                <span>{playbackSpeed}x</span>
              </button>

              {/* Mute / Unmute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full backdrop-blur-md text-white border transition ${
                  isMuted
                    ? 'bg-black/70 border-white/10 hover:border-white/30 text-zinc-400'
                    : 'bg-[#FF007A]/30 border-[#FF007A]/60 text-[#FFA000] shadow-lg shadow-[#FF007A]/20'
                }`}
                title={isMuted ? 'Click to Unmute (M)' : 'Click to Mute (M)'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* CREATE PYES Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-white text-[10px] font-bold shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1"
                title="Create PYES"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">CREATE</span>
              </button>
            </div>
          </div>

          {/* BOTTOM AREA: Creator Info, Safe Captions, Audio Ticker, Timeline */}
          {currentPyes && (
            <div className="relative z-30 p-3 sm:p-4 pb-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-2">
              {/* Creator Row with Working Real Follow Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => onViewProfile(currentPyes.authorId)}
                    className="relative group text-left flex items-center gap-2 shrink-0"
                  >
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000]">
                      <img
                        src={currentPyes.author.avatar}
                        alt={currentPyes.author.fullName}
                        className="w-9 h-9 rounded-full bg-zinc-900 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white group-hover:text-[#FFA000] transition truncate max-w-[120px]">
                          {currentPyes.author.fullName}
                        </span>
                        {currentPyes.author.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#FF007A] shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[110px]">
                        @{currentPyes.author.username}
                      </div>
                    </div>
                  </button>

                  {/* Real Follow Button Beside Creator Name */}
                  {currentUser?.id !== currentPyes.authorId && (
                    <button
                      onClick={handleFollow}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition shadow shrink-0 ${
                        isFollowingAuthor
                          ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
                          : 'bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-white hover:opacity-95 active:scale-95'
                      }`}
                    >
                      {isFollowingAuthor ? 'Following' : '+ Follow'}
                    </button>
                  )}
                </div>

                {/* Rotating Cyber Audio Disc */}
                <div
                  onClick={() => showToast(`Audio stem: ${currentPyes.musicTitle || 'Original PYES Stem'}`)}
                  className="relative cursor-pointer shrink-0"
                  title="Audio Stem Details"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-900 to-black border border-white/20 p-1 flex items-center justify-center animate-spin-slow shadow-lg">
                    <img
                      src={currentPyes.author.avatar}
                      alt=""
                      className="w-3.5 h-3.5 rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 text-[9px] animate-bounce text-[#FFA000]">
                    <Music className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

              {/* Title & Caption in Dedicated Safe Area (Restricted max-width to never overlap right buttons) */}
              <div className="max-w-[calc(100%-68px)] space-y-1">
                {currentPyes.title && (
                  <h4 className="text-xs font-bold text-white truncate drop-shadow">
                    {currentPyes.title}
                  </h4>
                )}
                <p
                  onClick={() => setCaptionExpanded(!captionExpanded)}
                  className={`text-xs text-zinc-200 leading-relaxed cursor-pointer drop-shadow ${
                    captionExpanded ? 'max-h-24 overflow-y-auto pr-1' : 'line-clamp-2'
                  }`}
                >
                  {currentPyes.caption}
                  {currentPyes.caption.length > 70 && (
                    <span className="text-[#FFA000] font-semibold ml-1">
                      {captionExpanded ? ' less' : ' ...more'}
                    </span>
                  )}
                </p>

                {/* Hashtags */}
                {currentPyes.hashtags && currentPyes.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {currentPyes.hashtags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => showToast(`Hashtag: #${tag}`)}
                        className="text-[11px] font-semibold text-[#FFA000] hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Audio Stem Ticker & Timestamps */}
              <div className="flex items-center justify-between text-[10px] text-zinc-300 max-w-[calc(100%-68px)] pt-0.5">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Music className="w-3 h-3 text-[#FF007A] shrink-0" />
                  <span className="truncate text-zinc-300 font-mono">
                    {currentPyes.musicTitle || 'Original PYES Stem'}
                  </span>
                </div>
                <span className="font-mono text-zinc-400 tabular-nums shrink-0 ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Interactive Timeline Progress Scrubber */}
              <div
                onClick={handleScrub}
                className="w-full h-2 group/scrub py-0.5 cursor-pointer relative flex items-center"
                title="Click or drag to seek"
              >
                <div className="w-full h-1 group-hover/scrub:h-1.5 bg-white/20 rounded-full overflow-hidden transition-all">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000]"
                  />
                </div>
                <div
                  style={{ left: `${progress}%` }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-md -translate-x-1/2 opacity-0 group-hover/scrub:opacity-100 transition-opacity"
                />
              </div>
            </div>
          )}

          {/* RIGHT-SIDE ACTION AREA: Vertical Action Column (Never Collides) */}
          {currentPyes && (
            <div className="absolute right-2 sm:right-3 bottom-14 sm:bottom-16 flex flex-col items-center gap-2.5 sm:gap-3.5 z-30 w-11 sm:w-12">
              {/* Creator Profile Button */}
              <button
                onClick={() => onViewProfile(currentPyes.authorId)}
                className="relative group focus:outline-none flex flex-col items-center"
                title={`View ${currentPyes.author.fullName}'s profile`}
              >
                <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#FF007A] to-[#FFA000] shadow-lg">
                  <img
                    src={currentPyes.author.avatar}
                    alt={currentPyes.author.fullName}
                    className="w-full h-full rounded-full object-cover bg-zinc-800"
                  />
                </div>
              </button>

              {/* 1. LIKE Action */}
              <button
                onClick={handleLike}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Like PYES (L)"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition active:scale-90 ${
                    currentPyes.isLiked
                      ? 'bg-[#FF007A] text-white border-[#FF007A] shadow-lg shadow-[#FF007A]/50 scale-105'
                      : 'bg-black/50 text-white border-white/10 group-hover:bg-white/10 group-hover:scale-105'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform ${
                      currentPyes.isLiked ? 'fill-white scale-110' : ''
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow font-mono tabular-nums leading-none">
                  {currentPyes.likesCount}
                </span>
              </button>

              {/* 2. COMMENT Action */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Comments (C)"
              >
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-white/10 group-hover:scale-105 transition active:scale-90">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow font-mono tabular-nums leading-none">
                  {currentPyes.commentsCount}
                </span>
              </button>

              {/* 3. SAVE Action */}
              <button
                onClick={handleSave}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Save to PYES Vault (S)"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition active:scale-90 ${
                    currentPyes.isSaved
                      ? 'bg-[#FFA000] text-black border-[#FFA000] shadow-lg shadow-[#FFA000]/40 scale-105'
                      : 'bg-black/50 text-white border-white/10 group-hover:bg-white/10 group-hover:scale-105'
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${currentPyes.isSaved ? 'fill-black' : ''}`}
                  />
                </div>
                <span className="text-[9px] font-semibold text-white drop-shadow leading-none">
                  Save
                </span>
              </button>

              {/* 4. TIP CREATOR Action */}
              <button
                onClick={() => onOpenTipModal(currentPyes.authorId, currentPyes.author.fullName)}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Send PYE Coin Tip"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 flex items-center justify-center text-[#FFA000] group-hover:scale-110 active:scale-90 transition shadow-lg shadow-amber-500/10">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-semibold text-amber-300 drop-shadow leading-none">
                  Tip
                </span>
              </button>

              {/* 5. SHARE Action */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Share PYES"
              >
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-white/10 group-hover:scale-105 active:scale-90 transition">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-semibold text-white drop-shadow leading-none">
                  Share
                </span>
              </button>

              {/* 6. MORE / OPTIONS Action */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
                  title="More Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showOptionsMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 bottom-10 w-44 bg-[#0d0d16] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        onReportItem(currentPyes.id, 'pyes', currentPyes.title || currentPyes.caption);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Report Video</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentPyes.id);
                        showToast(`Video ID copied: ${currentPyes.id}`);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/5 flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFA000]" />
                      <span>Copy Video ID</span>
                    </button>

                    {currentUser?.id === currentPyes.authorId && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this PYES video?')) {
                            Storage.deletePyes(currentPyes.id);
                            refreshFeed();
                            showToast('PYES video removed.');
                            setShowOptionsMenu(false);
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 transition font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete PYES</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Up / Down Navigation Controls (Visible on PC & Tablet) */}
        <div className="hidden sm:flex flex-col gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#0f0f18] hover:bg-zinc-800 disabled:opacity-30 border border-white/10 text-white transition shadow-xl hover:scale-105 active:scale-95"
            title="Previous PYES (Up Arrow / K)"
          >
            <ChevronUp className="w-5 h-5 group-hover:text-[#FF007A] transition" />
            <span className="text-[9px] font-mono text-zinc-500">↑</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === pyesList.length - 1}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#0f0f18] hover:bg-zinc-800 disabled:opacity-30 border border-white/10 text-white transition shadow-xl hover:scale-105 active:scale-95"
            title="Next PYES (Down Arrow / J)"
          >
            <ChevronDown className="w-5 h-5 group-hover:text-[#FFA000] transition" />
            <span className="text-[9px] font-mono text-zinc-500">↓</span>
          </button>
        </div>

        {/* DESKTOP / TABLET DEDICATED SIDE COMMENTS PANEL */}
        {showComments && (
          <div className="hidden md:flex flex-col w-80 lg:w-96 h-full max-h-[820px] rounded-[32px] bg-[#0f0f18]/95 backdrop-blur-xl border border-white/10 p-4 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  PYES Comments
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-[#FFA000]">
                  {comments.length}
                </span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {comments.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-16 flex flex-col items-center gap-2">
                  <MessageCircle className="w-8 h-8 text-zinc-700" />
                  <p>No comments on this PYES yet.</p>
                  <p className="text-[11px] text-zinc-600">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 group">
                    <img
                      src={c.author.avatar}
                      alt={c.author.fullName}
                      className="w-7 h-7 rounded-full bg-zinc-800 object-cover shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-white truncate">{c.author.fullName}</span>
                          <span className="text-[10px] text-zinc-400">@{c.author.username}</span>
                        </div>
                        {currentUser?.id === c.author.id && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition p-1"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-200 mt-0.5 leading-snug break-words">{c.text}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                        <button
                          onClick={() => handleLikeComment(c.id)}
                          className={`flex items-center gap-1 hover:text-[#FF007A] transition ${
                            c.isLiked ? 'text-[#FF007A] font-bold' : ''
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${c.isLiked ? 'fill-[#FF007A]' : ''}`} />
                          <span>{c.likesCount || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Composer */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment on PYES..."
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white disabled:opacity-40 hover:opacity-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* MOBILE SLIDE-UP COMMENTS DRAWER (Fits smoothly above bottom nav) */}
        {showComments && (
          <div className="md:hidden fixed inset-x-0 bottom-16 top-1/4 bg-[#0d0d16]/98 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-4 z-40 flex flex-col animate-in slide-in-from-bottom duration-200 shadow-2xl">
            {/* Drawer Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  PYES Comments
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-[#FFA000]">
                  {comments.length}
                </span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              {comments.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-12">
                  No comments on this PYES yet. Be the first to share your thoughts!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <img
                      src={c.author.avatar}
                      alt={c.author.fullName}
                      className="w-7 h-7 rounded-full bg-zinc-800 object-cover shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-white truncate">{c.author.fullName}</span>
                          <span className="text-[10px] text-zinc-400">@{c.author.username}</span>
                        </div>
                        {currentUser?.id === c.author.id && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-200 mt-0.5 leading-snug">{c.text}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                        <button
                          onClick={() => handleLikeComment(c.id)}
                          className={`flex items-center gap-1 hover:text-[#FF007A] transition ${
                            c.isLiked ? 'text-[#FF007A] font-bold' : ''
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${c.isLiked ? 'fill-[#FF007A]' : ''}`} />
                          <span>{c.likesCount || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Comment Composer (Positioned safely above bottom nav) */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment on PYES..."
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Original PYES Share Sheet */}
      {currentPyes && (
        <PyesShareModal
          pyes={currentPyes}
          currentUser={currentUser}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShowToast={showToast}
        />
      )}

      {/* 2. Original PYES Creator Screen */}
      <CreatePyesModal
        currentUser={currentUser}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePyesCreated}
        onOpenAuth={() => onOpenAuth('signup')}
      />
    </div>
  );
};
