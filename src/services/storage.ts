import {
  User,
  Post,
  PyesVideo,
  Comment,
  Conference,
  CoinTransaction,
  RankingItem,
  Conversation,
  NotificationItem,
  SafetyReport,
  BlockedUser,
  AuditLog,
  AccountAppeal,
  FollowRelationship,
  LikeRelationship,
  PyeSpace,
  DailyMission,
  SoundTrack,
  Advertisement,
  PromotedContent,
  BusinessProfile,
  SponsoredSpaceRequest,
  AdStatus,
  DirectMessage,
  TubeVideo,
  LiveStream,
  LiveChatMessage,
  GameScoreRecord,
  PaymentMethodConfig,
  PaymentLedgerEntry,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'pye_current_user',
  USERS: 'pye_users',
  CREDENTIALS: 'pye_credentials',
  FOLLOWS: 'pye_follows',
  LIKES: 'pye_likes',
  POSTS: 'pye_posts',
  SHORTS: 'pye_pyes_reels', // Official PYES storage
  COMMENTS: 'pye_comments',
  CONFERENCES: 'pye_conferences',
  TRANSACTIONS: 'pye_transactions',
  CONVERSATIONS: 'pye_conversations',
  NOTIFICATIONS: 'pye_notifications',
  REPORTS: 'pye_reports',
  BLOCKED_USERS: 'pye_blocked_users',
  AUDIT_LOGS: 'pye_audit_logs',
  APPEALS: 'pye_appeals',
  SPACES: 'pye_spaces',
  MISSIONS: 'pye_daily_missions',
  SOUNDS: 'pye_sounds',
  SAVED_SOUNDS: 'pye_saved_sounds',
  ADS: 'pye_ads',
  PROMOTIONS: 'pye_promotions',
  BUSINESS: 'pye_business',
  SPONSORED_SPACES: 'pye_sponsored_spaces',
  PAYMENT_METHODS: 'pye_payment_methods',
  PAYMENT_LEDGER: 'pye_payment_ledger',
  GAME_RECORDS: 'pye_game_records',
};

// SHA-256 password hashing utility for real authentication security
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'pye_salt_secure_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Built-in PYE Spaces
export const PYE_SPACES: PyeSpace[] = [
  {
    id: 'space_tech',
    name: 'Technology & AI',
    slug: 'technology',
    description: 'Spatial computing, neural interfaces, open architecture, and high-performance software.',
    icon: '🚀',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    category: 'Technology',
    sponsoredBy: 'NeuroWave Labs',
  },
  {
    id: 'space_gaming',
    name: 'Gaming & XR',
    slug: 'gaming',
    description: 'Virtual worlds, multiplayer arcades, interactive simulations, and engine tech.',
    icon: '🎮',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
    category: 'Entertainment',
  },
  {
    id: 'space_music',
    name: 'Music & Audio',
    slug: 'music',
    description: 'Modular synthesis, spatial acoustic stems, generative frequencies, and original soundbites.',
    icon: '🎵',
    banner: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80',
    category: 'Creative',
  },
  {
    id: 'space_science',
    name: 'Science & Cosmos',
    slug: 'science',
    description: 'Astrophysics, planetary data, quantum computing, and frontier physics.',
    icon: '🔬',
    banner: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1000&auto=format&fit=crop&q=80',
    category: 'Education',
  },
  {
    id: 'space_art',
    name: 'Art & Motion',
    slug: 'art',
    description: 'Generative shaders, 3D motion design, typography, and visual installations.',
    icon: '🎨',
    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
    category: 'Creative',
    sponsoredBy: 'CyberLoom Design Co.',
  },
  {
    id: 'space_future',
    name: 'Future & Protocols',
    slug: 'future',
    description: 'Open protocols, cryptographic identity, decentralized social networks, and spatial worlds.',
    icon: '🌐',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    category: 'Future',
  },
];

// Foundational genuine accounts: 3 female creators, 3 male creators, 1 official PYE channel
export const OFFICIAL_PYE_USER: User = {
  id: 'user_pye_official',
  username: 'pye',
  fullName: 'PYE Social Universe',
  email: 'official@pye.universe',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PyeOfficial&backgroundColor=FF007A,FFA000',
  banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  bio: 'The official broadcast center for PYE Social Universe. Your World. Your People.',
  isVerified: true,
  pieId: 'PYE-0001',
  role: 'admin',
  followersCount: 0,
  followingCount: 0,
  likesCount: 0,
  postsCount: 1,
  shortsCount: 3,
  silverCoins: 10000,
  goldCoins: 500,
  privacySettings: {
    isPrivateAccount: false,
    whoCanMessage: 'everyone',
    whoCanComment: 'everyone',
    whoCanMention: 'everyone',
    allowDownload: true,
    showActivityStatus: true,
  },
  createdAt: '2026-01-01T00:00:00Z',
};

// Girls (community creators)
export const MAYA_USER: User = {
  id: 'user_maya',
  username: 'maya',
  fullName: 'Maya Lin',
  email: 'maya@pye.universe',
  gender: 'girl',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MayaLin&backgroundColor=FF007A,FFA000',
  banner: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
  bio: 'Modular synth pioneer and generative acoustic designer. Connecting soundwaves across PYES.',
  isVerified: true,
  pieId: 'PYE-0002',
  role: 'creator',
  followersCount: 0,
  followingCount: 0,
  likesCount: 0,
  postsCount: 1,
  shortsCount: 2,
  silverCoins: 1500,
  goldCoins: 80,
  privacySettings: {
    isPrivateAccount: false,
    whoCanMessage: 'everyone',
    whoCanComment: 'everyone',
    whoCanMention: 'everyone',
    allowDownload: true,
    showActivityStatus: true,
  },
  createdAt: '2026-02-15T00:00:00Z',
};

export const ELENA_USER: User = {
  id: 'user_elena',
  username: 'elena',
  fullName: 'Elena Orbit',
  email: 'elena@pye.universe',
  gender: 'girl',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaOrbit&backgroundColor=FF007A,FFA000',
  banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
  bio: 'Visual artist exploring kinetic 3D geometries and volumetric raytracing.',
  isVerified: true,
  pieId: 'PYE-0004',
  role: 'creator',
  followersCount: 0,
  followingCount: 0,
  likesCount: 0,
  postsCount: 1,
  shortsCount: 1,
  silverCoins: 850,
  goldCoins: 40,
  privacySettings: {
    isPrivateAccount: false,
    whoCanMessage: 'everyone',
    whoCanComment: 'everyone',
    whoCanMention: 'everyone',
    allowDownload: true,
    showActivityStatus: true,
  },
  createdAt: '2026-02-20T00:00:00Z',
};

export const SOPHIA_USER: User = {
  id: 'user_sophia',
  username: 'sophia',
  fullName: 'Sophia Art',
  email: 'sophia@pye.universe',
  gender: 'girl',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SophiaArt&backgroundColor=FF007A,FFA000',
  banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
  bio: 'Interface architect and neural UI designer for futuristic spatial worlds.',
  isVerified: true,
  pieId: 'PYE-0006',
  role: 'creator',
  followersCount: 0,
  followingCount: 0,
  likesCount: 0,
  postsCount: 1,
  shortsCount: 1,
  silverCoins: 720,
  goldCoins: 35,
  privacySettings: {
    isPrivateAccount: false,
    whoCanMessage: 'everyone',
    whoCanComment: 'everyone',
    whoCanMention: 'everyone',
    allowDownload: true,
    showActivityStatus: true,
  },
  createdAt: '2026-03-05T00:00:00Z',
};

// Boys (community creators)
export const ALEX_USER: User = {
  id: 'user_alex',
  username: 'alex',
  fullName: 'Alex Vance',
  email: 'alex@pye.universe',
  gender: 'boy',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexVance&backgroundColor=FF007A,FFA000',
  banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
  bio: 'Spatial computing engineer building neural UI protocols. Exploring the edge of the universe.',
  isVerified: true,
  pieId: 'PYE-0003',
  role: 'creator',
  followersCount: 0,
  followingCount: 0,
  likesCount: 0,
  postsCount: 1,
  shortsCount: 1,
  silverCoins: 2000,
  goldCoins: 120,
  privacySettings: {
    isPrivateAccount: false,
    whoCanMessage: 'everyone',
    whoCanComment: 'everyone',
    whoCanMention: 'everyone',
    allowDownload: true,
    showActivityStatus: true,
  },
  createdAt: '2026-03-01T00:00:00Z',
};

