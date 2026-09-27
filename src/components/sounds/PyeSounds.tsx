import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Search,
  Plus,
  Bookmark,
  Heart,
  Share2,
  Film,
  Sparkles,
  Disc,
  Clock,
  Radio,
  Sliders,
  CheckCircle,
  X,
  UploadCloud,
  FileAudio,
  Hash,
} from 'lucide-react';
import { SoundTrack, User } from '../../types';
import { Storage } from '../../services/storage';
import { PyeLogo } from '../ui/PyeLogo';

interface PyeSoundsProps {
  currentUser: User | null;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
  onUseSoundInPyes?: (sound: SoundTrack) => void;
  onViewProfile?: (userId: string) => void;
}

export const PyeSounds: React.FC<PyeSoundsProps> = ({
  currentUser,
  onOpenAuth,
  onUseSoundInPyes,
  onViewProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'yours' | 'saved'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sounds, setSounds] = useState<SoundTrack[]>(() => Storage.getSounds('trending'));

  // Audio Player State
  const [currentPlayingSound, setCurrentPlayingSound] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Upload / Create Sound Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState(currentUser?.fullName || currentUser?.username || '');
  const [newCategory, setNewCategory] = useState('Electronic');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isCreatingSound, setIsCreatingSound] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Reload sounds on tab change
  useEffect(() => {
    setSounds(Storage.getSounds(activeTab));
  }, [activeTab]);

  // Audio player setup
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const handleTogglePlay = (sound: SoundTrack) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (currentPlayingSound?.id === sound.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      audio.pause();
      audio.src = sound.audioUrl;
      audio.volume = isMuted ? 0 : volume;
      audio.play()
        .then(() => {
          setCurrentPlayingSound(sound);
          setIsPlaying(true);
          Storage.incrementSoundPlays(sound.id);
        })
        .catch(() => {
          // If browser blocks audio or source is invalid, show toast
          showToast('Playing preview audio track...');
          setCurrentPlayingSound(sound);
          setIsPlaying(true);
        });
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.volume = nextMuted ? 0 : volume;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const handleToggleSave = (soundId: string) => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    const saved = Storage.toggleSaveSound(soundId);
    setSounds((prev) =>
      prev.map((s) => (s.id === soundId ? { ...s, isSaved: saved } : s))
    );
    showToast(saved ? 'Sound saved to your audio collection' : 'Sound removed from saved');
  };

  const handleToggleLike = (soundId: string) => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    const res = Storage.toggleLike(soundId, 'post');
    setSounds((prev) =>
      prev.map((s) =>
        s.id === soundId
          ? {
              ...s,
              isLiked: res.isLiked,
              likesCount: res.likesCount,
            }
          : s
      )
    );
  };

  const handleCreateSoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!newTitle.trim()) {
      showToast('Sound title is required');
      return;
    }

    setIsCreatingSound(true);
    const audioUrl =
      newAudioUrl.trim() ||
      'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/AirReview-Landmarks-02-ChasingCorporate.mp3';
    const coverUrl =
      newCoverUrl.trim() ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80';

    const tags = newTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const created = Storage.addSound({
      title: newTitle.trim(),
      artist: newArtist.trim() || currentUser.fullName || currentUser.username,
      authorId: currentUser.id,
      authorAvatar: currentUser.avatar,
      audioUrl,
      coverUrl,
      duration: '2:30',
      category: newCategory,
      tags: tags.length > 0 ? tags : ['Original', 'PYE'],
    });

    setSounds([created, ...sounds]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewAudioUrl('');
    setNewCoverUrl('');
    setNewTags('');
    setIsCreatingSound(false);
    showToast(`Sound "${created.title}" published to PYE Sounds!`);
  };

  // Filter sounds
  const categories = ['All', 'Electronic', 'Synthwave', 'Ambient', 'Future Bass', 'Acoustic', 'Cyberpunk'];

  const filteredSounds = sounds.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory =
      selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#FF007A]/60 text-white text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Header Banner with official PYE Logo */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FF007A]/20 via-[#FF5500]/15 to-[#FFA000]/10 border border-[#FF007A]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <PyeLogo size={42} />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF007A]/20 border border-[#FF007A]/40 text-[#FFA000] text-[10px] font-bold uppercase tracking-wider">
                  <Music className="w-3 h-3" />
                  Official Audio Universe
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  PYE Sounds
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Explore sonic atmospheres, license original creator tracks, and use authentic audio stems in your PYES videos with zero bots.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => (currentUser ? setShowCreateModal(true) : onOpenAuth('login'))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-xs font-bold text-white shadow-lg shadow-[#FF007A]/25 hover:scale-105 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Sound</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Tabs: Trending / New / Yours / Saved */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-[#0f0f18] rounded-2xl border border-white/5 w-full sm:w-auto">
          {[
            { id: 'trending', label: 'Trending Sounds', icon: Sparkles },
            { id: 'new', label: 'New Sounds', icon: Disc },
            { id: 'yours', label: 'Your Sounds', icon: Music },
            { id: 'saved', label: 'Saved Sounds', icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-[#FF007A] to-[#FF5500] text-white shadow-md shadow-[#FF007A]/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sound, artist, tags..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-[#FF007A]/20 text-[#FFA000] border border-[#FF007A]/40'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sounds Grid / List */}
      {filteredSounds.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Music className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No sounds found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {activeTab === 'saved'
              ? "You haven't saved any audio tracks yet. Browse Trending Sounds and tap the bookmark icon."
              : activeTab === 'yours'
              ? "You haven't published any original audio yet. Tap 'Publish Sound' above to upload your track."
              : 'No audio tracks match your search filter.'}
          </p>
          {activeTab === 'yours' && (
            <button
              onClick={() => (currentUser ? setShowCreateModal(true) : onOpenAuth('login'))}
              className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-xs font-bold text-white transition"
            >
              Publish First Sound
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSounds.map((sound) => {
            const isThisPlaying = currentPlayingSound?.id === sound.id && isPlaying;
            return (
              <div
                key={sound.id}
                className={`p-4 rounded-2xl bg-[#0f0f18] border transition group flex items-center justify-between gap-4 ${
                  isThisPlaying
                    ? 'border-[#FF007A]/60 shadow-lg shadow-[#FF007A]/10 bg-zinc-900/90'
                    : 'border-white/5 hover:border-white/15 hover:bg-zinc-900/50'
                }`}
              >
                {/* Left: Cover & Play/Pause */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 group-hover:shadow-md transition">
                    <img
                      src={sound.coverUrl}
                      alt={sound.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleTogglePlay(sound)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition"
                      aria-label={isThisPlaying ? 'Pause sound' : 'Play sound'}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-6 h-6 text-[#FFA000] fill-[#FFA000]" />
                      ) : (
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Title & Creator metadata */}
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[#FFA000] transition">
                      {sound.title}
                    </h4>
                    <p
                      onClick={() => sound.authorId && onViewProfile?.(sound.authorId)}
                      className="text-xs text-zinc-400 truncate hover:text-white cursor-pointer"
                    >
                      {sound.artist}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {sound.duration}
                      </span>
                      <span>•</span>
                      <span className="text-[#FF007A] font-semibold">
                        {sound.usageCount || 0} PYES uses
                      </span>
                      <span>•</span>
                      <span className="text-zinc-400 font-mono">
                        {sound.playsCount || 0} plays
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Use in PYES button */}
                  <button
                    onClick={() => {
                      Storage.incrementSoundUsage(sound.id);
                      if (onUseSoundInPyes) {
                        onUseSoundInPyes(sound);
                      } else {
                        showToast(`Selected "${sound.title}" for your next PYES!`);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#FF007A]/20 hover:text-[#FFA000] border border-white/10 text-white text-[11px] font-bold flex items-center gap-1 transition"
                    title="Use this audio in a PYES video"
                  >
                    <Film className="w-3.5 h-3.5 text-[#FF007A]" />
                    <span className="hidden sm:inline">Use in PYES</span>
                  </button>

                  {/* Like button */}
                  <button
                    onClick={() => handleToggleLike(sound.id)}
                    className={`p-2 rounded-xl transition ${
                      sound.isLiked
                        ? 'text-[#FF007A] bg-[#FF007A]/15'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Like sound"
                  >
                    <Heart
                      className={`w-4 h-4 ${sound.isLiked ? 'fill-current' : ''}`}
                    />
                  </button>

                  {/* Save button */}
                  <button
                    onClick={() => handleToggleSave(sound.id)}
                    className={`p-2 rounded-xl transition ${
                      sound.isSaved
                        ? 'text-[#FFA000] bg-[#FFA000]/15'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Save to audio vault"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${sound.isSaved ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Mini Player Bar if sound is active */}
      {currentPlayingSound && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl p-3.5 rounded-2xl bg-zinc-950/90 border border-[#FF007A]/40 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentPlayingSound.coverUrl}
              alt={currentPlayingSound.title}
              className={`w-10 h-10 rounded-lg object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {currentPlayingSound.title}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {currentPlayingSound.artist}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTogglePlay(currentPlayingSound)}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF007A] to-[#FF5500] flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="text-zinc-400 hover:text-white transition"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-[#FF007A] cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setIsPlaying(false);
                setCurrentPlayingSound(null);
              }}
              className="text-zinc-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Publish Sound Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0c0c14] border border-[#FF007A]/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <PyeLogo size={28} />
                <h3 className="text-base font-bold text-white">Publish to PYE Sounds</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSoundSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Track Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cyber Pulse Resonance"
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Artist / Creator
                  </label>
                  <input
                    type="text"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    placeholder="Your creator name"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category / Mood
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
                  >
                    <option value="Electronic">Electronic</option>
                    <option value="Synthwave">Synthwave</option>
                    <option value="Ambient">Ambient</option>
                    <option value="Future Bass">Future Bass</option>
                    <option value="Acoustic">Acoustic</option>
                    <option value="Cyberpunk">Cyberpunk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Audio URL (MP3 / WAV stem or stream)
                </label>
                <input
                  type="url"
                  value={newAudioUrl}
                  onChange={(e) => setNewAudioUrl(e.target.value)}
                  placeholder="https://... audio file URL (leave empty for sound generator)"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cover Art Image URL
                </label>
                <input
                  type="url"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  placeholder="https://... cover image URL (optional)"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="cyber, drop, bass, chill"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSound}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-xs font-bold text-white shadow-lg shadow-[#FF007A]/25 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                >
                  {isCreatingSound ? 'Publishing...' : 'Publish to Sounds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
