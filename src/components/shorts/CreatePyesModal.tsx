import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Film,
  Sparkles,
  Music,
  Hash,
  Eye,
  CheckCircle,
  Play,
  RotateCw,
} from 'lucide-react';
import { User, PyesVideo } from '../../types';
import { Storage } from '../../services/storage';

interface CreatePyesModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newVideo: PyesVideo) => void;
  onOpenAuth: () => void;
}

const SAMPLE_PYES_TEMPLATES = [
  {
    label: 'Cyberpulse Luminescence',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80',
    title: 'Cyberpulse Luminescence',
    music: 'Sub-bass Resonance — PYE Labs',
  },
  {
    label: 'Synthesizer Bloom',
    videoUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/echo-hereweare.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
    title: 'Synthesizer Bloom',
    music: 'Modular Oscillations — PYE Stems',
  },
  {
    label: 'Generative Chroma',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    title: 'Generative Chroma',
    music: 'Petal Harmonics — Spatial Audio',
  },
];

const SUGGESTED_TAGS = ['PYES', 'Creator', 'FutureTech', 'SoundDesign', 'Universe', 'VisualArt', 'Pulse'];

export const CreatePyesModal: React.FC<CreatePyesModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const [videoSource, setVideoSource] = useState<'upload' | 'url' | 'sample'>('upload');
  const [videoFileUrl, setVideoFileUrl] = useState<string>('');
  const [videoInputUrl, setVideoInputUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [musicTitle, setMusicTitle] = useState<string>('Original Audio Stem');
  const [selectedTags, setSelectedTags] = useState<string[]>(['PYES']);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const activeVideoUrl =
    videoSource === 'upload' ? videoFileUrl : videoSource === 'url' ? videoInputUrl : videoFileUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid vertical video file (MP4, WebM, MOV).');
      return;
    }

    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setVideoFileUrl(objectUrl);
  };

  const handleSelectSample = (sample: (typeof SAMPLE_PYES_TEMPLATES)[0]) => {
    setVideoSource('sample');
    setVideoFileUrl(sample.videoUrl);
    setFileName(sample.label);
    if (!title) setTitle(sample.title);
    if (musicTitle === 'Original Audio Stem') setMusicTitle(sample.music);
    setErrorMsg(null);
  };

  const handleAddTag = (tag: string) => {
    const clean = tag.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean) return;
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const finalVideoUrl = activeVideoUrl.trim();
    if (!finalVideoUrl) {
      setErrorMsg('Please upload a video, enter a video URL, or choose a template.');
      return;
    }

    if (!caption.trim()) {
      setErrorMsg('Please provide a caption or hook for your PYES.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPyes = Storage.addPyes({
        authorId: currentUser.id,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
          isVerified: currentUser.isVerified,
        },
        title: title.trim() || caption.slice(0, 32),
        caption: caption.trim(),
        videoUrl: finalVideoUrl,
        posterUrl:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        musicTitle: musicTitle.trim() || 'Original PYES Stem',
        musicAuthor: currentUser.fullName,
        hashtags: selectedTags.length > 0 ? selectedTags : ['PYES'],
        visibility,
        moderationStatus: 'approved',
      });

      onSuccess(newPyes);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not publish PYES. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0b0b14] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000] p-0.5 flex items-center justify-center shadow-lg shadow-[#FF007A]/20">
              <div className="w-full h-full bg-[#0b0b14] rounded-[10px] flex items-center justify-center">
                <Film className="w-4 h-4 text-[#FFA000]" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
                CREATE PYES
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF007A]/20 text-[#FF007A] font-mono border border-[#FF007A]/30">
                  9:16 Vertical
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Publish high-fidelity vertical video to PYE&apos;s real-time universe.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with responsive two-column grid on desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Video Input & Live Preview */}
              <div className="md:col-span-5 space-y-3 flex flex-col">
                <label className="block text-xs font-semibold text-zinc-300">
                  Video Source
                </label>

                {/* Source switcher */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setVideoSource('upload')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition text-center ${
                      videoSource === 'upload'
                        ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSource('url')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition text-center ${
                      videoSource === 'url'
                        ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Video URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSource('sample')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition text-center ${
                      videoSource === 'sample'
                        ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Templates
                  </button>
                </div>

                {videoSource === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/15 hover:border-[#FF007A]/50 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 min-h-[140px]"
                    >
                      <UploadCloud className="w-8 h-8 text-[#FFA000]" />
                      <div className="text-xs font-semibold text-white">
                        {fileName ? fileName : 'Choose vertical video'}
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        MP4, WebM, MOV · Recommended 9:16 aspect ratio
                      </p>
                    </div>
                  </div>
                )}

                {videoSource === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={videoInputUrl}
                      onChange={(e) => setVideoInputUrl(e.target.value)}
                      placeholder="https://domain.com/video.mp4"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Direct HTTPS video link (MP4/WebM)
                    </p>
                  </div>
                )}

                {videoSource === 'sample' && (
                  <div className="space-y-1.5">
                    {SAMPLE_PYES_TEMPLATES.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between transition ${
                          videoFileUrl === sample.videoUrl
                            ? 'bg-[#FF007A]/20 border-[#FF007A] text-white'
                            : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-semibold truncate">{sample.label}</span>
                        {videoFileUrl === sample.videoUrl && (
                          <CheckCircle className="w-4 h-4 text-[#FFA000] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 9:16 Video Live Preview Box */}
                <div className="relative aspect-[9/16] w-full max-w-[210px] mx-auto rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg flex items-center justify-center">
                  {activeVideoUrl ? (
                    <video
                      ref={previewVideoRef}
                      src={activeVideoUrl}
                      playsInline
                      muted
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-zinc-600 space-y-1">
                      <Play className="w-8 h-8 mx-auto opacity-30" />
                      <div className="text-[10px]">Preview will appear here</div>
                    </div>
                  )}

                  {/* Simulated PYES overlay badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF007A] animate-pulse" />
                    PYES
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata, Hashtags, Audio, Visibility */}
              <div className="md:col-span-7 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    PYES Title / Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter an intriguing title..."
                    maxLength={70}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Caption & Hook <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {caption.length}/280
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="What's happening in this PYES? Share the story, technique, or inspiration..."
                    maxLength={280}
                    required
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Audio Stem / Music Track
                  </label>
                  <div className="relative">
                    <Music className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#FFA000]" />
                    <input
                      type="text"
                      value={musicTitle}
                      onChange={(e) => setMusicTitle(e.target.value)}
                      placeholder="Track title or 'Original Stem'..."
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                    />
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Hashtags
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF007A]/15 text-[#FFA000] border border-[#FF007A]/30 text-xs font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(customTagInput);
                          }
                        }}
                        placeholder="Add tag and press Enter..."
                        className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTag(customTagInput)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick suggested chips */}
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    <span className="text-[10px] text-zinc-500 mr-1">Suggestions:</span>
                    {SUGGESTED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 transition"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Visibility & Audience
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'public', label: 'Public', desc: 'Everyone on PYE' },
                      { id: 'followers', label: 'Followers', desc: 'Mutual pulse' },
                      { id: 'private', label: 'Private', desc: 'Only you' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVisibility(opt.id as any)}
                        className={`p-2 rounded-xl border text-left transition ${
                          visibility === opt.id
                            ? 'bg-[#FF007A]/20 border-[#FF007A] text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[9px] text-zinc-500">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !activeVideoUrl || !caption.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-white text-xs font-bold shadow-lg shadow-[#FF007A]/30 hover:opacity-95 active:scale-95 disabled:opacity-40 transition flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Publishing to PYES...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish PYES</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