export const ZENO_USER: User = {
  id: 'user_zeno',
  username: 'zeno',
  fullName: 'Zeno Space',
  email: 'zeno@pye.universe',
  gender: 'boy',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ZenoSpace&backgroundColor=FF007A,FFA000',
  banner: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80',
  bio: 'Deep space astronomer and generative algorithmic artist.',
  isVerified: true,
  pieId: 'PYE-0005',
  role: 'creator',
  followersCount: 0,
  followingCount: 0,
  likesCount: 0,
  postsCount: 1,
  shortsCount: 1,
  silverCoins: 650,
  goldCoins: 25,
  privacySettings: {
    isPrivateAccount: false,
    whoCanMessage: 'everyone',
    whoCanComment: 'everyone',
    whoCanMention: 'everyone',
    allowDownload: true,
    showActivityStatus: true,
  },
  createdAt: '2026-02-25T00:00:00Z',
};

export const KAI_USER: User = {
  id: 'user_kai',
  username: 'kai',
  fullName: 'Kai Tech',
  email: 'kai@pye.universe',
  gender: 'boy',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KaiTech&backgroundColor=FF007A,FFA000',
  banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  bio: 'Game designer and open network protocol enthusiast. Playing Chess & Ludo in PYE Arcade.',
  isVerified: true,
  pieId: 'PYE-0007',
  role: 'creator',
  followersCount: 0,
  followingCount: 0,
  likesCount: 0,
  postsCount: 1,
  shortsCount: 1,
  silverCoins: 900,
  goldCoins: 50,
  privacySettings: {
    isPrivateAccount: false,
    whoCanMessage: 'everyone',
    whoCanComment: 'everyone',
    whoCanMention: 'everyone',
    allowDownload: true,
    showActivityStatus: true,
  },
  createdAt: '2026-03-10T00:00:00Z',
};

export const SEED_USERS: User[] = [
  OFFICIAL_PYE_USER,
  MAYA_USER,
  ELENA_USER,
  SOPHIA_USER,
  ALEX_USER,
  ZENO_USER,
  KAI_USER,
];

// Initial welcome post from PYE
const WELCOME_POST: Post = {
  id: 'post_welcome',
  authorId: OFFICIAL_PYE_USER.id,
  author: {
    id: OFFICIAL_PYE_USER.id,
    username: OFFICIAL_PYE_USER.username,
    fullName: OFFICIAL_PYE_USER.fullName,
    avatar: OFFICIAL_PYE_USER.avatar,
    isVerified: true,
  },
  caption: 'Welcome to PYE Social Universe! 🚀\n\nPYE brings together PYES vertical reels, original sounds, multiplayer games, conferences, and thematic spaces into one connected universe. Create your account, customize your profile and banner, and share your first pulse!',
  mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
  mediaType: 'image',
  hashtags: ['PYEUniverse', 'Welcome', 'PYES'],
  spaceSlug: 'future',
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  createdAt: '2026-09-26T00:00:00Z',
};

// High-fidelity starter PYES videos (fast, verified CDN videos)
const STARTER_PYES: PyesVideo[] = [
  {
    id: 'pyes_1',
    authorId: OFFICIAL_PYE_USER.id,
    author: {
      id: OFFICIAL_PYE_USER.id,
      username: OFFICIAL_PYE_USER.username,
      fullName: OFFICIAL_PYE_USER.fullName,
      avatar: OFFICIAL_PYE_USER.avatar,
      isVerified: true,
    },
    title: 'Deep Oceanic Luminescence & Spatial Waves',
    caption: 'Experience the 60fps vertical reel pipeline in PYES. Tap twice to heart! ✨ #ocean #PYES #ambient',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80',
    musicTitle: 'Oceanic Resonator 432Hz — PYE Sound Labs',
    musicAuthor: 'PYE Sound Labs',
    hashtags: ['ocean', 'PYES', 'visuals', 'ambient'],
    spaceSlug: 'art',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 1,
    createdAt: '2026-09-26T12:00:00Z',
  },
  {
    id: 'pyes_2',
    authorId: MAYA_USER.id,
    author: {
      id: MAYA_USER.id,
      username: MAYA_USER.username,
      fullName: MAYA_USER.fullName,
      avatar: MAYA_USER.avatar,
      isVerified: true,
    },
    title: 'Electric Synth Acoustic Waves & Neon Pulse',
    caption: 'Synthesizing kinetic waveform harmonies across frequencies. Turn audio on! 🎧 #modular #synth #sounddesign #PYES',
    videoUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/echo-hereweare.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
    musicTitle: 'Echoes of the Universe — Maya Lin',
    musicAuthor: 'Maya Lin',
    hashtags: ['modular', 'synth', 'sounddesign', 'PYES'],
    spaceSlug: 'music',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 1,
    createdAt: '2026-09-25T18:00:00Z',
  },
  {
    id: 'pyes_3',
    authorId: ALEX_USER.id,
    author: {
      id: ALEX_USER.id,
      username: ALEX_USER.username,
      fullName: ALEX_USER.fullName,
      avatar: ALEX_USER.avatar,
      isVerified: true,
    },
    title: 'Chromatic Blooming | Generative Flora Simulation',
    caption: 'Generative petals unfurling in real-time raytraced simulation. #generative #3d #flora #art #PYES',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    musicTitle: 'Chromatic Flow — Alex Vance',
    musicAuthor: 'Alex Vance',
    hashtags: ['generative', '3d', 'technology', 'art', 'PYES'],
    spaceSlug: 'technology',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 1,
    createdAt: '2026-09-24T15:30:00Z',
  },
  {
    id: 'pyes_4',
    authorId: OFFICIAL_PYE_USER.id,
    author: {
      id: OFFICIAL_PYE_USER.id,
      username: OFFICIAL_PYE_USER.username,
      fullName: OFFICIAL_PYE_USER.fullName,
      avatar: OFFICIAL_PYE_USER.avatar,
      isVerified: true,
    },
    title: '3D Spatial Character & Kinetic Motion',
    caption: 'Rendering high-framerate character animation on mobile & desktop. #animation #3d #PYES',
    videoUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/big_buck_bunny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    musicTitle: 'Spatial Engine Suite — PYE Studio',
    musicAuthor: 'PYE Sound Labs',
    hashtags: ['animation', 'cinema', 'PYES'],
    spaceSlug: 'cinema',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 1,
    createdAt: '2026-09-23T11:00:00Z',
  },
  {
    id: 'pyes_5',
    authorId: MAYA_USER.id,
    author: {
      id: MAYA_USER.id,
      username: MAYA_USER.username,
      fullName: MAYA_USER.fullName,
      avatar: MAYA_USER.avatar,
      isVerified: true,
    },
    title: 'Friday Cyber Rhythm & Visualizer Spectrum',
    caption: 'Friday night frequency oscillation inside the PYE music community. #beats #electronic #PYES',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
    musicTitle: 'Friday Oscillation — Maya Lin',
    musicAuthor: 'Maya Lin',
    hashtags: ['beats', 'electronic', 'music', 'PYES'],
    spaceSlug: 'music',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 1,
    createdAt: '2026-09-22T20:00:00Z',
  },
];

// Starter Sounds
const STARTER_SOUNDS: SoundTrack[] = [
  {
    id: 'snd_1',
    title: 'Cyber Neon Resonance 432Hz',
    artist: 'PYE Sound Labs',
    authorId: OFFICIAL_PYE_USER.id,
    authorAvatar: OFFICIAL_PYE_USER.avatar,
    audioUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/AirReview-Landmarks-02-ChasingCorporate.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
    duration: '2:45',
    category: 'Electronic',
    playsCount: 1420,
    likesCount: 312,
    usageCount: 18,
    tags: ['Cyber', 'Neon', 'Electronic', 'Bass'],
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'snd_2',
    title: 'Echoes of the Universe',
    artist: 'Maya Lin',
    authorId: MAYA_USER.id,
    authorAvatar: MAYA_USER.avatar,
    audioUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/AirReview-Landmarks-02-ChasingCorporate.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&auto=format&fit=crop&q=80',
    duration: '3:10',
    category: 'Synthwave',
    playsCount: 980,
    likesCount: 245,
    usageCount: 12,
    tags: ['Space', 'Synthwave', 'Vibe'],
    createdAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'snd_3',
    title: 'Chromatic Flow & Spatial Acoustics',
    artist: 'Alex Vance',
    authorId: ALEX_USER.id,
    authorAvatar: ALEX_USER.avatar,
    audioUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/AirReview-Landmarks-02-ChasingCorporate.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    duration: '1:50',
    category: 'Ambient',
    playsCount: 650,
    likesCount: 180,
    usageCount: 7,
    tags: ['Ambient', 'Chill', 'Acoustic'],
    createdAt: '2026-09-10T00:00:00Z',
  },
];

