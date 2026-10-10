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
  RotateCw,
  RefreshCw,
  AlertCircle,
  Shield,
  EyeOff,
  UserX,
  Image as ImageIcon,
} from 'lucide-react';
import { PyesVideo, User, Comment } from '../../types';
import { Storage } from '../../services/storage';
import { PyeLogo } from '../ui/PyeLogo';
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
  const [refreshSeed, setRefreshSeed] = useState<number>(0);
  const [pyesList, setPyesList] = useState<PyesVideo[]>(() =>
    Storage.getPyes('foryou', { activeOnly: true })
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs
  const lastTapRef = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const lastWheelTime = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoPreloadRef = useRef<HTMLVideoElement>(null);
  const photoTimerRef = useRef<any>(null);

  const currentPyes = pyesList[currentIndex];
  const nextPyes = pyesList[currentIndex + 1];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Reload feed based on active filter and freshness
  const loadPyesFeed = useCallback(
    (filter: PyesFeedFilter = feedFilter, seed: number = refreshSeed) => {
      const items = Storage.getPyes(filter, { activeOnly: true, refreshSeed: seed });
      setPyesList(items);
      if (currentIndex >= items.length) {
        setCurrentIndex(Math.max(0, items.length - 1));
      }
    },
    [feedFilter, refreshSeed, currentIndex]
  );

  // Trigger smooth refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    const newSeed = refreshSeed + 1;
    setRefreshSeed(newSeed);
    const fresh = Storage.getPyes(feedFilter, { activeOnly: true, refreshSeed: newSeed });
    setPyesList(fresh);
    setCurrentIndex(0);
    showToast('Refreshed! Fresh PYES loaded.');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    const items = Storage.getPyes(feedFilter, { activeOnly: true, refreshSeed });
    setPyesList(items);
    setCurrentIndex(0);
  }, [feedFilter]);

  // Load comments for current item
  const loadComments = useCallback((targetId: string) => {
    setComments(Storage.getComments(targetId));
  }, []);

  // Update playback when current PYES changes
  useEffect(() => {
    if (!currentPyes) return;

    loadComments(currentPyes.id);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setMediaError(false);
    setIsLoadingMedia(true);
    setCaptionExpanded(false);

    // Record view in recommendation history
    Storage.recordPyesView(currentPyes.id, 0, false);

    const isImage = currentPyes.mediaType === 'image' || Boolean(
      currentPyes.videoUrl && (
        currentPyes.videoUrl.startsWith('data:image') ||
        /\.(jpg|jpeg|png|webp|gif|avif)($|\?)/i.test(currentPyes.videoUrl)
      )
    );

    // Handle photo playback duration simulation (5 seconds auto-advance)
    if (isImage) {
      setIsLoadingMedia(false);
      setIsPlaying(true);
      setDuration(5);

      if (photoTimerRef.current) clearInterval(photoTimerRef.current);
      let elapsed = 0;
      photoTimerRef.current = setInterval(() => {
        elapsed += 0.2;
        setCurrentTime(elapsed);
        setProgress((elapsed / 5) * 100);
        if (elapsed >= 5) {
          clearInterval(photoTimerRef.current);
          Storage.recordPyesView(currentPyes.id, 5, true);
          if (autoAdvance && currentIndex < pyesList.length - 1) {
            handleNext();
          }
        }
      }, 200);

      return () => {
        if (photoTimerRef.current) clearInterval(photoTimerRef.current);
      };
    }

    // Video playback
    if (photoTimerRef.current) clearInterval(photoTimerRef.current);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoadingMedia(false);
        })
        .catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsLoadingMedia(false);
              })
              .catch(() => {
                setIsPlaying(false);
                setIsLoadingMedia(false);
              });
          }
        });
    }
  }, [currentIndex, currentPyes?.id, loadComments, playbackSpeed]);

  // Handle video progress updates
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress((cur / dur) * 100);

      if (cur >= 3) {
        Storage.recordPyesView(currentPyes.id, cur, false);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsLoadingMedia(false);
      setMediaError(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < pyesList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      showToast('You reached the latest active PYES transmission! 🚀');
    }
  }, [currentIndex, pyesList.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleVideoEnded = () => {
    if (currentPyes) {
      Storage.recordPyesView(currentPyes.id, duration, true);
    }
    if (autoAdvance && currentIndex < pyesList.length - 1) {
      handleNext();
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    const isImage = currentPyes?.mediaType === 'image';
    if (isImage) {
      setIsPlaying(!isPlaying);
      return;
    }
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
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
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
  }, [handleNext, handlePrev, currentPyes, isPlaying]);

  // Mouse wheel scroll with debounce
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 450) return;
    if (Math.abs(e.deltaY) > 35) {
      lastWheelTime.current = now;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Touch swipe navigation for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartY.current = null;
  };

  // Double tap to heart
  const handleContainerClick = (e: React.MouseEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
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

  const handleLike = () => {
    if (!currentUser) {
      onOpenAuth();
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

  const handleSave = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!currentPyes) return;

    const isSaved = Storage.togglePyesSave(currentPyes.id);
    setPyesList((prev) =>
      prev.map((item) => (item.id === currentPyes.id ? { ...item, isSaved } : item))
    );
    showToast(isSaved ? 'PYES saved to vault' : 'Removed from vault');
  };

  const isFollowingAuthor = currentPyes ? Storage.isFollowing(currentPyes.authorId) : false;

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!currentPyes) return;

    const nowFollowing = Storage.toggleFollow(currentPyes.authorId);
    showToast(nowFollowing ? `Following @${currentPyes.author.username}` : `Unfollowed @${currentPyes.author.username}`);
    loadPyesFeed();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim() || !currentPyes) return;

    const newComment = Storage.addComment(currentPyes.id, commentText, 'pyes');
    setComments((prev) => [newComment, ...prev]);
    setPyesList((prev) =>
      prev.map((item) =>
        item.id === currentPyes.id
          ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
          : item
      )
    );
    setCommentText('');
    showToast('Comment posted!');
  };

  const handleShareClick = () => {
    if (!currentPyes) return;
    Storage.recordPyesShare(currentPyes.id);
    setShowShareModal(true);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
    showToast(`Speed: ${next}x`);
  };

  const isImageMedia = currentPyes?.mediaType === 'image' || Boolean(
    currentPyes?.videoUrl && (
      currentPyes.videoUrl.startsWith('data:image') ||
      /\.(jpg|jpeg|png|webp|gif|avif)($|\?)/i.test(currentPyes.videoUrl)
    )
  );

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-[calc(100dvh-4rem-4rem)] lg:h-[calc(100vh-5rem)] max-h-[860px] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-4 z-50 px-4 py-2 rounded-full bg-black/90 border border-[#FF007A]/40 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#FFA000]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Theatre Wrapper (Responsive for Mobile, Tablet, PC) */}
      <div className="relative flex items-center justify-center gap-4 sm:gap-6 w-full h-full">
        {/* Subtle, neutral dark backdrop - NO giant decorative canvas or radial watermark */}
        <div className="absolute inset-0 bg-[#07070c] -z-10" />

        {/* Vertical Reel Frame */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-[420px] h-full rounded-2xl sm:rounded-[32px] overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col justify-between"
        >
          {/* Preload subsequent video quietly */}
          {nextPyes && nextPyes.mediaType !== 'image' && (
            <video
              ref={nextVideoPreloadRef}
              src={nextPyes.videoUrl}
              preload="auto"
              className="hidden"
            />
          )}

          {/* STATE: NO ACTIVE PYES IN FEED */}
          {pyesList.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30 bg-black/90 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-xl">
                <Flame className="w-8 h-8 text-[#FF007A]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Active PYES Right Now</h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  {feedFilter === 'following'
                    ? 'No active 24h reels from creators you follow yet.'
                    : 'Be the first pioneer to broadcast a 24h photo or video reel on PYES!'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold shadow-lg shadow-[#FF007A]/30 hover:opacity-95 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>CREATE PYES</span>
                </button>
              </div>
            </div>
          ) : currentPyes && isImageMedia ? (
            /* STATE: PHOTO PYE (Preserve aspect ratio, full visual visibility) */
            <div
              onClick={handleContainerClick}
              className="relative w-full h-full flex items-center justify-center bg-[#09090f] cursor-pointer"
            >
              <img
                src={currentPyes.videoUrl || currentPyes.posterUrl}
                alt={currentPyes.title || 'PYE Photo'}
                className="w-full h-full object-contain"
                onLoad={() => setIsLoadingMedia(false)}
                onError={() => {
                  setMediaError(true);
                  setIsLoadingMedia(false);
                }}
              />
              {/* Photo badge indicator */}
              <div className="absolute top-16 left-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-[#FFA000]" />
                <span>Photo Reel</span>
              </div>
            </div>
          ) : currentPyes && mediaError ? (
            /* STATE: INDIVIDUAL MEDIA ISSUE (Graceful skip / fallback without crashing feed) */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0b0b14] p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200">Couldn't load this Pye media.</p>
                <p className="text-[11px] text-zinc-400">The transmission could not be rendered.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMediaError(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
                {currentIndex < pyesList.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold transition"
                  >
                    Next Pye →
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* STATE: HTML5 VIDEO ELEMENT (Natural fit, no distortion) */
            <div className="relative w-full h-full flex items-center justify-center bg-[#09090f]">
              <video
                ref={videoRef}
                src={currentPyes?.videoUrl}
                poster={currentPyes?.posterUrl}
                loop={!autoAdvance}
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onError={() => {
                  console.warn('Video failed to load:', currentPyes?.videoUrl);
                  setMediaError(true);
                  setIsLoadingMedia(false);
                }}
                onWaiting={() => setIsLoadingMedia(true)}
                onPlaying={() => {
                  setIsLoadingMedia(false);
                  setMediaError(false);
                }}
                onClick={handleContainerClick}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* LOADING SPINNER */}
              {isLoadingMedia && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none z-20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-[#FF007A] animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 font-mono">
                      LOADING PYE
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Double Tap Heart Burst */}
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

          {/* PAUSED Overlay */}
          {!isPlaying && pyesList.length > 0 && !mediaError && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] cursor-pointer z-20"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition">
                <Play className="w-8 h-8 ml-1 fill-white" />
              </div>
            </div>
          )}

          {/* TOP AREA: Clean Navigation HUD (Lowered & uncluttered, no giant central watermark) */}
          <div className="relative z-30 p-3 sm:p-4 pt-3 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
            {/* PYES Logo Badge & Navigation Segment */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
                <PyeLogo size={18} />
                <span className="text-xs font-black tracking-widest text-white font-display">
                  PYES
                </span>
              </div>

              {/* Feed Mode Selector: FOR YOU · FOLLOWING · DISCOVER */}
              <div className="flex items-center bg-black/60 backdrop-blur-md rounded-full p-0.5 border border-white/10 text-[10px] font-bold">
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

            {/* Top Right Controls: Refresh, Speed, Mute, CREATE */}
            <div className="flex items-center gap-1.5">
              {/* Refresh PYES Feed Button */}
              <button
                onClick={handleRefresh}
                className={`p-1.5 rounded-full bg-black/60 border border-white/10 text-zinc-300 hover:text-white transition ${
                  isRefreshing ? 'animate-spin text-[#FFA000]' : ''
                }`}
                title="Refresh PYES (Get Fresh Posts)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

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

              {/* Speed Controller (Videos only) */}
              {!isImageMedia && (
                <button
                  onClick={cycleSpeed}
                  className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:border-[#FFA000]/60 text-[10px] font-mono font-bold transition flex items-center gap-1"
                  title="Playback Speed"
                >
                  <Gauge className="w-3 h-3 text-[#FFA000]" />
                  <span>{playbackSpeed}x</span>
                </button>
              )}

              {/* Mute / Unmute Button (Videos only) */}
              {!isImageMedia && (
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
              )}

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

          {/* BOTTOM AREA: Creator Info, Captions, Audio Stem, Timeline */}
          {currentPyes && (
            <div className="relative z-30 p-3 sm:p-4 pb-2 bg-gradient-to-t from-black/95 via-black/75 to-transparent space-y-2">
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

              {/* Title & Caption */}
              <div className="max-w-[calc(100%-68px)] space-y-1">
                {currentPyes.title && (
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {currentPyes.title}
                  </h4>
                )}
                <p
                  onClick={() => setCaptionExpanded(!captionExpanded)}
                  className={`text-xs text-zinc-200 cursor-pointer transition leading-relaxed ${
                    captionExpanded ? '' : 'line-clamp-2'
                  }`}
                >
                  {currentPyes.caption}
                </p>

                {/* Hashtags */}
                {currentPyes.hashtags && currentPyes.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {currentPyes.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold text-[#FFA000] hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Audio Track Ticker */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-300">
                <Music className="w-3 h-3 text-[#FF007A] shrink-0 animate-pulse" />
                <div className="overflow-hidden w-full">
                  <p className="truncate font-mono text-[10px]">
                    {currentPyes.musicTitle || 'Original PYES Stem'} • {currentPyes.musicAuthor || currentPyes.author.fullName}
                  </p>
                </div>
              </div>

              {/* Precision Playback Timeline Bar */}
              <div className="w-full pt-1">
                <div
                  onClick={(e) => {
                    if (isImageMedia) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = clickX / rect.width;
                    if (videoRef.current && duration) {
                      videoRef.current.currentTime = pct * duration;
                    }
                  }}
                  className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden group hover:h-1.5 transition-all"
                >
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] rounded-full transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* RIGHT SIDE VERTICAL ACTION CONTROLS */}
          {currentPyes && (
            <div className="absolute right-2 bottom-16 z-30 flex flex-col items-center gap-3.5">
              {/* 1. Author Avatar with Quick Follow Badge */}
              <div className="relative group cursor-pointer">
                <div
                  onClick={() => onViewProfile(currentPyes.authorId)}
                  className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000]"
                >
                  <img
                    src={currentPyes.author.avatar}
                    alt={currentPyes.author.fullName}
                    className="w-10 h-10 rounded-full bg-zinc-900 object-cover ring-2 ring-black"
                  />
                </div>
                {!isFollowingAuthor && currentUser?.id !== currentPyes.authorId && (
                  <button
                    onClick={handleFollow}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white flex items-center justify-center text-[10px] font-black shadow hover:scale-110 active:scale-95 transition"
                    title="Follow Creator"
                  >
                    +
                  </button>
                )}
              </div>

              {/* 2. Heart / Like Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleLike}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition hover:scale-110 active:scale-90 shadow-lg ${
                    currentPyes.isLiked
                      ? 'bg-[#FF007A] border-[#FF007A] text-white shadow-[#FF007A]/50'
                      : 'bg-black/60 border-white/10 text-white hover:text-[#FF007A]'
                  }`}
                  title="Like PYES (L)"
                >
                  <Heart
                    className={`w-5 h-5 transition ${
                      currentPyes.isLiked ? 'fill-white stroke-white' : ''
                    }`}
                  />
                </button>
                <span className="text-[10px] font-mono font-bold text-white mt-0.5">
                  {currentPyes.likesCount}
                </span>
              </div>

              {/* 3. Comments Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#FFA000] hover:scale-110 active:scale-90 transition shadow-lg"
                  title="View Comments (C)"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-white mt-0.5">
                  {currentPyes.commentsCount}
                </span>
              </div>

              {/* 4. Save to Vault Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleSave}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition hover:scale-110 active:scale-90 shadow-lg ${
                    currentPyes.isSaved
                      ? 'bg-[#FFA000] border-[#FFA000] text-black shadow-[#FFA000]/50'
                      : 'bg-black/60 border-white/10 text-white hover:text-[#FFA000]'
                  }`}
                  title="Save to Vault (S)"
                >
                  <Bookmark
                    className={`w-5 h-5 transition ${
                      currentPyes.isSaved ? 'fill-black stroke-black' : ''
                    }`}
                  />
                </button>
                <span className="text-[10px] font-mono font-bold text-white mt-0.5">Save</span>
              </div>

              {/* 5. Tip Creator Button (PYE Coins) */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onOpenTipModal(currentPyes.authorId, currentPyes.author.fullName)}
                  className="p-2.5 rounded-full bg-gradient-to-tr from-[#FF007A]/40 to-[#FFA000]/40 backdrop-blur-md border border-white/20 text-[#FFA000] hover:scale-110 active:scale-90 transition shadow-lg"
                  title="Tip Creator with PYE Coins"
                >
                  <Gift className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-[#FFA000] mt-0.5">Tip</span>
              </div>

              {/* 6. Share Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleShareClick}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#FF5500] hover:scale-110 active:scale-90 transition shadow-lg"
                  title="Share PYES"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-white mt-0.5">
                  {currentPyes.sharesCount || 0}
                </span>
              </div>

              {/* 7. More Options Drawer Toggle */}
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:scale-110 active:scale-90 transition shadow-lg"
                  title="More Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {/* More Options Dropdown */}
                {showOptionsMenu && (
                  <div className="absolute bottom-12 right-0 w-44 rounded-2xl bg-zinc-900/95 border border-white/10 p-1.5 shadow-2xl backdrop-blur-xl z-50 text-xs text-zinc-200 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        onReportItem(currentPyes.id, 'pyes', currentPyes.caption);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-white/5 flex items-center gap-2 text-left"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      <span>Report Content</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        handleNext();
                        showToast('Marked as not interested. Tuned recommendation engine.');
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-white/5 flex items-center gap-2 text-left"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Not Interested</span>
                    </button>
                    {currentUser?.id !== currentPyes.authorId && (
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          Storage.blockUser(currentPyes.authorId);
                          showToast(`Blocked @${currentPyes.author.username}`);
                          handleNext();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 text-left"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Block Creator</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP SIDE QUICK NAVIGATORS (Up & Down Arrows) */}
        <div className="hidden lg:flex flex-col gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-zinc-900 border border-white/10 text-white disabled:opacity-20 hover:bg-zinc-800 hover:border-[#FF007A]/50 transition shadow-xl"
            title="Previous PYES (Up Arrow / K)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === pyesList.length - 1}
            className="p-3 rounded-full bg-zinc-900 border border-white/10 text-white disabled:opacity-20 hover:bg-zinc-800 hover:border-[#FFA000]/50 transition shadow-xl"
            title="Next PYES (Down Arrow / J)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* COMMENTS MODAL DRAWER */}
      {showComments && currentPyes && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md h-[70vh] max-h-[560px] rounded-t-3xl sm:rounded-3xl bg-[#0f0f18] border border-white/10 flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#FF007A]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  PYES Comments ({comments.length})
                </h3>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs">
                  <p>No comments on this PYES yet.</p>
                  <p className="text-[11px] text-zinc-600 mt-1">Be the first pioneer to leave a thought!</p>
                </div>
              ) : (
                comments.map((cmt) => (
                  <div key={cmt.id} className="flex gap-2.5 text-xs">
                    <img
                      src={cmt.author.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full bg-zinc-800 object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-[11px]">
                          {cmt.author.fullName}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          @{cmt.author.username}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">{cmt.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment on PYES..."
                className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && currentPyes && (
        <PyesShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          pyes={currentPyes}
          currentUser={currentUser}
          onShowToast={showToast}
        />
      )}

      {/* CREATE PYES MODAL */}
      {showCreateModal && (
        <CreatePyesModal
          currentUser={currentUser}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newPyes) => {
            setPyesList((prev) => [newPyes, ...prev]);
            setCurrentIndex(0);
            showToast('Your PYES transmission is now broadcasting!');
          }}
          onOpenAuth={onOpenAuth}
        />
      )}
    </div>
  );
};
