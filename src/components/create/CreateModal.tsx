import React, { useState } from 'react';
import {
  Flame,
  Music,
  Image,
  Users2,
  X,
  UploadCloud,
  CheckCircle,
  Sparkles,
  Compass,
} from 'lucide-react';
import { User } from '../../types';
import { Storage, PYE_SPACES } from '../../services/storage';
import { PyeLogo } from '../ui/PyeLogo';

interface CreateModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onOpenAuth: () => void;
  onGoConferenceTrigger?: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
  onGoConferenceTrigger,
}) => {
  if (!isOpen) return null;

  const [createType, setCreateType] = useState<'post' | 'short' | 'sound' | 'conference'>('post');

  // Form Fields
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('technology');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [privacy, setPrivacy] = useState<'public' | 'followers'>('public');

  // Local file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('image');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const tagsArray = hashtags
      .split(/[\s,#]+/)
      .filter(Boolean)
      .map((t) => t.replace('#', ''));

    if (createType === 'post') {
      if (!caption.trim()) return;
      Storage.addPost({
        authorId: currentUser.id,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
          isVerified: currentUser.isVerified,
        },
        caption: caption.trim(),
        hashtags: tagsArray.length > 0 ? tagsArray : ['PYEUniverse'],
        spaceSlug: selectedSpace,
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType,
      });
      onSuccess('Pulse broadcasted to PYE Universe!');
      onClose();
    } else if (createType === 'short') {
      if (!title.trim() && !caption.trim()) return;
      Storage.addPyes({
        authorId: currentUser.id,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
          isVerified: currentUser.isVerified,
        },
        title: title.trim() || 'PYES Transmission',
        caption: caption.trim() || title.trim(),
        videoUrl:
          mediaUrl.trim() ||
          'https://vjs.zencdn.net/v/oceans.mp4',
        posterUrl:
          'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80',
        musicTitle: 'Original PYES Stem',
        musicAuthor: currentUser.fullName,
        hashtags: tagsArray.length > 0 ? tagsArray : ['PYES', 'pulse'],
        spaceSlug: selectedSpace,
        visibility: privacy === 'followers' ? 'followers' : 'public',
        moderationStatus: 'approved',
      });
      onSuccess('PYES video broadcasted successfully!');
      onClose();
    } else if (createType === 'sound') {
      if (!title.trim() && !caption.trim()) return;
      Storage.addSound({
        title: title.trim() || 'PYE Original Sound',
        artist: currentUser.fullName || currentUser.username,
        authorId: currentUser.id,
        authorAvatar: currentUser.avatar,
        audioUrl:
          mediaUrl.trim() ||
          'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/AirReview-Landmarks-02-ChasingCorporate.mp3',
        coverUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        duration: '2:30',
        category: selectedSpace || 'Electronic',
        tags: tagsArray.length > 0 ? tagsArray : ['PYE', 'Sound'],
      });
      onSuccess('Original sound published to PYE Sounds!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl bg-[#0f0f18] border border-white/10 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header with official PYE Logo */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <PyeLogo size={28} />
            <h2 className="text-base font-bold text-white font-display">Create in PYE</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Type Selector Pills */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setCreateType('post')}
            className={`py-2 px-1 rounded-xl transition flex flex-col items-center gap-1 ${
              createType === 'post'
                ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" />
            <span className="text-[10px]">Pulse</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateType('short')}
            className={`py-2 px-1 rounded-xl transition flex flex-col items-center gap-1 ${
              createType === 'short'
                ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="text-[10px]">PYES</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateType('sound')}
            className={`py-2 px-1 rounded-xl transition flex flex-col items-center gap-1 ${
              createType === 'sound'
                ? 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="text-[10px]">Sound</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onGoConferenceTrigger) onGoConferenceTrigger();
            }}
            className="py-2 px-1 rounded-xl transition flex flex-col items-center gap-1 text-zinc-400 hover:text-purple-400"
          >
            <Users2 className="w-4 h-4" />
            <span className="text-[10px]">Summit</span>
          </button>
        </div>

        {/* Dynamic Form based on selection */}
        <form onSubmit={handlePostSubmit} className="space-y-3.5">
          {createType !== 'post' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {createType === 'short' ? 'PYES Title' : 'Broadcast Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your creation an inspiring title..."
                required
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              {createType === 'post' ? 'Pulse Thoughts' : 'Caption / Hook'}
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What are you sharing with the PYE Universe?"
              rows={3}
              required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Target PYE Space
              </label>
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
              >
                {PYE_SPACES.map((sp) => (
                  <option key={sp.slug} value={sp.slug}>
                    {sp.icon} {sp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Hashtags (space separated)
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="future neural sound"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
              />
            </div>
          </div>

          {/* Media File Upload or URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Media Attachment (Photo or Video)
            </label>
            
            <div className="flex gap-2">
              <label className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition">
                <UploadCloud className="w-4 h-4 text-[#FF007A]" />
                <span className="truncate">
                  {mediaUrl ? 'File Selected ✓' : 'Upload from Device (MP4/PNG)'}
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {mediaUrl && (
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  Clear
                </button>
              )}
            </div>

            {!mediaUrl && (
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Or paste direct media URL..."
                className="w-full px-3.5 py-1.5 bg-zinc-900/60 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
              />
            )}
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-300">Audience Visibility</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrivacy('public')}
                className={`px-3 py-1 rounded-lg transition ${
                  privacy === 'public' ? 'bg-[#FF007A] text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Public Universe
              </button>
              <button
                type="button"
                onClick={() => setPrivacy('followers')}
                className={`px-3 py-1 rounded-lg transition ${
                  privacy === 'followers' ? 'bg-[#FF007A] text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Followers Only
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition"
          >
            Broadcast to PYE Universe
          </button>
        </form>
      </div>
    </div>
  );
};
