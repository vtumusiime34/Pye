import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Calendar,
  Heart,
  Users,
  Grid,
  Flame,
  Bookmark,
  Edit,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  X,
  Share2,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare,
  Search,
  QrCode,
  Zap,
} from 'lucide-react';
import { User, Post, PyesVideo } from '../../types';
import { Storage } from '../../services/storage';
import { compressImageFile } from '../../utils/imageUtils';
import { PyeLogo } from '../ui/PyeLogo';
import { AccountBadge } from '../ui/AccountBadge';
import { PyeIdCardModal } from './PyeIdCardModal';
import { PromotePostModal } from '../monetization/PromotePostModal';

interface ProfileViewProps {
  userId: string;
  currentUser: User | null;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
  onUserUpdated: (user: User) => void;
  onNavigateToPyes?: () => void;
  onOpenMessagesWithUser?: (targetUser: User) => void;
  onNavigateToProfile?: (userId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  currentUser,
  onOpenAuth,
  onUserUpdated,
  onNavigateToPyes,
  onOpenMessagesWithUser,
  onNavigateToProfile,
}) => {
  const [profileUser, setProfileUser] = useState<User | undefined>(() =>
    Storage.getUserById(userId) || (currentUser?.id === userId ? currentUser : undefined)
  );

  useEffect(() => {
    setProfileUser(Storage.getUserById(userId) || (currentUser?.id === userId ? currentUser : undefined));
  }, [userId, currentUser]);

  const isOwnProfile = currentUser?.id === profileUser?.id;

  const [activeTab, setActiveTab] = useState<'posts' | 'shorts' | 'saved'>('posts');
  const [isFollowing, setIsFollowing] = useState<boolean>(() =>
    profileUser ? Storage.isFollowing(profileUser.id) : false
  );

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState(profileUser?.fullName || '');
  const [editBio, setEditBio] = useState(profileUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(profileUser?.avatar || '');
  const [editBanner, setEditBanner] = useState(profileUser?.banner || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Followers & Following Modal state
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  const [followListUsers, setFollowListUsers] = useState<User[]>([]);
  const [followSearch, setFollowSearch] = useState('');

  // Pye ID 3D Card & Promotion Modals
  const [showIdCard, setShowIdCard] = useState(false);
  const [promoteItem, setPromoteItem] = useState<{ item: Post | PyesVideo; type: 'post' | 'pyes' } | null>(null);
  const [contentVersion, setContentVersion] = useState(0);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeletePost = (postId: string) => {
    Storage.deletePost(postId);
    setContentVersion((v) => v + 1);
    showToast('Post deleted successfully.');
  };

  const handleDeletePyes = (pyesId: string) => {
    Storage.deletePyes(pyesId);
    setContentVersion((v) => v + 1);
    showToast('PYES reel deleted successfully.');
  };

  const handleOpenFollowModal = (type: 'followers' | 'following') => {
    if (!profileUser) return;
    setShowFollowModal(type);
    setFollowSearch('');
    if (type === 'followers') {
      setFollowListUsers(Storage.getFollowersUsers(profileUser.id));
    } else {
      setFollowListUsers(Storage.getFollowingUsers(profileUser.id));
    }
  };

  const handleMessageClick = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!profileUser) return;
    if (Storage.isUserBlocked(currentUser.id, profileUser.id)) {
      showToast('Cannot message this Pye user due to privacy settings.');
      return;
    }
    Storage.getOrCreateConversation(currentUser.id, profileUser);
    if (onOpenMessagesWithUser) {
      onOpenMessagesWithUser(profileUser);
    }
  };

  if (!profileUser) {
    return (
      <div className="p-12 text-center text-zinc-400">
        User profile not found.
      </div>
    );
  }

  const posts = Storage.getPosts().filter((p) => p.authorId === profileUser.id);
  const pyesVideos = Storage.getPyes().filter((s) => s.authorId === profileUser.id);
  const savedPosts = Storage.getPosts().filter((p) => p.isSaved);

  const handleFollowToggle = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    const now = Storage.toggleFollow(profileUser.id);
    setIsFollowing(now);
    setProfileUser(Storage.getUserById(profileUser.id));
    showToast(now ? `Followed @${profileUser.username}` : `Unfollowed @${profileUser.username}`);
  };

  // Direct fast avatar upload
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadStatus('Uploading...');
    try {
      const compressed = await compressImageFile(file, { maxWidth: 350, maxHeight: 350, quality: 0.85 });
      setEditAvatar(compressed);
      const updated = Storage.updateProfile({ avatar: compressed });
      if (updated) {
        onUserUpdated(updated);
        setProfileUser(updated);
        setUploadStatus('Profile updated');
        showToast('Profile picture updated successfully!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Profile picture could not be updated.');
    } finally {
      setIsUploadingImage(false);
      setTimeout(() => setUploadStatus(null), 2500);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Direct fast banner upload
  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadStatus('Uploading...');
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1200, maxHeight: 450, quality: 0.82 });
      setEditBanner(compressed);
      const updated = Storage.updateProfile({ banner: compressed });
      if (updated) {
        onUserUpdated(updated);
        setProfileUser(updated);
        setUploadStatus('Profile updated');
        showToast('Profile banner updated successfully!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Banner could not be updated.');
    } finally {
      setIsUploadingImage(false);
      setTimeout(() => setUploadStatus(null), 2500);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.username}&backgroundColor=FF007A,FFA000`;
    setEditAvatar(defaultAvatar);
    const updated = Storage.updateProfile({ avatar: defaultAvatar });
    if (updated) {
      onUserUpdated(updated);
      setProfileUser(updated);
      showToast('Profile picture removed (reset to default)');
    }
  };

  const handleRemoveBanner = () => {
    setEditBanner('');
    const updated = Storage.updateProfile({ banner: '' });
    if (updated) {
      onUserUpdated(updated);
      setProfileUser(updated);
      showToast('Profile banner removed');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = Storage.updateProfile({
      fullName: editFullName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim() || profileUser.avatar,
      banner: editBanner.trim() || undefined,
    });
    if (updated) {
      onUserUpdated(updated);
      setProfileUser(updated);
      setShowEditModal(false);
      showToast('Profile updated');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#FF007A]/50 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}

      {/* Hidden file inputs for fast device selection */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFile}
        className="hidden"
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerFile}
        className="hidden"
      />

      {/* Banner & Avatar Header */}
      <div className="rounded-3xl bg-[#0f0f18] border border-white/5 overflow-hidden shadow-2xl">
        {/* Banner with Safe Aspect Ratio */}
        <div className="relative h-44 sm:h-56 md:h-64 bg-zinc-800 overflow-hidden group">
          {profileUser.banner ? (
            <img
              src={profileUser.banner}
              alt="Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#FF007A]/30 via-[#FF5500]/20 to-[#FFA000]/30 flex items-center justify-center">
              <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs uppercase tracking-widest font-bold">
                <PyeLogo size={24} />
                <span>PYE Universe Profile</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-transparent to-black/25 pointer-events-none" />

          {/* Quick Banner Controls for Owner */}
          {isOwnProfile && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10 opacity-90 hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingImage}
                className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                title="Change Profile Banner"
              >
                <Camera className="w-3.5 h-3.5 text-[#FFA000]" />
                <span className="hidden sm:inline">Change Banner</span>
              </button>

              {profileUser.banner && (
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="p-1.5 rounded-xl bg-black/70 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 backdrop-blur-md border border-white/10 transition"
                  title="Remove Banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Uploading progress indicator */}
          {uploadStatus && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 text-white text-xs font-bold z-20">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF007A]" />
              <span>{uploadStatus}</span>
            </div>
          )}
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar with Quick Edit Overlay */}
            <div className="relative group">
              <img
                src={profileUser.avatar}
                alt={profileUser.fullName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-zinc-900 object-cover ring-4 ring-[#0f0f18] shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {profileUser.isVerified && (
                <div className="absolute -bottom-1 -right-1 p-1 bg-[#0f0f18] rounded-full z-10">
                  <CheckCircle className="w-5 h-5 text-[#FF007A] fill-[#FF007A]/20" />
                </div>
              )}

              {/* Owner quick avatar edit badge */}
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold backdrop-blur-[2px] transition duration-200"
                  title="Change Profile Picture"
                >
                  <Camera className="w-6 h-6 text-[#FFA000] mb-0.5" />
                  <span>Change</span>
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Digital Pye ID Flip Card Button */}
              <button
                type="button"
                onClick={() => setShowIdCard(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/20 hover:from-[#FF007A]/30 hover:to-[#FFA000]/30 text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/10 shadow active:scale-95"
                title="View 3D Digital Pye ID Card"
              >
                <QrCode className="w-3.5 h-3.5 text-[#FFA000]" />
                <span>Pye ID Card</span>
              </button>

              {isOwnProfile ? (
                <button
                  onClick={() => {
                    setEditFullName(profileUser.fullName);
                    setEditBio(profileUser.bio);
                    setEditAvatar(profileUser.avatar);
                    setEditBanner(profileUser.banner || '');
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-white/10 shadow"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                      isFollowing
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white'
                    }`}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </button>

                  <button
                    onClick={handleMessageClick}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 shadow"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF007A]" />
                    <span>Message</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Names, Verification, and Badges */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">
                {profileUser.fullName}
              </h1>
              <AccountBadge
                followersCount={profileUser.followersCount}
                isVerified={profileUser.isVerified}
                role={profileUser.role}
                size="md"
              />
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF007A]/15 text-[#FF007A] font-bold font-mono">
                {profileUser.pieId}
              </span>
            </div>
            <div className="text-xs text-zinc-400">@{profileUser.username}</div>
          </div>

          {/* Bio */}
          <p className="text-xs sm:text-sm text-zinc-300 mt-3 max-w-2xl leading-relaxed">
            {profileUser.bio || 'Pye user exploring the PYE Social Universe.'}
          </p>

          {/* Metrics bar (Clickable Followers & Following with Real Counts) */}
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-white/5 text-xs">
            <button
              type="button"
              onClick={() => handleOpenFollowModal('followers')}
              className="text-left hover:opacity-80 transition group focus:outline-none cursor-pointer"
            >
              <span className="font-mono font-bold text-white text-sm group-hover:text-[#FF007A]">
                {profileUser.followersCount}
              </span>{' '}
              <span className="text-zinc-400 group-hover:underline">Followers</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenFollowModal('following')}
              className="text-left hover:opacity-80 transition group focus:outline-none cursor-pointer"
            >
              <span className="font-mono font-bold text-white text-sm group-hover:text-[#FFA000]">
                {profileUser.followingCount}
              </span>{' '}
              <span className="text-zinc-400 group-hover:underline">Following</span>
            </button>

            <div>
              <span className="font-mono font-bold text-white text-sm">
                {profileUser.likesCount}
              </span>{' '}
              <span className="text-zinc-400">Likes</span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400 ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Posts, PYES, Saved (NO TUBE!) */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'posts'
              ? 'bg-[#FF007A]/20 text-white font-semibold border-b-2 border-[#FF007A]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Pulses ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shorts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'shorts'
              ? 'bg-[#FF007A]/20 text-white font-semibold border-b-2 border-[#FF007A]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>PYES ({pyesVideos.length})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'saved'
                ? 'bg-[#FF007A]/20 text-white font-semibold border-b-2 border-[#FF007A]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Vault ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT */}
      {/* 1. Pulses Feed */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 rounded-3xl bg-[#0f0f18] border border-white/5">
              No pulses broadcasted yet.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.fullName}
                      className="w-10 h-10 rounded-2xl bg-zinc-800 object-cover"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{post.author.fullName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {new Date(post.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPromoteItem({ item: post, type: 'post' })}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#FFA000] text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 transition"
                        title="Promote pulse with SPC"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Promote</span>
                      </button>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition"
                        title="Delete pulse"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed">{post.caption}</p>

                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/5 max-h-96">
                    <img src={post.mediaUrl} alt="" className="w-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-2 text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#FF007A]" />
                    {post.likesCount}
                  </span>
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. PYES Grid (Real Videos only) */}
      {activeTab === 'shorts' && (
        <div>
          {pyesVideos.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 rounded-3xl bg-[#0f0f18] border border-white/5">
              No PYES uploaded by this creator yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pyesVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={onNavigateToPyes}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/10 group cursor-pointer shadow-lg"
                >
                  <video
                    src={video.videoUrl}
                    poster={video.posterUrl}
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition" />

                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePyes(video.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-500/80 text-white z-20 backdrop-blur-md transition shadow"
                      title="Delete PYES"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 space-y-1">
                    <div className="text-[11px] font-bold text-white truncate drop-shadow">
                      {video.title || video.caption}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-mono">
                      <span className="flex items-center gap-1 text-[#FF007A]">
                        <Heart className="w-3 h-3 fill-current" />
                        {video.likesCount}
                      </span>
                      <span>{video.commentsCount} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Saved Vault */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedPosts.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 rounded-3xl bg-[#0f0f18] border border-white/5">
              No saved posts in your Vault yet.
            </div>
          ) : (
            savedPosts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 text-xs text-zinc-300"
              >
                <div className="font-semibold text-white mb-1">{p.author.fullName}</div>
                <p>{p.caption}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* COMPREHENSIVE EDIT PROFILE MODAL (Section 5, 6, 7) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-[#0f0f18] border border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <PyeLogo size={24} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Profile & Visual Settings
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Picture Controls */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="text-xs font-bold text-zinc-300">PROFILE PICTURE</div>
              <div className="flex items-center gap-3">
                <img
                  src={editAvatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-2xl bg-zinc-800 object-cover border border-white/10 shrink-0"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold shadow hover:opacity-95 transition"
                  >
                    CHANGE PROFILE PICTURE
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold transition"
                  >
                    REMOVE PROFILE PICTURE
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Banner Controls */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="text-xs font-bold text-zinc-300">PROFILE BANNER</div>
              <div className="aspect-[3/1] w-full rounded-xl bg-zinc-900 overflow-hidden relative border border-white/10">
                {editBanner ? (
                  <img src={editBanner} alt="Banner preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                    No custom banner set
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#FFA000]" />
                  <span>CHANGE BANNER</span>
                </button>
                {editBanner && (
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition"
                  >
                    REMOVE BANNER
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-xs font-bold text-white shadow-md hover:opacity-95 transition"
              >
                SAVE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Followers & Following Modal */}
      {showFollowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md h-[520px] rounded-3xl bg-[#0f0f18] border border-white/10 flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF007A]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {showFollowModal === 'followers' ? 'Followers' : 'Following'} ({followListUsers.length})
                </h3>
              </div>
              <button
                onClick={() => setShowFollowModal(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter */}
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={followSearch}
                  onChange={(e) => setFollowSearch(e.target.value)}
                  placeholder={`Search ${showFollowModal}...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
              {followListUsers
                .filter(
                  (u) =>
                    u.fullName.toLowerCase().includes(followSearch.toLowerCase()) ||
                    u.username.toLowerCase().includes(followSearch.toLowerCase())
                )
                .map((u) => {
                  const isFollowingUser = Storage.isFollowing(u.id);
                  const isMe = currentUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      className="p-3 rounded-2xl hover:bg-white/5 flex items-center justify-between gap-3 transition"
                    >
                      <button
                        onClick={() => {
                          setShowFollowModal(null);
                          if (onNavigateToProfile) onNavigateToProfile(u.id);
                        }}
                        className="flex items-center gap-3 min-w-0 text-left flex-1"
                      >
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full bg-zinc-800 object-cover ring-2 ring-white/10"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white truncate hover:text-[#FFA000]">
                              {u.fullName}
                            </span>
                            {u.isVerified && (
                              <CheckCircle className="w-3 h-3 text-[#FF007A] shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400">@{u.username}</div>
                          {u.bio && (
                            <div className="text-[10px] text-zinc-500 truncate max-w-[180px] mt-0.5">
                              {u.bio}
                            </div>
                          )}
                        </div>
                      </button>

                      {!isMe && currentUser && (
                        <button
                          onClick={() => {
                            Storage.toggleFollow(u.id);
                            if (showFollowModal === 'followers') {
                              setFollowListUsers(Storage.getFollowersUsers(profileUser.id));
                            } else {
                              setFollowListUsers(Storage.getFollowingUsers(profileUser.id));
                            }
                            setProfileUser(Storage.getUserById(profileUser.id));
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition shrink-0 ${
                            isFollowingUser
                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white shadow'
                          }`}
                        >
                          {isFollowingUser ? 'Following' : '+ Follow'}
                        </button>
                      )}
                    </div>
                  );
                })}
              {followListUsers.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No {showFollowModal} to display yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 3D Flipable Pye ID Card Modal */}
      {showIdCard && profileUser && (
        <PyeIdCardModal
          user={profileUser}
          isOpen={showIdCard}
          onClose={() => setShowIdCard(false)}
          onShowToast={showToast}
        />
      )}

      {/* Paid Post Promotion Modal (15 SPC / 60 SPC) */}
      {promoteItem && currentUser && (
        <PromotePostModal
          item={promoteItem.item}
          itemType={promoteItem.type}
          currentUser={currentUser}
          isOpen={Boolean(promoteItem)}
          onClose={() => setPromoteItem(null)}
          onSuccess={(msg) => showToast(msg)}
          onOpenWallet={() => {}}
        />
      )}
    </div>
  );
};
