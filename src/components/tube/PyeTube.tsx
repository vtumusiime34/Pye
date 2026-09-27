import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Heart,
  Share2,
  Bookmark,
  CheckCircle,
  Eye,
  Send,
  Gift,
  Clock,
  ThumbsUp,
  Settings,
} from 'lucide-react';
import { TubeVideo, User, Comment } from '../../types';
import { Storage } from '../../services/storage';

interface PyeTubeProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenTipModal: (targetUserId: string, targetName: string) => void;
  onReportItem: (itemId: string, itemType: string, title?: string) => void;
  onViewProfile: (userId: string) => void;
}

export const PyeTube: React.FC<PyeTubeProps> = ({
  currentUser,
  onOpenAuth,
  onOpenTipModal,
  onReportItem,
  onViewProfile,
}) => {
  const [videos, setVideos] = useState<TubeVideo[]>(() => Storage.getTubeVideos());
  const [selectedVideo, setSelectedVideo] = useState<TubeVideo>(() => videos[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Comments for selected video
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const categories = ['All', 'Technology', 'Music', 'Education', 'Creativity', 'Science'];

  useEffect(() => {
    if (selectedVideo) {
      setComments(Storage.getComments(selectedVideo.id));
      setIsPlaying(false);
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [selectedVideo]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const handleLike = (video: TubeVideo) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const res = Storage.toggleLike(video.id, 'tube');
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, isLiked: res.isLiked, likesCount: res.likesCount } : v))
    );
    if (selectedVideo.id === video.id) {
      setSelectedVideo((prev) => ({ ...prev, isLiked: res.isLiked, likesCount: res.likesCount }));
    }
  };

  const handleSave = (video: TubeVideo) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const isSaved = !video.isSaved;
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, isSaved } : v))
    );
    if (selectedVideo.id === video.id) {
      setSelectedVideo((prev) => ({ ...prev, isSaved }));
    }
    showToast(isSaved ? 'Video saved to watch later' : 'Video removed from saved');
  };

  const handleShare = async (video: TubeVideo) => {
    const url = `${window.location.origin}/#tube-${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(url);
    showToast('Video link copied to clipboard!');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim() || !selectedVideo) return;
    const newCmt = Storage.addComment(selectedVideo.id, commentText, 'tube');
    setComments([newCmt, ...comments]);
    setVideos((prev) =>
      prev.map((v) => (v.id === selectedVideo.id ? { ...v, commentsCount: v.commentsCount + 1 } : v))
    );
    setSelectedVideo((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
    setCommentText('');
    showToast('Comment posted');
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredVideos =
    selectedCategory === 'All'
      ? videos
      : videos.filter((v) => v.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#ff1493]/50 text-white text-xs shadow-2xl backdrop-blur-md">
          {toastMsg}
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow-md'
                : 'bg-[#0f0f18] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Tube Player & Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Player & Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Custom Video Player Canvas */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 group shadow-2xl">
            <video
              ref={videoRef}
              src={selectedVideo.videoUrl}
              poster={selectedVideo.thumbnailUrl}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Play overlay button when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#ff1493] to-[#ff8c00] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition">
                  <Play className="w-8 h-8 ml-1 fill-white" />
                </div>
              </div>
            )}

            {/* Player Control Bar (Visible on hover or paused) */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 opacity-95 transition">
              {/* Progress Scrubber */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-zinc-700 accent-[#ff1493] rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="hover:text-[#ff1493] transition">
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button onClick={toggleMute} className="hover:text-[#ff1493] transition">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-zinc-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSpeedChange}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-bold font-mono"
                  >
                    {playbackSpeed}x
                  </button>

                  <button onClick={toggleFullscreen} className="hover:text-[#ff1493] transition">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Title & Actions */}
          <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4">
            <h1 className="text-lg sm:text-xl font-bold text-white font-display">
              {selectedVideo.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-white/5">
              {/* Channel / Creator */}
              <div className="flex items-center gap-3">
                <button onClick={() => onViewProfile(selectedVideo.authorId)}>
                  <img
                    src={selectedVideo.author.avatar}
                    alt={selectedVideo.author.fullName}
                    className="w-10 h-10 rounded-full bg-zinc-800 object-cover ring-2 ring-[#ff1493]/30"
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewProfile(selectedVideo.authorId)}
                      className="text-sm font-semibold text-white hover:text-[#ff1493] transition"
                    >
                      {selectedVideo.author.fullName}
                    </button>
                    {selectedVideo.author.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#ff1493] shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {selectedVideo.author.subscribersCount?.toLocaleString() || '12.4K'} subscribers
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike(selectedVideo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    selectedVideo.isLiked
                      ? 'bg-[#ff1493] border-[#ff1493] text-white'
                      : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${selectedVideo.isLiked ? 'fill-white' : ''}`} />
                  <span className="font-mono tabular-nums">
                    {selectedVideo.likesCount.toLocaleString()}
                  </span>
                </button>

                <button
                  onClick={() => onOpenTipModal(selectedVideo.authorId, selectedVideo.author.fullName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Tip</span>
                </button>

                <button
                  onClick={() => handleShare(selectedVideo)}
                  className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white transition"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleSave(selectedVideo)}
                  className={`p-2 rounded-full border transition ${
                    selectedVideo.isSaved
                      ? 'bg-[#ff8c00] border-[#ff8c00] text-white'
                      : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                  title="Save Video"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${selectedVideo.isSaved ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-300 space-y-2">
              <div className="flex items-center gap-3 font-semibold text-zinc-400">
                <span>{selectedVideo.viewsCount.toLocaleString()} views</span>
                <span>·</span>
                <span>Category: {selectedVideo.category}</span>
                <span>·</span>
                <span>Duration: {selectedVideo.duration}</span>
              </div>
              <p className={descriptionExpanded ? '' : 'line-clamp-2'}>
                {selectedVideo.description}
              </p>
              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="text-[11px] font-semibold text-[#ff8c00] hover:underline"
              >
                {descriptionExpanded ? 'Show less' : 'Read full description'}
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Comments ({comments.length})
            </h3>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this video..."
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff1493]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-xs font-semibold text-white disabled:opacity-40 transition"
              >
                Comment
              </button>
            </form>

            {/* Comments list */}
            <div className="space-y-3 pt-2">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={c.author.avatar}
                    alt={c.author.fullName}
                    className="w-7 h-7 rounded-full bg-zinc-800 object-cover mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">{c.author.fullName}</span>
                      <span className="text-[10px] text-zinc-400">@{c.author.username}</span>
                    </div>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Up Next / Recommended Videos */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
            Up Next in PYE Tube
          </h3>

          <div className="space-y-2.5">
            {filteredVideos.map((video) => {
              const isCurrent = video.id === selectedVideo.id;
              return (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`p-2 rounded-xl border flex gap-3 cursor-pointer transition ${
                    isCurrent
                      ? 'bg-[#ff1493]/10 border-[#ff1493]/40'
                      : 'bg-[#0f0f18] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="relative w-36 h-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {video.duration}
                    </span>
                  </div>

                  <div className="min-w-0 flex flex-col justify-between py-0.5">
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {video.title}
                    </h4>
                    <div className="text-[11px] text-zinc-400">
                      <div>{video.author.fullName}</div>
                      <div className="text-[10px] text-zinc-500">
                        {video.viewsCount.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