// Default Daily Missions
const DEFAULT_MISSIONS: DailyMission[] = [
  {
    id: 'watch_pyes',
    title: 'Watch 3 PYES Reels',
    description: 'Immerse in the PYES vertical cinema feed',
    rewardSilver: 5,
    rewardGold: 0,
    icon: 'Flame',
    progress: 0,
    target: 3,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'share_pulse',
    title: 'Broadcast a Pulse / PYES',
    description: 'Share a pulse or PYES with the universe',
    rewardSilver: 5,
    rewardGold: 1,
    icon: 'Send',
    progress: 0,
    target: 1,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'give_likes',
    title: 'Heart 3 Pulses / PYES',
    description: 'Show appreciation to fellow pioneers',
    rewardSilver: 3,
    rewardGold: 0,
    icon: 'Heart',
    progress: 0,
    target: 3,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'play_game',
    title: 'Play 1 PYE Arcade Game',
    description: 'Play Chess, Checkers, Ludo, or TikTakToe',
    rewardSilver: 5,
    rewardGold: 1,
    icon: 'Gamepad2',
    progress: 0,
    target: 1,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'listen_sound',
    title: 'Listen to a PYE Sound',
    description: 'Tune into acoustic soundbites in Sounds',
    rewardSilver: 2,
    rewardGold: 0,
    icon: 'Music',
    progress: 0,
    target: 1,
    isCompleted: false,
    isClaimed: false,
  },
];

// Starter Advertisements (Monetization Architecture)
const STARTER_ADS: Advertisement[] = [
  {
    id: 'ad_neurowave',
    advertiserName: 'NeuroWave Labs',
    advertiserId: 'user_alex',
    title: 'Spatial Audio Synthesizer 2.0',
    description: 'Next-gen binaural audio modeling for XR environments and sound engineers.',
    mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    destinationUrl: 'https://pye.universe/neurowave',
    callToAction: 'Explore Tech',
    category: 'Technology',
    startDate: '2026-09-20',
    endDate: '2026-10-20',
    budgetCoins: 500,
    status: 'active',
    targetAudience: 'Technology, Creative, XR',
    impressions: 124,
    clicks: 18,
    createdAt: '2026-09-20T00:00:00Z',
  },
  {
    id: 'ad_cyberloom',
    advertiserName: 'CyberLoom Design Co.',
    advertiserId: 'user_maya',
    title: 'Generative 3D Shaders & Motion Packs',
    description: 'Pre-rendered neon meshes and procedural materials for creators.',
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    destinationUrl: 'https://pye.universe/cyberloom',
    callToAction: 'View Collection',
    category: 'Creative',
    startDate: '2026-09-22',
    endDate: '2026-10-22',
    budgetCoins: 400,
    status: 'active',
    targetAudience: 'Design, Art, Future',
    impressions: 89,
    clicks: 12,
    createdAt: '2026-09-22T00:00:00Z',
  },
];

