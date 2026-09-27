import React, { useState, useRef } from 'react';
import {
  Settings,
  Shield,
  Lock,
  Eye,
  UserX,
  Bell,
  CheckCircle,
  HelpCircle,
  LogOut,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { User, PrivacySettings } from '../../types';
import { Storage } from '../../services/storage';
import { compressImageFile } from '../../utils/imageUtils';

interface SettingsViewProps {
  currentUser: User | null;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUserUpdated,
  onLogout,
  onOpenAuth,
}) => {
  if (!currentUser) {
    return (
      <div className="p-12 text-center text-zinc-400">
        Please sign in to configure your universe settings.
      </div>
    );
  }

  const [privacy, setPrivacy] = useState<PrivacySettings>(
    currentUser.privacySettings || {
      isPrivateAccount: false,
      whoCanMessage: 'everyone',
      whoCanComment: 'everyone',
      whoCanMention: 'everyone',
      allowDownload: true,
      showActivityStatus: true,
    }
  );

  const [blockedUsers, setBlockedUsers] = useState(() => Storage.getBlockedUsers());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Profile media states
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [bannerUrl, setBannerUrl] = useState(currentUser.banner || '');
  const [displayName, setDisplayName] = useState(currentUser.fullName);
  const [bioText, setBioText] = useState(currentUser.bio || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Avatar upload with compression
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading...');
    try {
      const compressed = await compressImageFile(file, { maxWidth: 350, maxHeight: 350, quality: 0.85 });
      setAvatarUrl(compressed);
      const updated = Storage.updateProfile({ avatar: compressed });
      if (updated) {
        onUserUpdated(updated);
        setUploadStatus('Profile updated');
        showToast('Profile picture updated successfully!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Profile picture could not be updated.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 2500);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Banner upload with compression
  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading...');
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1200, maxHeight: 450, quality: 0.82 });
      setBannerUrl(compressed);
      const updated = Storage.updateProfile({ banner: compressed });
      if (updated) {
        onUserUpdated(updated);
        setUploadStatus('Profile updated');
        showToast('Profile banner updated successfully!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Banner could not be updated.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 2500);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}&backgroundColor=FF007A,FFA000`;
    setAvatarUrl(defaultAvatar);
    const updated = Storage.updateProfile({ avatar: defaultAvatar });
    if (updated) {
      onUserUpdated(updated);
      showToast('Profile picture removed (reset to default)');
    }
  };

  const handleRemoveBanner = () => {
    setBannerUrl('');
    const updated = Storage.updateProfile({ banner: '' });
    if (updated) {
      onUserUpdated(updated);
      showToast('Profile banner removed');
    }
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = Storage.updateProfile({
      fullName: displayName.trim() || currentUser.fullName,
      bio: bioText.trim(),
      avatar: avatarUrl,
      banner: bannerUrl || undefined,
    });
    if (updated) {
      onUserUpdated(updated);
      showToast('Profile updated');
    }
  };

  const handleTogglePrivate = () => {
    const next = !privacy.isPrivateAccount;
    const updated = { ...privacy, isPrivateAccount: next };
    setPrivacy(updated);
    const res = Storage.updatePrivacySettings(updated);
    if (res) onUserUpdated(res);
    showToast(next ? 'Account set to Private' : 'Account set to Public');
  };

  const handleMessagePrivacyChange = (val: 'everyone' | 'followers' | 'none') => {
    const updated = { ...privacy, whoCanMessage: val };
    setPrivacy(updated);
    const res = Storage.updatePrivacySettings(updated);
    if (res) onUserUpdated(res);
    showToast(`Messaging privacy updated to: ${val}`);
  };

  const handleCommentPrivacyChange = (val: 'everyone' | 'followers' | 'none') => {
    const updated = { ...privacy, whoCanComment: val };
    setPrivacy(updated);
    const res = Storage.updatePrivacySettings(updated);
    if (res) onUserUpdated(res);
    showToast(`Comments privacy updated to: ${val}`);
  };

  const handleDownloadToggle = () => {
    const next = !privacy.allowDownload;
    const updated = { ...privacy, allowDownload: next };
    setPrivacy(updated);
    const res = Storage.updatePrivacySettings(updated);
    if (res) onUserUpdated(res);
    showToast(next ? 'Media downloads enabled' : 'Media downloads restricted');
  };

  const handleUnblock = (userId: string) => {
    Storage.unblockUser(userId);
    setBlockedUsers(Storage.getBlockedUsers());
    showToast('User unblocked');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20 select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#FF007A]/50 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}

      {/* Hidden file pickers */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarSelect}
        className="hidden"
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-1 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF007A] uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Account Controls & Identity</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-display">
          Settings & Security Center
        </h1>
        <p className="text-xs text-zinc-400">
          Manage your profile visuals, privacy safeguards, and universe preferences.
        </p>
      </div>

      {/* PROFILE VISUALS & MEDIA (Section 5, 6, 7) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            <Camera className="w-4 h-4 text-[#FFA000]" />
            <span>Profile Visuals & Branding</span>
          </div>
          {uploadStatus && (
            <span className="text-xs text-[#FF007A] font-bold flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {uploadStatus}
            </span>
          )}
        </div>

        {/* 1. Profile Picture Settings */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <div className="text-xs font-bold text-zinc-300">PROFILE PICTURE</div>
          <div className="flex flex-wrap items-center gap-4">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl bg-zinc-800 object-cover border-2 border-white/10 shadow-lg shrink-0"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white text-xs font-bold shadow hover:opacity-95 active:scale-95 transition"
              >
                CHANGE PROFILE PICTURE
              </button>
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold transition"
              >
                REMOVE PROFILE PICTURE
              </button>
            </div>
          </div>
        </div>

        {/* 2. Profile Banner Settings */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <div className="text-xs font-bold text-zinc-300">PROFILE BANNER</div>
          <div className="aspect-[3/1] w-full rounded-2xl bg-zinc-900 overflow-hidden relative border border-white/10 shadow-inner">
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                No custom banner uploaded yet
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#FFA000]" />
              <span>CHANGE BANNER</span>
            </button>
            {bannerUrl && (
              <button
                type="button"
                onClick={handleRemoveBanner}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition"
              >
                REMOVE BANNER
              </button>
            )}
          </div>
        </div>

        {/* Display Name & Bio */}
        <form onSubmit={handleSaveMedia} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Bio</label>
            <textarea
              rows={2}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
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

      {/* Privacy Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-sm font-bold text-white uppercase tracking-wider">
          <Shield className="w-4 h-4 text-[#FFA000]" />
          <span>Audience & Privacy Safeguards</span>
        </div>

        {/* Private Account Toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-xs font-bold text-white">Private Account</div>
            <div className="text-[11px] text-zinc-400">
              When enabled, only accounts you approve can see your posts and PYES.
            </div>
          </div>
          <button
            onClick={handleTogglePrivate}
            className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
              privacy.isPrivateAccount ? 'bg-[#FF007A] justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Messaging Permissions */}
        <div className="py-2 border-t border-white/5 space-y-1.5">
          <div className="text-xs font-bold text-white">Direct Messaging Access</div>
          <div className="text-[11px] text-zinc-400">Control who can send you direct transmissions.</div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['everyone', 'followers', 'none'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleMessagePrivacyChange(opt)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                  privacy.whoCanMessage === opt
                    ? 'bg-[#FF007A]/20 border-[#FF007A] text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Permissions */}
        <div className="py-2 border-t border-white/5 space-y-1.5">
          <div className="text-xs font-bold text-white">Comments on Your Content</div>
          <div className="text-[11px] text-zinc-400">Who can leave comments on your pulses and PYES.</div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['everyone', 'followers', 'none'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleCommentPrivacyChange(opt)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                  privacy.whoCanComment === opt
                    ? 'bg-[#FF007A]/20 border-[#FF007A] text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Media Download Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-white/5">
          <div>
            <div className="text-xs font-bold text-white">Allow Media Downloads</div>
            <div className="text-[11px] text-zinc-400">Permit others to save your pulses or PYES.</div>
          </div>
          <button
            onClick={handleDownloadToggle}
            className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
              privacy.allowDownload ? 'bg-[#FF007A] justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Blocked Accounts Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-sm font-bold text-white uppercase tracking-wider">
          <UserX className="w-4 h-4 text-rose-500" />
          <span>Restricted & Blocked Accounts ({blockedUsers.length})</span>
        </div>

        {blockedUsers.length === 0 ? (
          <div className="text-xs text-zinc-500 py-3">No pioneers currently blocked.</div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img src={b.avatar} alt="" className="w-8 h-8 rounded-full bg-zinc-800 object-cover" />
                  <div>
                    <div className="font-bold text-white">{b.fullName}</div>
                    <div className="text-[10px] text-zinc-400">@{b.username}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(b.id)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold transition"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="p-5 rounded-3xl bg-[#0f0f18] border border-white/5 flex items-center justify-between shadow-xl">
        <div>
          <div className="text-xs font-bold text-white">Session Security</div>
          <div className="text-[11px] text-zinc-400">Safely log out of your current device.</div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
