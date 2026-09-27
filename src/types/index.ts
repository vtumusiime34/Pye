export type UserRole = 'user' | 'creator' | 'admin' | 'business';

export interface PrivacySettings {
  isPrivateAccount: boolean;
  whoCanMessage: 'everyone' | 'followers' | 'none';
  whoCanComment: 'everyone' | 'followers' | 'none';
  whoCanMention: 'everyone' | 'followers' | 'none';
  allowDownload: boolean;
  showActivityStatus: boolean;
}

export interface BusinessProfile {
  businessName: string;
  category: string;
  website?: string;
  contactEmail?: string;
  location?: string;
  description: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  registeredAt: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: 'boy' | 'girl' | 'other';
  birthDate?: string;
  avatar: string;
  banner?: string;
  bio: string;
  isVerified: boolean;
  pieId: string;
  role: UserRole;
  isBusiness?: boolean;
  businessProfile?: BusinessProfile;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  postsCount: number;
  shortsCount: number; // PYES count
  silverCoins: number; // SPC (Silver PYE Coins)
  goldCoins: number;   // GPC (Gold PYE Coins)
  privacySettings: PrivacySettings;
  createdAt: string;
  isDeactivated?: boolean;
}

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface LikeRelationship {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'short' | 'pyes' | 'tube' | 'comment' | 'sound';
  createdAt: string;
}

export interface PyeSpace {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  banner: string;
  category: string;
  sponsoredBy?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
  };
  caption: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  hashtags: string[];
  spaceSlug?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isPromoted?: boolean;
  createdAt: string;
}

// Officially called PYES (PYE's original short-form vertical video experience)
export interface PyesVideo {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
  };
  title?: string;
  caption: string;
  videoUrl: string;
  posterUrl: string;
  musicTitle?: string;
  musicAuthor?: string;
  hashtags: string[];
  spaceSlug?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  savesCount?: number;
  visibility?: 'public' | 'followers' | 'private';
  moderationStatus?: 'approved' | 'pending' | 'flagged';
  isLiked?: boolean;
  isSaved?: boolean;
  isPromoted?: boolean;
  createdAt: string;
}

// Alias for backward compatibility
export type ShortVideo = PyesVideo;

export interface Comment {
  id: string;
  targetId: string;
  targetType: 'post' | 'short' | 'pyes' | 'tube' | 'comment';
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
  };
  text: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface TubeVideo {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
    subscribersCount?: number;
  };
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  category: string;
  tags: string[];
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface LiveChatMessage {
  id: string;
  sender: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
  };
  text: string;
  timestamp: string;
  isHost?: boolean;
  isTip?: boolean;
  tipAmount?: number;
}

export interface LiveStream {
  id: string;
  hostId: string;
  host: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
  };
  title: string;
  category: string;
  coverImage: string;
  streamUrl: string;
  viewerCount: number;
  viewersCount?: number;
  likesCount: number;
  isLive: boolean;
  chatMessages: LiveChatMessage[];
  startedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface Conference {
  id: string;
  hostId: string;
  host: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
  };
  title: string;
  description: string;
  coverImage: string;
  scheduledDate: string;
  scheduledTime: string;
  maxParticipants: number;
  currentParticipants: number;
  participantIds?: string[];
  isJoined?: boolean;
  privacy: 'public' | 'private';
  speakers: string[];
  category: string;
  sponsoredBy?: string;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  currency: 'silver' | 'gold';
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface RankingItem {
  id: string;
  rank: number;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
    bio: string;
  };
  metricValue: number;
  metricLabel: string;
  category: 'pulse' | 'creators' | 'growth' | 'coins';
  trend: 'up' | 'down' | 'neutral';
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'conference' | 'system' | 'monetization' | 'welcome' | 'live';
  actor: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  content: string;
  targetId?: string;
  targetType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedItemId: string;
  reportedItemType: 'user' | 'post' | 'pyes' | 'short' | 'comment' | 'conference' | 'message';
  reportedTitle?: string;
  reason: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
}

export interface BlockedUser {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  blockedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface AccountAppeal {
  id: string;
  username: string;
  email: string;
  message: string;
  submittedAt: string;
  status: 'pending' | 'resolved' | 'rejected';
}

// --- Daily Missions System ---
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  rewardSilver: number;
  rewardGold: number;
  icon: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

// --- PYE Sounds System ---
export interface SoundTrack {
  id: string;
  title: string;
  artist: string;
  authorId?: string;
  authorAvatar?: string;
  audioUrl: string;
  coverUrl: string;
  duration: string;
  category: string;
  playsCount: number;
  likesCount: number;
  usageCount: number;
  tags?: string[];
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

// --- PYE Games System ---
export interface GameItem {
  id: 'chess' | 'checkers' | 'ludo' | 'tiktaktoe' | 'snakes_ladders' | 'monopoly';
  title: string;
  tagline: string;
  description: string;
  icon: string;
  badge: string;
  players: string;
  difficulty: 'Easy' | 'Medium' | 'Strategic';
}

export interface GameScoreRecord {
  id: string;
  userId: string;
  gameId: string;
  result: 'win' | 'loss' | 'draw';
  score: number;
  coinsEarned: number;
  opponentName: string;
  playedAt: string;
}

// --- Monetization & Advertising System ---
export type AdStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'rejected';

export interface Advertisement {
  id: string;
  advertiserName: string;
  advertiserId: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  destinationUrl: string;
  callToAction: string;
  category: string;
  startDate: string;
  endDate: string;
  budgetCoins: number;
  status: AdStatus;
  targetAudience: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface PromotedContent {
  id: string;
  contentId: string;
  contentType: 'post' | 'pyes';
  contentTitle: string;
  authorId: string;
  goal: 'more_profile_visits' | 'more_content_views' | 'more_website_visits' | 'more_followers';
  audience: 'all' | 'technology' | 'creative' | 'gaming';
  durationDays: number;
  budgetCoins: number;
  status: 'pending_review' | 'active' | 'completed' | 'rejected';
  createdAt: string;
}

export interface SponsoredSpaceRequest {
  id: string;
  sponsorName: string;
  spaceSlug: string;
  campaignTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  budgetCoins: number;
  status: 'pending' | 'approved' | 'active' | 'ended' | 'rejected';
  createdAt: string;
}

export interface BusinessProfile {
  businessName: string;
  category: string;
  website?: string;
  taxOrRegNumber?: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  monthlyRevenueCoins?: number;
  totalCustomers?: number;
  conversionRate?: number;
  registeredAt?: string;
}

export interface PaymentMethodConfig {
  id: string;
  type: 'card' | 'crypto' | 'bank_transfer' | 'pye_direct';
  label: string;
  last4?: string;
  brand?: string;
  expiry?: string;
  isDefault: boolean;
  status: 'active' | 'setup_required';
  createdAt: string;
}

export interface PaymentLedgerEntry {
  id: string;
  idempotencyKey: string;
  userId: string;
  amountCents: number;
  currency: string;
  pyeCoinAmount: number;
  gateway: 'stripe_mock' | 'crypto_mock' | 'pye_internal';
  status: 'succeeded' | 'processing' | 'requires_action' | 'failed';
  signatureHash: string;
  description: string;
  createdAt: string;
}