class StorageService {
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable', e);
    }
  }

  public init(): void {
    // Users table
    const existingUsers = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    if (!existingUsers || existingUsers.length === 0) {
      this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
    } else {
      const updated = [...existingUsers];
      for (const su of SEED_USERS) {
        if (!updated.some((u) => u.id === su.id || u.username.toLowerCase() === su.username.toLowerCase())) {
          updated.push(su);
        }
      }
      this.setItem(STORAGE_KEYS.USERS, updated);
    }

    // Follows
    if (!localStorage.getItem(STORAGE_KEYS.FOLLOWS)) {
      this.setItem(STORAGE_KEYS.FOLLOWS, []);
    }
    // Likes
    if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
      this.setItem(STORAGE_KEYS.LIKES, []);
    }
    // Posts
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      this.setItem(STORAGE_KEYS.POSTS, [WELCOME_POST]);
    }
    // PYES
    const existingPyes = this.getItem<PyesVideo[]>(STORAGE_KEYS.SHORTS, []);
    if (!existingPyes || existingPyes.length === 0 || existingPyes.some((s) => s.videoUrl?.includes('mixkit'))) {
      this.setItem(STORAGE_KEYS.SHORTS, STARTER_PYES);
    }
    // Spaces
    if (!localStorage.getItem(STORAGE_KEYS.SPACES)) {
      this.setItem(STORAGE_KEYS.SPACES, PYE_SPACES);
    }
    // Conferences
    if (!localStorage.getItem(STORAGE_KEYS.CONFERENCES)) {
      this.setItem(STORAGE_KEYS.CONFERENCES, [
        {
          id: 'conf_pye_launch',
          hostId: OFFICIAL_PYE_USER.id,
          host: {
            id: OFFICIAL_PYE_USER.id,
            username: OFFICIAL_PYE_USER.username,
            fullName: OFFICIAL_PYE_USER.fullName,
            avatar: OFFICIAL_PYE_USER.avatar,
            isVerified: true,
          },
          title: 'PYE Social Universe Welcome Summit',
          description: 'Official inaugural conference for pioneers, creators, and developers building on PYE.',
          coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
          scheduledDate: '2026-10-01',
          scheduledTime: '18:00 UTC',
          maxParticipants: 1000,
          currentParticipants: 0,
          participantIds: [],
          isJoined: false,
          privacy: 'public',
          speakers: ['PYE Social Universe', 'Maya Lin', 'Alex Vance'],
          category: 'Technology',
          sponsoredBy: 'NeuroWave Labs',
          createdAt: '2026-09-26T00:00:00Z',
        },
      ]);
    }
    // Sounds
    if (!localStorage.getItem(STORAGE_KEYS.SOUNDS)) {
      this.setItem(STORAGE_KEYS.SOUNDS, STARTER_SOUNDS);
    }
    // Missions
    if (!localStorage.getItem(STORAGE_KEYS.MISSIONS)) {
      this.setItem(STORAGE_KEYS.MISSIONS, DEFAULT_MISSIONS);
    }
    // Ads
    if (!localStorage.getItem(STORAGE_KEYS.ADS)) {
      this.setItem(STORAGE_KEYS.ADS, STARTER_ADS);
    }
    // Promotions
    if (!localStorage.getItem(STORAGE_KEYS.PROMOTIONS)) {
      this.setItem(STORAGE_KEYS.PROMOTIONS, []);
    }
    // Transactions
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      this.setItem(STORAGE_KEYS.TRANSACTIONS, []);
    }
    // Notifications
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, []);
    }
    // Conversations
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      this.setItem(STORAGE_KEYS.CONVERSATIONS, []);
    }
  }

  // --- Real Authentication & Sessions ---
  public getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  public getUsers(): User[] {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const follows = this.getFollows();
    const likes = this.getLikes();
    const posts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
    const pyes = this.getItem<PyesVideo[]>(STORAGE_KEYS.SHORTS, []);

    return users.map((u) => {
      const actualFollowers = follows.filter((f) => f.followingId === u.id).length;
      const actualFollowing = follows.filter((f) => f.followerId === u.id).length;
      const userPosts = posts.filter((p) => p.authorId === u.id);
      const userPyes = pyes.filter((p) => p.authorId === u.id);
      const userContentIds = [...userPosts.map((p) => p.id), ...userPyes.map((p) => p.id)];
      const actualLikesReceived = likes.filter((l) => userContentIds.includes(l.targetId)).length;

      return {
        ...u,
        followersCount: actualFollowers,
        followingCount: actualFollowing,
        postsCount: userPosts.length,
        shortsCount: userPyes.length,
        likesCount: actualLikesReceived,
      };
    });
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    return this.getUsers().find((u) => u.username.toLowerCase() === clean);
  }

  public checkUsernameAvailability(username: string): { available: boolean; suggestions: string[] } {
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    if (!clean || clean.length < 3) return { available: false, suggestions: [] };
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const exists = users.some((u) => u.username.toLowerCase() === clean);
    if (!exists) {
      return { available: true, suggestions: [] };
    }
    const suggestions = [
      `${clean}_pye`,
      `${clean}${Math.floor(Math.random() * 89 + 10)}`,
      `the_${clean}`,
      `${clean}_universe`,
    ];
    return { available: false, suggestions };
  }

  public async register(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    gender?: 'boy' | 'girl' | 'other';
    birthDate?: string;
  }): Promise<{ ok: boolean; user?: User; error?: string }> {
    const cleanUser = data.username.replace(/^@/, '').toLowerCase().trim();
    if (cleanUser.length < 3) {
      return { ok: false, error: 'Username must be at least 3 characters long.' };
    }
    if (!/^[a-z0-9_]+$/.test(cleanUser)) {
      return { ok: false, error: 'Username may only contain letters, numbers, and underscores.' };
    }

    const check = this.checkUsernameAvailability(cleanUser);
    if (!check.available) {
      return { ok: false, error: 'Username is already registered. Please choose another username.' };
    }

    // Check duplicate email
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      return { ok: false, error: 'An account with this email address already exists.' };
    }

    // Securely hash password
    const hashedPassword = await hashPassword(data.password);
    const credentials = this.getItem<Record<string, string>>(STORAGE_KEYS.CREDENTIALS, {});
    credentials[cleanUser] = hashedPassword;
    credentials[data.email.toLowerCase().trim()] = hashedPassword;
    this.setItem(STORAGE_KEYS.CREDENTIALS, credentials);

    const randomPieId = `PYE-${Math.floor(Math.random() * 8999 + 1000)}`;
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}&backgroundColor=FF007A,FFA000`;

    // Real new user: Exactly 15 SPC and 2 GPC! No phone required.
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: cleanUser,
      fullName: data.fullName.trim() || cleanUser,
      email: data.email.toLowerCase().trim(),
      gender: data.gender || 'boy',
      birthDate: data.birthDate,
      avatar,
      bio: 'New citizen in the PYE Social Universe! 🚀',
      isVerified: false,
      pieId: randomPieId,
      role: 'user',
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
      postsCount: 0,
      shortsCount: 0,
      silverCoins: 15, // Free 15 SPC
      goldCoins: 2,    // Free 2 GPC
      privacySettings: {
        isPrivateAccount: false,
        whoCanMessage: 'everyone',
        whoCanComment: 'everyone',
        whoCanMention: 'everyone',
        allowDownload: true,
        showActivityStatus: true,
      },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(newUser);

    // Initial coin grants logged in authoritative ledger
    this.addTransaction({
      userId: newUser.id,
      currency: 'silver',
      type: 'credit',
      amount: 15,
      reason: 'Citizen Welcome Bonus (15 SPC)',
    });
    this.addTransaction({
      userId: newUser.id,
      currency: 'gold',
      type: 'credit',
      amount: 2,
      reason: 'Citizen Welcome Bonus (2 GPC)',
    });

    // No fake followers! User starts with 0 real followers.
    // Official welcome notification from APPIX Team (LTG, Trix & CJ)
    this.addNotification({
      type: 'welcome',
      actor: {
        id: 'appix_team',
        username: 'appix',
        fullName: 'APPIX Team',
        avatar: '/assets/pye-logo.svg',
      },
      content: "Welcome to PYE Social Universe!\n\nWelcome to PYE. We're excited to have you here.\n\n— LTG, Trix & CJ\nAPPIX Team",
      targetId: newUser.id,
      targetType: 'system',
    });

    return { ok: true, user: newUser };
  }

  public async login(
    usernameOrEmail: string,
    password?: string
  ): Promise<{ ok: boolean; user?: User; error?: string; code?: string }> {
    const clean = usernameOrEmail.replace(/^@/, '').toLowerCase().trim();
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!user) {
      return { ok: false, error: 'No account found matching this username or email.' };
    }

    if (user.isDeactivated) {
      return { ok: false, error: 'This account has been deactivated.', code: 'deactivated' };
    }

    if (password) {
      const credentials = this.getItem<Record<string, string>>(STORAGE_KEYS.CREDENTIALS, {});
      const storedHash = credentials[user.username.toLowerCase()] || credentials[user.email.toLowerCase()];
      if (storedHash) {
        const inputHash = await hashPassword(password);
        if (storedHash !== inputHash) {
          return { ok: false, error: 'Incorrect password. Please verify and try again.' };
        }
      }
    }

    this.setCurrentUser(user);
    return { ok: true, user };
  }

  public logout(): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, null);
  }

  public updateProfile(updates: Partial<User>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updates };
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []).map((u) =>
      u.id === current.id ? updated : u
    );
    this.setItem(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(updated);
    return updated;
  }

  public updatePrivacySettings(settings: Partial<User['privacySettings']>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    return this.updateProfile({
      privacySettings: { ...current.privacySettings, ...settings },
    });
  }

  // --- Real Follow Relationships ---
  public getFollows(): FollowRelationship[] {
    return this.getItem<FollowRelationship[]>(STORAGE_KEYS.FOLLOWS, []);
  }

  public isFollowing(userId: string): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;
    const follows = this.getFollows();
    return follows.some((f) => f.followerId === current.id && f.followingId === userId);
  }

  public getFollowing(userId: string): FollowRelationship[] {
    return this.getFollows().filter((f) => f.followerId === userId);
  }

  public toggleFollow(targetUserId: string): boolean {
    const current = this.getCurrentUser();
    if (!current || current.id === targetUserId) return false;

    let follows = this.getFollows();
    const existingIndex = follows.findIndex(
      (f) => f.followerId === current.id && f.followingId === targetUserId
    );

    let isNowFollowing = false;

    if (existingIndex >= 0) {
      follows.splice(existingIndex, 1);
      isNowFollowing = false;
    } else {
      follows.push({
        id: `flw_${Date.now()}`,
        followerId: current.id,
        followingId: targetUserId,
        createdAt: new Date().toISOString(),
      });
      isNowFollowing = true;

      this.addNotification({
        type: 'follow',
        actor: {
          id: current.id,
          username: current.username,
          fullName: current.fullName,
          avatar: current.avatar,
        },
        content: 'started following your PYE universe',
        targetId: targetUserId,
      });
    }

    this.setItem(STORAGE_KEYS.FOLLOWS, follows);
    return isNowFollowing;
  }

  // --- Real Likes System ---
  public getLikes(): LikeRelationship[] {
    return this.getItem<LikeRelationship[]>(STORAGE_KEYS.LIKES, []);
  }

  public isLiked(targetId: string): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;
    return this.getLikes().some((l) => l.userId === current.id && l.targetId === targetId);
  }

  public toggleLike(
    targetId: string,
    targetType: 'post' | 'short' | 'pyes' | 'tube' | 'comment' | 'sound' = 'post'
  ): { isLiked: boolean; likesCount: number } {
    const current = this.getCurrentUser();
    if (!current) return { isLiked: false, likesCount: 0 };

    let likes = this.getLikes();
    const existingIndex = likes.findIndex(
      (l) => l.userId === current.id && l.targetId === targetId
    );

    let isLiked = false;

    if (existingIndex >= 0) {
      likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      likes.push({
        id: `like_${Date.now()}`,
        userId: current.id,
        targetId,
        targetType,
        createdAt: new Date().toISOString(),
      });
      isLiked = true;

      this.recordMissionProgress('give_likes', 1);

      if (targetType === 'post') {
        const posts = this.getPosts();
        const post = posts.find((p) => p.id === targetId);
        if (post && post.authorId !== current.id) {
          this.addNotification({
            type: 'like',
            actor: {
              id: current.id,
              username: current.username,
              fullName: current.fullName,
              avatar: current.avatar,
            },
            content: 'liked your pulse',
            targetId: post.id,
          });
        }
      }
    }

    this.setItem(STORAGE_KEYS.LIKES, likes);
    const count = likes.filter((l) => l.targetId === targetId).length;
    return { isLiked, likesCount: count };
  }

  // --- Real Posts System ---
  public getPosts(): Post[] {
    const posts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, [WELCOME_POST]);
    const likes = this.getLikes();
    const comments = this.getAllComments();
    const current = this.getCurrentUser();

    return posts.map((p) => ({
      ...p,
      likesCount: likes.filter((l) => l.targetId === p.id).length,
      commentsCount: comments.filter((c) => c.targetId === p.id).length,
      isLiked: current ? likes.some((l) => l.userId === current.id && l.targetId === p.id) : false,
      isSaved: this.isPostSaved(p.id),
    }));
  }

  public addPost(post: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount'>): Post {
    const posts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    this.setItem(STORAGE_KEYS.POSTS, posts);

    // If media is a video, automatically add it to PYES so whatever is posted appears in PYES!
    if (post.mediaType === 'video' || (post.mediaUrl && (post.mediaUrl.endsWith('.mp4') || post.mediaUrl.includes('video')))) {
      this.addPyes({
        authorId: post.authorId,
        author: post.author,
        title: post.caption.slice(0, 45),
        caption: post.caption,
        videoUrl: post.mediaUrl!,
        posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        musicTitle: 'Original PYE Audio',
        musicAuthor: post.author.fullName,
        hashtags: post.hashtags || ['PYES'],
        spaceSlug: post.spaceSlug,
      });
    }

    this.recordMissionProgress('share_pulse', 1);
    return newPost;
  }

  public deletePost(postId: string): void {
    let posts = this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
    posts = posts.filter((p) => p.id !== postId);
    this.setItem(STORAGE_KEYS.POSTS, posts);
  }

  public isPostSaved(postId: string): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;
    const saves = this.getItem<string[]>(`pye_saves_${current.id}`, []);
    return saves.includes(postId);
  }

  public togglePostSave(postId: string): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;
    const key = `pye_saves_${current.id}`;
    let saves = this.getItem<string[]>(key, []);
    let isSaved = false;

    if (saves.includes(postId)) {
      saves = saves.filter((id) => id !== postId);
      isSaved = false;
    } else {
      saves.push(postId);
      isSaved = true;
    }

    this.setItem(key, saves);
    return isSaved;
  }

  // --- PYES (Original Short-Form Vertical Video Experience) ---
  public getPyes(filter?: 'foryou' | 'following' | 'discover'): PyesVideo[] {
    const shorts = this.getItem<PyesVideo[]>(STORAGE_KEYS.SHORTS, STARTER_PYES);
    const likes = this.getLikes();
    const comments = this.getAllComments();
    const current = this.getCurrentUser();
    const followingIds = current ? this.getFollowing(current.id).map((f) => f.followingId) : [];

    let enriched = shorts.map((s) => ({
      ...s,
      visibility: s.visibility || 'public',
      moderationStatus: s.moderationStatus || 'approved',
      likesCount: likes.filter((l) => l.targetId === s.id).length,
      commentsCount: comments.filter((c) => c.targetId === s.id).length,
      isLiked: current ? likes.some((l) => l.userId === current.id && l.targetId === s.id) : false,
      isSaved: this.isPostSaved(s.id),
    }));

    if (filter === 'following') {
      if (!current) return [];
      enriched = enriched.filter((s) => followingIds.includes(s.authorId) || s.authorId === current.id);
    } else if (filter === 'discover') {
      // Prioritize trending / most active
      enriched = [...enriched].sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount));
    }

    return enriched;
  }

  // Alias for backward compatibility
  public getShorts(filter?: 'foryou' | 'following' | 'discover'): PyesVideo[] {
    return this.getPyes(filter);
  }

  public addPyes(pyes: Omit<PyesVideo, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'viewsCount'>): PyesVideo {
    const shorts = this.getItem<PyesVideo[]>(STORAGE_KEYS.SHORTS, []);
    const newPyes: PyesVideo = {
      ...pyes,
      id: `pyes_${Date.now()}`,
      visibility: pyes.visibility || 'public',
      moderationStatus: 'approved',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };
    shorts.unshift(newPyes);
    this.setItem(STORAGE_KEYS.SHORTS, shorts);

    this.recordMissionProgress('share_pulse', 1);
    return newPyes;
  }

  public deletePyes(pyesId: string): void {
    let shorts = this.getItem<PyesVideo[]>(STORAGE_KEYS.SHORTS, []);
    shorts = shorts.filter((s) => s.id !== pyesId);
    this.setItem(STORAGE_KEYS.SHORTS, shorts);
  }

  public recordPyesShare(pyesId: string): void {
    const shorts = this.getItem<PyesVideo[]>(STORAGE_KEYS.SHORTS, []);
    const item = shorts.find((s) => s.id === pyesId);
    if (item) {
      item.sharesCount = (item.sharesCount || 0) + 1;
      this.setItem(STORAGE_KEYS.SHORTS, shorts);
    }
    this.recordMissionProgress('share_pulse', 1);
  }

  public togglePyesSave(pyesId: string): boolean {
    return this.togglePostSave(pyesId);
  }

  // --- Real Comments System ---
  public getAllComments(): Comment[] {
    return this.getItem<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  }

  public getComments(targetId: string): Comment[] {
    return this.getAllComments().filter((c) => c.targetId === targetId);
  }

  public addComment(
    targetId: string,
    text: string,
    targetType: 'post' | 'short' | 'pyes' | 'tube' | 'comment' = 'post'
  ): Comment {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Authentication required');

    const comments = this.getAllComments();
    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      targetId,
      targetType,
      author: {
        id: current.id,
        username: current.username,
        fullName: current.fullName,
        avatar: current.avatar,
        isVerified: current.isVerified,
      },
      text: text.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    comments.unshift(newComment);
    this.setItem(STORAGE_KEYS.COMMENTS, comments);
    return newComment;
  }

  public deleteComment(commentId: string): void {
    let comments = this.getAllComments();
    comments = comments.filter((c) => c.id !== commentId);
    this.setItem(STORAGE_KEYS.COMMENTS, comments);
  }

  // --- Spaces & Conferences ---
  public getSpaces(): PyeSpace[] {
    return this.getItem<PyeSpace[]>(STORAGE_KEYS.SPACES, PYE_SPACES);
  }

  public getConferences(): Conference[] {
    const list = this.getItem<Conference[]>(STORAGE_KEYS.CONFERENCES, []);
    const current = this.getCurrentUser();
    return list.map((c) => ({
      ...c,
      isJoined: current ? (c.participantIds || []).includes(current.id) : false,
      currentParticipants: (c.participantIds || []).length,
    }));
  }

  public toggleJoinConference(confId: string): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;

    const list = this.getItem<Conference[]>(STORAGE_KEYS.CONFERENCES, []);
    const conf = list.find((c) => c.id === confId);
    if (!conf) return false;

    if (!conf.participantIds) conf.participantIds = [];
    const idx = conf.participantIds.indexOf(current.id);
    let joined = false;

    if (idx >= 0) {
      conf.participantIds.splice(idx, 1);
      joined = false;
    } else {
      conf.participantIds.push(current.id);
      joined = true;
    }

    conf.currentParticipants = conf.participantIds.length;
    this.setItem(STORAGE_KEYS.CONFERENCES, list);
    return joined;
  }

  // --- Daily Missions System ---
  public getDailyMissions(): DailyMission[] {
    return this.getItem<DailyMission[]>(STORAGE_KEYS.MISSIONS, DEFAULT_MISSIONS);
  }

  public recordMissionProgress(missionId: string, delta: number = 1): void {
    const missions = this.getDailyMissions();
    const mission = missions.find((m) => m.id === missionId);
    if (mission && !mission.isCompleted) {
      mission.progress = Math.min(mission.target, mission.progress + delta);
      if (mission.progress >= mission.target) {
        mission.isCompleted = true;
      }
      this.setItem(STORAGE_KEYS.MISSIONS, missions);
    }
  }

  public claimMissionReward(missionId: string): { ok: boolean; silver: number; gold: number; message: string } {
    const current = this.getCurrentUser();
    if (!current) return { ok: false, silver: 0, gold: 0, message: 'Please log in to claim reward' };

    const missions = this.getDailyMissions();
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.isCompleted || mission.isClaimed) {
      return { ok: false, silver: 0, gold: 0, message: 'Mission reward is not available to claim' };
    }

    mission.isClaimed = true;
    this.setItem(STORAGE_KEYS.MISSIONS, missions);

    const sReward = mission.rewardSilver;
    const gReward = mission.rewardGold;

    current.silverCoins += sReward;
    current.goldCoins += gReward;
    this.updateProfile(current);

    if (sReward > 0) {
      this.addTransaction({
        userId: current.id,
        currency: 'silver',
        type: 'credit',
        amount: sReward,
        reason: `Mission Claimed: ${mission.title}`,
      });
    }
    if (gReward > 0) {
      this.addTransaction({
        userId: current.id,
        currency: 'gold',
        type: 'credit',
        amount: gReward,
        reason: `Mission Claimed: ${mission.title}`,
      });
    }

    return {
      ok: true,
      silver: sReward,
      gold: gReward,
      message: `Claimed +${sReward} SPC${gReward > 0 ? ` and +${gReward} GPC` : ''}!`,
    };
  }

  // --- Sounds System ---
  public getSounds(filter?: 'trending' | 'new' | 'yours' | 'saved'): SoundTrack[] {
    const sounds = this.getItem<SoundTrack[]>(STORAGE_KEYS.SOUNDS, STARTER_SOUNDS);
    const likes = this.getLikes();
    const current = this.getCurrentUser();
    const savedIds = this.getSavedSoundIds();

    let list = sounds.map((s) => ({
      ...s,
      usageCount: s.usageCount || 0,
      likesCount: likes.filter((l) => l.targetId === s.id).length,
      isLiked: current ? likes.some((l) => l.userId === current.id && l.targetId === s.id) : false,
      isSaved: savedIds.includes(s.id),
    }));

    if (filter === 'trending') {
      return [...list].sort((a, b) => (b.playsCount + (b.usageCount * 5)) - (a.playsCount + (a.usageCount * 5)));
    }
    if (filter === 'new') {
      return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (filter === 'yours' && current) {
      return list.filter((s) => s.authorId === current.id || s.artist.toLowerCase() === current.fullName.toLowerCase());
    }
    if (filter === 'saved') {
      return list.filter((s) => savedIds.includes(s.id));
    }

    return list;
  }

  public getSavedSoundIds(): string[] {
    const current = this.getCurrentUser();
    if (!current) return [];
    return this.getItem<string[]>(`${STORAGE_KEYS.SAVED_SOUNDS}_${current.id}`, []);
  }

  public toggleSaveSound(soundId: string): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;
    const key = `${STORAGE_KEYS.SAVED_SOUNDS}_${current.id}`;
    let saved = this.getItem<string[]>(key, []);
    const exists = saved.includes(soundId);
    if (exists) {
      saved = saved.filter((id) => id !== soundId);
    } else {
      saved.push(soundId);
    }
    this.setItem(key, saved);
    return !exists;
  }

  public isSoundSaved(soundId: string): boolean {
    return this.getSavedSoundIds().includes(soundId);
  }

  public addSound(sound: Omit<SoundTrack, 'id' | 'createdAt' | 'playsCount' | 'likesCount' | 'usageCount'>): SoundTrack {
    const sounds = this.getItem<SoundTrack[]>(STORAGE_KEYS.SOUNDS, STARTER_SOUNDS);
    const newSound: SoundTrack = {
      ...sound,
      id: `snd_${Date.now()}`,
      playsCount: 1,
      likesCount: 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    sounds.unshift(newSound);
    this.setItem(STORAGE_KEYS.SOUNDS, sounds);
    return newSound;
  }

  public incrementSoundPlays(soundId: string): void {
    const sounds = this.getItem<SoundTrack[]>(STORAGE_KEYS.SOUNDS, STARTER_SOUNDS);
    const sound = sounds.find((s) => s.id === soundId);
    if (sound) {
      sound.playsCount = (sound.playsCount || 0) + 1;
      this.setItem(STORAGE_KEYS.SOUNDS, sounds);
      this.recordMissionProgress('listen_sound', 1);
    }
  }

  public incrementSoundUsage(soundId: string): void {
    const sounds = this.getItem<SoundTrack[]>(STORAGE_KEYS.SOUNDS, STARTER_SOUNDS);
    const sound = sounds.find((s) => s.id === soundId);
    if (sound) {
      sound.usageCount = (sound.usageCount || 0) + 1;
      this.setItem(STORAGE_KEYS.SOUNDS, sounds);
    }
  }

  // --- Monetization & Advertising Architecture ---
  public getAds(): Advertisement[] {
    return this.getItem<Advertisement[]>(STORAGE_KEYS.ADS, STARTER_ADS);
  }

  public getActiveAds(): Advertisement[] {
    return this.getAds().filter((a) => a.status === 'active');
  }

  public createAd(ad: Omit<Advertisement, 'id' | 'createdAt' | 'impressions' | 'clicks' | 'status'>): Advertisement {
    const ads = this.getAds();
    const newAd: Advertisement = {
      ...ad,
      id: `ad_${Date.now()}`,
      status: 'pending_review',
      impressions: 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
    };
    ads.unshift(newAd);
    this.setItem(STORAGE_KEYS.ADS, ads);
    return newAd;
  }

  public updateAdStatus(adId: string, status: AdStatus): void {
    const ads = this.getAds();
    const ad = ads.find((a) => a.id === adId);
    if (ad) {
      ad.status = status;
      this.setItem(STORAGE_KEYS.ADS, ads);
    }
  }

  public recordAdImpression(adId: string): void {
    const ads = this.getAds();
    const ad = ads.find((a) => a.id === adId);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.setItem(STORAGE_KEYS.ADS, ads);
    }
  }

  public recordAdClick(adId: string): void {
    const ads = this.getAds();
    const ad = ads.find((a) => a.id === adId);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.setItem(STORAGE_KEYS.ADS, ads);
    }
  }

  // --- Promoted Content System ---
  public getPromotions(): PromotedContent[] {
    return this.getItem<PromotedContent[]>(STORAGE_KEYS.PROMOTIONS, []);
  }

  public createPromotion(promo: Omit<PromotedContent, 'id' | 'createdAt' | 'status'>): PromotedContent {
    const promos = this.getPromotions();
    const newPromo: PromotedContent = {
      ...promo,
      id: `prm_${Date.now()}`,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    promos.unshift(newPromo);
    this.setItem(STORAGE_KEYS.PROMOTIONS, promos);
    return newPromo;
  }

  public approvePromotion(promoId: string): void {
    const promos = this.getPromotions();
    const p = promos.find((item) => item.id === promoId);
    if (p) {
      p.status = 'active';
      this.setItem(STORAGE_KEYS.PROMOTIONS, promos);
    }
  }

  // --- Business Accounts System ---
  public applyBusinessAccount(userId: string, profile: BusinessProfile): boolean {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.isBusiness = true;
      user.businessProfile = {
        ...profile,
        verificationStatus: 'pending',
        registeredAt: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.USERS, users);
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setCurrentUser(user);
      }
      return true;
    }
    return false;
  }

  public verifyBusiness(userId: string): void {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.id === userId);
    if (user && user.businessProfile) {
      user.businessProfile.verificationStatus = 'verified';
      this.setItem(STORAGE_KEYS.USERS, users);
    }
  }

  // --- Real Virtual Currency Ledger (SPC & GPC) ---
  public getTransactions(userId?: string): CoinTransaction[] {
    const all = this.getItem<CoinTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    if (!userId) return all;
    return all.filter((t) => t.userId === userId);
  }

  public addTransaction(tx: Omit<CoinTransaction, 'id' | 'timestamp' | 'status'>): CoinTransaction {
    const list = this.getTransactions();
    const newTx: CoinTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };
    list.unshift(newTx);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, list);
    return newTx;
  }

  // --- Secure Payment Infrastructure Architecture ---
  public getPaymentMethods(userId?: string): PaymentMethodConfig[] {
    const current = userId ? { id: userId } : this.getCurrentUser();
    if (!current) return [];
    return this.getItem<PaymentMethodConfig[]>(`${STORAGE_KEYS.PAYMENT_METHODS}_${current.id}`, [
      {
        id: 'pm_card_mock_default',
        type: 'card',
        label: 'PYE Titanium Visa',
        brand: 'Visa',
        last4: '4242',
        expiry: '12/28',
        isDefault: true,
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
  }

  public addPaymentMethod(method: Omit<PaymentMethodConfig, 'id' | 'createdAt'>): PaymentMethodConfig {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Authentication required');
    const key = `${STORAGE_KEYS.PAYMENT_METHODS}_${current.id}`;
    const list = this.getPaymentMethods(current.id);
    const newMethod: PaymentMethodConfig = {
      ...method,
      id: `pm_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (newMethod.isDefault) {
      list.forEach((m) => (m.isDefault = false));
    }
    list.unshift(newMethod);
    this.setItem(key, list);
    return newMethod;
  }

  public removePaymentMethod(methodId: string): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const key = `${STORAGE_KEYS.PAYMENT_METHODS}_${current.id}`;
    const list = this.getPaymentMethods(current.id).filter((m) => m.id !== methodId);
    this.setItem(key, list);
  }

  public getPaymentLedger(userId?: string): PaymentLedgerEntry[] {
    const all = this.getItem<PaymentLedgerEntry[]>(STORAGE_KEYS.PAYMENT_LEDGER, [
      {
        id: 'ple_init_001',
        idempotencyKey: 'idemp_9921_pye_genesis',
        userId: OFFICIAL_PYE_USER.id,
        amountCents: 1999,
        currency: 'USD',
        pyeCoinAmount: 2000,
        gateway: 'stripe_mock',
        status: 'succeeded',
        signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        description: 'Pioneer Grant Deposit (2,000 Silver Coins)',
        createdAt: '2026-09-01T00:00:00Z',
      },
    ]);
    if (!userId) return all;
    return all.filter((l) => l.userId === userId);
  }

  public recordPaymentLedger(entry: Omit<PaymentLedgerEntry, 'id' | 'createdAt'>): PaymentLedgerEntry {
    const all = this.getItem<PaymentLedgerEntry[]>(STORAGE_KEYS.PAYMENT_LEDGER, []);
    const newEntry: PaymentLedgerEntry = {
      ...entry,
      id: `ple_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newEntry);
    this.setItem(STORAGE_KEYS.PAYMENT_LEDGER, all);
    return newEntry;
  }

  public processFuturePaymentSimulation(params: {
    userId: string;
    amountCents: number;
    currency: string;
    coinAmount: number;
    coinType: 'silver' | 'gold';
    gateway: 'stripe_mock' | 'crypto_mock' | 'pye_internal';
    description: string;
  }): { success: boolean; transaction: CoinTransaction; ledgerEntry: PaymentLedgerEntry } {
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const signatureHash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const ledgerEntry = this.recordPaymentLedger({
      idempotencyKey,
      userId: params.userId,
      amountCents: params.amountCents,
      currency: params.currency,
      pyeCoinAmount: params.coinAmount,
      gateway: params.gateway,
      status: 'succeeded',
      signatureHash,
      description: params.description,
    });

    const tx = this.addTransaction({
      userId: params.userId,
      currency: params.coinType,
      type: 'credit',
      amount: params.coinAmount,
      reason: params.description,
    });

    // Credit user's wallet
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.id === params.userId);
    if (user) {
      if (params.coinType === 'gold') {
        user.goldCoins = (user.goldCoins || 0) + params.coinAmount;
      } else {
        user.silverCoins = (user.silverCoins || 0) + params.coinAmount;
      }
      this.setItem(STORAGE_KEYS.USERS, users);
      const current = this.getCurrentUser();
      if (current && current.id === params.userId) {
        this.setCurrentUser(user);
      }
    }

    return { success: true, transaction: tx, ledgerEntry };
  }

  // --- Creator Analytics Engine ---
  public getCreatorAnalytics(userId: string) {
    const pyes = this.getPyes().filter((p) => p.authorId === userId);
    const posts = this.getPosts().filter((p) => p.authorId === userId);
    const sounds = this.getSounds().filter((s) => s.authorId === userId);
    const txs = this.getTransactions(userId);

    const totalPyesViews = pyes.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const totalPyesLikes = pyes.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    const totalPostLikes = posts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    const totalSoundPlays = sounds.reduce((acc, s) => acc + (s.playsCount || 0), 0);
    const totalSoundUses = sounds.reduce((acc, s) => acc + (s.usageCount || 0), 0);
    const totalCoinTipsReceived = txs
      .filter((t) => t.type === 'credit' && t.reason.toLowerCase().includes('tip'))
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalPyes: pyes.length,
      totalPosts: posts.length,
      totalSounds: sounds.length,
      totalPyesViews,
      totalPyesLikes,
      totalPostLikes,
      totalSoundPlays,
      totalSoundUses,
      totalCoinTipsReceived,
      engagementRate: pyes.length > 0 ? (((totalPyesLikes + totalPostLikes) / Math.max(1, totalPyesViews)) * 100).toFixed(1) : '0.0',
    };
  }

  // --- PYE Games Records ---
  public getGameRecords(userId?: string): GameScoreRecord[] {
    const all = this.getItem<GameScoreRecord[]>(STORAGE_KEYS.GAME_RECORDS, []);
    if (!userId) return all;
    return all.filter((r) => r.userId === userId);
  }

  public recordGameOutcome(record: Omit<GameScoreRecord, 'id' | 'playedAt'>): GameScoreRecord {
    const list = this.getItem<GameScoreRecord[]>(STORAGE_KEYS.GAME_RECORDS, []);
    const newRecord: GameScoreRecord = {
      ...record,
      id: `gm_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      playedAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    this.setItem(STORAGE_KEYS.GAME_RECORDS, list);

    // If coins were earned, credit wallet
    if (record.coinsEarned > 0) {
      this.addTransaction({
        userId: record.userId,
        currency: 'silver',
        type: 'credit',
        amount: record.coinsEarned,
        reason: `Victory reward in PYE ${record.gameId.toUpperCase()}`,
      });
      const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
      const user = users.find((u) => u.id === record.userId);
      if (user) {
        user.silverCoins = (user.silverCoins || 0) + record.coinsEarned;
        this.setItem(STORAGE_KEYS.USERS, users);
        const current = this.getCurrentUser();
        if (current && current.id === record.userId) {
          this.setCurrentUser(user);
        }
      }
    }

    return newRecord;
  }

  // --- Real Rankings based on actual database activity ---
  public getRankings(category: RankingItem['category'] = 'pulse'): RankingItem[] {
    const users = this.getUsers().filter((u) => !u.isDeactivated);
    if (category === 'pulse' || category === 'creators') {
      return [...users]
        .sort((a, b) => b.likesCount - a.likesCount)
        .slice(0, 10)
        .map((u, i) => ({
          id: `rank_${u.id}`,
          rank: i + 1,
          user: {
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            avatar: u.avatar,
            isVerified: u.isVerified,
            bio: u.bio,
          },
          metricValue: u.likesCount,
          metricLabel: 'Real Hearts Received',
          category,
          trend: 'up',
        }));
    }
    if (category === 'growth') {
      return [...users]
        .sort((a, b) => b.followersCount - a.followersCount)
        .slice(0, 10)
        .map((u, i) => ({
          id: `rank_${u.id}`,
          rank: i + 1,
          user: {
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            avatar: u.avatar,
            isVerified: u.isVerified,
            bio: u.bio,
          },
          metricValue: u.followersCount,
          metricLabel: 'Real Followers',
          category,
          trend: 'up',
        }));
    }
    // 'coins'
    return [...users]
      .sort((a, b) => b.goldCoins - a.goldCoins)
      .slice(0, 10)
      .map((u, i) => ({
        id: `rank_${u.id}`,
        rank: i + 1,
        user: {
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          avatar: u.avatar,
          isVerified: u.isVerified,
          bio: u.bio,
        },
        metricValue: u.goldCoins,
        metricLabel: 'GPC Gold Coins',
        category: 'coins',
        trend: 'up',
      }));
  }

  // --- Real Messaging System ---
  public getConversations(): Conversation[] {
    const current = this.getCurrentUser();
    if (!current) return [];
    const key = `pye_convos_${current.id}`;
    const stored = this.getItem<Conversation[]>(key, []);
    if (stored.length > 0) return stored;

    // Seed conversations with community members
    const initialConvos: Conversation[] = [
      {
        id: 'conv_maya',
        participant: {
          id: MAYA_USER.id,
          username: MAYA_USER.username,
          fullName: MAYA_USER.fullName,
          avatar: MAYA_USER.avatar,
          isVerified: true,
          isOnline: true,
        },
        lastMessage: 'Hey! Welcome to PYE. Check out my new sound in Sounds section!',
        lastMessageTime: '10m ago',
        unreadCount: 1,
        messages: [
          {
            id: 'm1',
            senderId: MAYA_USER.id,
            senderName: MAYA_USER.fullName,
            senderAvatar: MAYA_USER.avatar,
            text: 'Hey! Welcome to PYE. Check out my new sound in Sounds section!',
            timestamp: '10m ago',
            isMine: false,
          },
        ],
      },
      {
        id: 'conv_alex',
        participant: {
          id: ALEX_USER.id,
          username: ALEX_USER.username,
          fullName: ALEX_USER.fullName,
          avatar: ALEX_USER.avatar,
          isVerified: true,
          isOnline: true,
        },
        lastMessage: 'Up for a game of Chess or TikTakToe in the PYE Arcade?',
        lastMessageTime: '1h ago',
        unreadCount: 1,
        messages: [
          {
            id: 'm2',
            senderId: ALEX_USER.id,
            senderName: ALEX_USER.fullName,
            senderAvatar: ALEX_USER.avatar,
            text: 'Up for a game of Chess or TikTakToe in the PYE Arcade?',
            timestamp: '1h ago',
            isMine: false,
          },
        ],
      },
    ];
    this.setItem(key, initialConvos);
    return initialConvos;
  }

  public sendMessage(conversationId: string, text: string): Conversation | null {
    const current = this.getCurrentUser();
    if (!current || !text.trim()) return null;
    const convos = this.getConversations();
    const conv = convos.find((c) => c.id === conversationId);
    if (!conv) return null;

    const newMsg: DirectMessage = {
      id: `msg_${Date.now()}`,
      senderId: current.id,
      senderName: current.fullName,
      senderAvatar: current.avatar,
      text: text.trim(),
      timestamp: 'Just now',
      isMine: true,
    };

    conv.messages.push(newMsg);
    conv.lastMessage = text.trim();
    conv.lastMessageTime = 'Just now';
    conv.unreadCount = 0;

    const key = `pye_convos_${current.id}`;
    this.setItem(key, convos);
    return conv;
  }

  // --- Real Notifications System ---
  public getNotifications(): NotificationItem[] {
    const current = this.getCurrentUser();
    if (!current) return [];
    const all = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter((n) => !n.targetId || n.targetId === current.id);
  }

  public addNotification(notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): NotificationItem {
    const all = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 899 + 100)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    all.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const all = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const item = all.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }

  public markAllNotificationsAsRead(): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const all = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    all.forEach((n) => {
      if (!n.targetId || n.targetId === current.id) n.isRead = true;
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  // --- Safety & Moderation ---
  public submitReport(report: Omit<SafetyReport, 'id' | 'timestamp' | 'status'>): SafetyReport {
    const reports = this.getItem<SafetyReport[]>(STORAGE_KEYS.REPORTS, []);
    const newReport: SafetyReport = {
      ...report,
      id: `rep_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    reports.unshift(newReport);
    this.setItem(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  }

  public getReports(): SafetyReport[] {
    return this.getItem<SafetyReport[]>(STORAGE_KEYS.REPORTS, []);
  }

  public resolveReport(reportId: string, status: SafetyReport['status']): void {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      this.setItem(STORAGE_KEYS.REPORTS, reports);
    }
  }

  public submitAppeal(data: { username: string; email: string; message: string }): void {
    const appeals = this.getItem<AccountAppeal[]>(STORAGE_KEYS.APPEALS, []);
    appeals.unshift({
      id: `appeal_${Date.now()}`,
      username: data.username,
      email: data.email,
      message: data.message,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    });
    this.setItem(STORAGE_KEYS.APPEALS, appeals);
  }

  public getAppeals(): AccountAppeal[] {
    return this.getItem<AccountAppeal[]>(STORAGE_KEYS.APPEALS, []);
  }

  public updateReportStatus(reportId: string, status: SafetyReport['status']): void {
    this.resolveReport(reportId, status);
  }

  // --- Tube Videos System ---
  public getTubeVideos(): TubeVideo[] {
    const defaultTubeVideos: TubeVideo[] = [
      {
        id: 'tube_1',
        authorId: OFFICIAL_PYE_USER.id,
        author: {
          id: OFFICIAL_PYE_USER.id,
          username: OFFICIAL_PYE_USER.username,
          fullName: OFFICIAL_PYE_USER.fullName,
          avatar: OFFICIAL_PYE_USER.avatar,
          isVerified: true,
          subscribersCount: 24500,
        },
        title: 'The Architecture of PYE Universe | Keynote Demonstration',
        description: 'An in-depth exploration of the decentralized social mechanics, spatial audio, and PYES vertical pipeline.',
        videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
        duration: '14:22',
        viewsCount: 3820,
        likesCount: 420,
        commentsCount: 38,
        category: 'Technology',
        tags: ['Architecture', 'PYE', 'Keynote'],
        createdAt: '2026-09-24T10:00:00Z',
      },
      {
        id: 'tube_2',
        authorId: MAYA_USER.id,
        author: {
          id: MAYA_USER.id,
          username: MAYA_USER.username,
          fullName: MAYA_USER.fullName,
          avatar: MAYA_USER.avatar,
          isVerified: true,
          subscribersCount: 18200,
        },
        title: 'Modular Synthesis & Generative Soundscapes Masterclass',
        description: 'Patching Eurorack oscillations into resonant analog filters for spatial sound design.',
        videoUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/echo-hereweare.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
        duration: '22:15',
        viewsCount: 1940,
        likesCount: 285,
        commentsCount: 19,
        category: 'Music & Audio',
        tags: ['Modular', 'Synth', 'SoundDesign'],
        createdAt: '2026-09-25T14:30:00Z',
      },
    ];
    return this.getItem<TubeVideo[]>('pye_tube_videos', defaultTubeVideos);
  }

  public addTubeVideo(video: Omit<TubeVideo, 'id' | 'createdAt' | 'viewsCount' | 'likesCount' | 'commentsCount'>): TubeVideo {
    const list = this.getTubeVideos();
    const newVid: TubeVideo = {
      ...video,
      id: `tube_${Date.now()}`,
      viewsCount: 1,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newVid);
    this.setItem('pye_tube_videos', list);
    return newVid;
  }

  // --- Live Transmissions System ---
  public getLives(): LiveStream[] {
    const defaultLiveStreams: LiveStream[] = [
      {
        id: 'live_1',
        hostId: ALEX_USER.id,
        host: {
          id: ALEX_USER.id,
          username: ALEX_USER.username,
          fullName: ALEX_USER.fullName,
          avatar: ALEX_USER.avatar,
          isVerified: true,
        },
        title: 'Real-Time Shader Coding & Generative Art Jam',
        category: 'Creative & Code',
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        streamUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        viewerCount: 412,
        likesCount: 1530,
        isLive: true,
        chatMessages: [
          {
            id: 'c1',
            sender: {
              id: MAYA_USER.id,
              username: MAYA_USER.username,
              fullName: MAYA_USER.fullName,
              avatar: MAYA_USER.avatar,
              isVerified: true,
            },
            text: 'That raymarching loop looks insane! 🔥',
            timestamp: '12:02',
          },
        ],
        startedAt: '2026-09-26T15:00:00Z',
      },
    ];
    return this.getItem<LiveStream[]>('pye_live_streams', defaultLiveStreams);
  }

  public sendLiveChatMessage(streamId: string, text: string, isTip?: boolean, tipAmount?: number): LiveChatMessage {
    const current = this.getCurrentUser();
    const streams = this.getLives();
    const stream = streams.find((s) => s.id === streamId);
    const msg: LiveChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sender: {
        id: current?.id || 'anon',
        username: current?.username || 'Guest',
        fullName: current?.fullName || 'Guest Citizen',
        avatar: current?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isVerified: current?.isVerified || false,
      },
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: current?.id === stream?.hostId,
      isTip,
      tipAmount,
    };
    if (stream) {
      if (!stream.chatMessages) stream.chatMessages = [];
      stream.chatMessages.push(msg);
      this.setItem('pye_live_streams', streams);
    }
    return msg;
  }

  public startLiveStream(
    titleOrData: { title: string; category?: string; coverImage?: string } | string,
    maybeCategory?: string
  ): LiveStream {
    const current = this.getCurrentUser();
    const streams = this.getLives();
    const title = typeof titleOrData === 'string' ? titleOrData : titleOrData.title;
    const category = typeof titleOrData === 'string' ? maybeCategory || 'Creative & Code' : titleOrData.category || 'Creative & Code';
    const coverImage = typeof titleOrData === 'string' ? 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600' : titleOrData.coverImage || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600';

    const newStream: LiveStream = {
      id: `live_${Date.now()}`,
      hostId: current?.id || 'unknown',
      host: {
        id: current?.id || 'unknown',
        username: current?.username || 'creator',
        fullName: current?.fullName || 'Creator',
        avatar: current?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isVerified: current?.isVerified || false,
      },
      title,
      category,
      coverImage,
      streamUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      viewerCount: 1,
      likesCount: 0,
      isLive: true,
      chatMessages: [],
      startedAt: new Date().toISOString(),
    };
    streams.unshift(newStream);
    this.setItem('pye_live_streams', streams);
    return newStream;
  }

  public endLiveStream(streamId: string): void {
    const streams = this.getLives();
    const stream = streams.find((s) => s.id === streamId);
    if (stream) {
      stream.isLive = false;
      this.setItem('pye_live_streams', streams);
    }
  }

  public setUserStatus(userId: string, isDeactivated: boolean): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.isDeactivated = isDeactivated;
      this.setItem(STORAGE_KEYS.USERS, users);
    }
  }

  public toggleUserVerified(userId: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.isVerified = !user.isVerified;
      this.setItem(STORAGE_KEYS.USERS, users);
      return user.isVerified;
    }
    return false;
  }

  // --- Audit Logs System ---
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('pye_audit_logs', []);
  }

  public addAuditLog(action: string, target: string, details: string): AuditLog {
    const current = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `audit_${Date.now()}`,
      adminId: current?.id || 'system',
      adminUsername: current?.username || 'system',
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setItem('pye_audit_logs', logs);
    return newLog;
  }

  // --- Conferences & Direct Messages ---
  public createConference(conf: Omit<Conference, 'id' | 'currentParticipants' | 'createdAt'>): Conference {
    const list = this.getItem<Conference[]>(STORAGE_KEYS.CONFERENCES, []);
    const newConf: Conference = {
      ...conf,
      id: `conf_${Date.now()}`,
      currentParticipants: 1,
      participantIds: [conf.hostId],
      createdAt: new Date().toISOString(),
    };
    list.unshift(newConf);
    this.setItem(STORAGE_KEYS.CONFERENCES, list);
    return newConf;
  }

  public sendDirectMessage(recipientId: string, text: string): Conversation | null {
    return this.sendMessage(recipientId, text);
  }

  public markNotificationsAsRead(): void {
    const notes = this.getNotifications();
    notes.forEach((n) => (n.isRead = true));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notes);
  }

  public getBlockedUsers(): BlockedUser[] {
    return this.getItem<BlockedUser[]>(STORAGE_KEYS.BLOCKED_USERS, []);
  }

  public unblockUser(userId: string): void {
    let list = this.getBlockedUsers();
    list = list.filter((b) => b.id !== userId);
    this.setItem(STORAGE_KEYS.BLOCKED_USERS, list);
  }

  public claimDailyReward(): { ok: boolean; message: string; silver?: number; gold?: number } {
    const res = this.claimMissionReward('checkin');
    return { ok: res.ok, message: res.message, silver: res.silver, gold: res.gold };
  }

  public sendGift(
    targetUserId: string,
    currency: 'silver' | 'gold',
    amount: number,
    note?: string
  ): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;
    const balance = currency === 'gold' ? current.goldCoins : current.silverCoins;
    if (balance < amount) return false;

    if (currency === 'gold') {
      current.goldCoins -= amount;
    } else {
      current.silverCoins -= amount;
    }
    this.updateProfile(current);

    const users = this.getUsers();
    const recipient = users.find((u) => u.id === targetUserId);
    if (recipient) {
      if (currency === 'gold') {
        recipient.goldCoins += amount;
      } else {
        recipient.silverCoins += amount;
      }
      this.setItem(STORAGE_KEYS.USERS, users);
    }

    this.addTransaction({
      userId: current.id,
      currency,
      type: 'debit',
      amount,
      reason: note || `Gift tip to user`,
    });
    this.addTransaction({
      userId: targetUserId,
      currency,
      type: 'credit',
      amount,
      reason: note || `Gift tip from @${current.username}`,
    });

    return true;
  }
}

export const Storage = new StorageService();
Storage.init();
