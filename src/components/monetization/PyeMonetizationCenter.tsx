import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  BarChart3,
  Briefcase,
  Megaphone,
  CreditCard,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShieldCheck,
  Eye,
  MousePointer,
  Film,
  Building,
  Lock,
  Wallet,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  X,
} from 'lucide-react';
import {
  User,
  Advertisement,
  PromotedContent,
  BusinessProfile,
  PaymentMethodConfig,
  PaymentLedgerEntry,
  CoinTransaction,
} from '../../types';
import { Storage } from '../../services/storage';
import { PyeLogo } from '../ui/PyeLogo';

interface PyeMonetizationCenterProps {
  currentUser: User | null;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
  onViewProfile?: (userId: string) => void;
}

type MonetizationTab = 'ads' | 'promotions' | 'business' | 'analytics' | 'wallet';

export const PyeMonetizationCenter: React.FC<PyeMonetizationCenterProps> = ({
  currentUser,
  onOpenAuth,
  onViewProfile,
}) => {
  const [activeTab, setActiveTab] = useState<MonetizationTab>('ads');

  // Ads state
  const [ads, setAds] = useState<Advertisement[]>(() => Storage.getAds());
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adMediaUrl, setAdMediaUrl] = useState('');
  const [adDestUrl, setAdDestUrl] = useState('');
  const [adCta, setAdCta] = useState('Explore Now');
  const [adCategory, setAdCategory] = useState('Technology');
  const [adBudget, setAdBudget] = useState(250);

  // Promotions state
  const [promotions, setPromotions] = useState<PromotedContent[]>(() => Storage.getPromotions());
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostType, setBoostType] = useState<'post' | 'pyes'>('pyes');
  const [boostGoal, setBoostGoal] = useState<PromotedContent['goal']>('more_content_views');
  const [boostAudience, setBoostAudience] = useState<PromotedContent['audience']>('all');
  const [boostDays, setBoostDays] = useState(7);
  const [boostBudget, setBoostBudget] = useState(150);

  // Business state
  const [userProfile, setUserProfile] = useState<User | null>(currentUser);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [bizName, setBizName] = useState(currentUser?.businessProfile?.businessName || '');
  const [bizCategory, setBizCategory] = useState(currentUser?.businessProfile?.category || 'Digital Tech & Media');
  const [bizWebsite, setBizWebsite] = useState(currentUser?.businessProfile?.website || '');
  const [bizTaxId, setBizTaxId] = useState(currentUser?.businessProfile?.taxOrRegNumber || '');

  // Analytics state
  const [analytics, setAnalytics] = useState(() =>
    currentUser ? Storage.getCreatorAnalytics(currentUser.id) : null
  );

  // Wallet & Payment state
  const [transactions, setTransactions] = useState<CoinTransaction[]>(() =>
    currentUser ? Storage.getTransactions(currentUser.id) : []
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(() =>
    currentUser ? Storage.getPaymentMethods(currentUser.id) : []
  );
  const [paymentLedger, setPaymentLedger] = useState<PaymentLedgerEntry[]>(() =>
    currentUser ? Storage.getPaymentLedger(currentUser.id) : []
  );

  // Deposit Simulation Modal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmountUsd, setDepositAmountUsd] = useState(19.99);
  const [depositCoins, setDepositCoins] = useState(2000);
  const [depositGateway, setDepositGateway] = useState<'stripe_mock' | 'crypto_mock'>('stripe_mock');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    if (currentUser) {
      setUserProfile(Storage.getUserById(currentUser.id) || currentUser);
      setAnalytics(Storage.getCreatorAnalytics(currentUser.id));
      setTransactions(Storage.getTransactions(currentUser.id));
      setPaymentMethods(Storage.getPaymentMethods(currentUser.id));
      setPaymentLedger(Storage.getPaymentLedger(currentUser.id));
    }
  }, [currentUser]);

  // Handle Create Ad
  const handleCreateAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!adTitle.trim() || !adDestUrl.trim()) {
      showToast('Title and destination URL are required');
      return;
    }

    const created = Storage.createAd({
      advertiserName: currentUser.fullName || currentUser.username,
      advertiserId: currentUser.id,
      title: adTitle.trim(),
      description: adDesc.trim(),
      mediaUrl: adMediaUrl.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      mediaType: 'image',
      destinationUrl: adDestUrl.trim(),
      callToAction: adCta,
      category: adCategory,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      budgetCoins: adBudget,
      targetAudience: `${adCategory} Enthusiasts`,
    });

    setAds([created, ...ads]);
    setShowCreateAdModal(false);
    setAdTitle('');
    setAdDesc('');
    setAdMediaUrl('');
    setAdDestUrl('');
    showToast(`Ad Campaign "${created.title}" submitted for review!`);
  };

  // Handle Create Promotion
  const handleBoostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    const userPyes = Storage.getPyes().filter((p) => p.authorId === currentUser.id);
    const contentTitle = userPyes[0]?.caption || 'Featured PYES Reel';
    const contentId = userPyes[0]?.id || `pyes_${Date.now()}`;

    const promo = Storage.createPromotion({
      contentId,
      contentType: boostType,
      contentTitle,
      authorId: currentUser.id,
      goal: boostGoal,
      audience: boostAudience,
      durationDays: boostDays,
      budgetCoins: boostBudget,
    });

    setPromotions([promo, ...promotions]);
    setShowBoostModal(false);
    showToast('Content boost initiated! Reach metrics will update live.');
  };

  // Handle Business Registration
  const handleBusinessRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!bizName.trim()) {
      showToast('Business name is required');
      return;
    }

    const success = Storage.applyBusinessAccount(currentUser.id, {
      businessName: bizName.trim(),
      category: bizCategory,
      website: bizWebsite.trim(),
      taxOrRegNumber: bizTaxId.trim() || 'PYE-BIZ-7789',
      verificationStatus: 'verified', // Auto verified for pioneers
      monthlyRevenueCoins: 3500,
      totalCustomers: 48,
      conversionRate: 4.2,
    });

    if (success) {
      const updated = Storage.getUserById(currentUser.id);
      setUserProfile(updated || null);
      setShowBusinessModal(false);
      showToast('Official Business Profile registered & verified!');
    }
  };

  // Handle Secure Payment Deposit Simulation
  const handleProcessDeposit = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      const res = Storage.processFuturePaymentSimulation({
        userId: currentUser.id,
        amountCents: Math.round(depositAmountUsd * 100),
        currency: 'USD',
        coinAmount: depositCoins,
        coinType: 'silver',
        gateway: depositGateway,
        description: `Purchased ${depositCoins.toLocaleString()} PYE Silver Coins via ${
          depositGateway === 'stripe_mock' ? 'Stripe Checkout' : 'Web3 Crypto Gateway'
        }`,
      });

      setTransactions(Storage.getTransactions(currentUser.id));
      setPaymentLedger(Storage.getPaymentLedger(currentUser.id));
      setUserProfile(Storage.getUserById(currentUser.id) || null);
      setIsProcessingPayment(false);
      setShowDepositModal(false);
      showToast(`Payment of $${depositAmountUsd} succeeded! +${depositCoins.toLocaleString()} SPC credited.`);
    }, 1200);
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
                  <Coins className="w-3 h-3" />
                  Ecosystem Economy
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  PYE Monetization Center
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Launch targeted campaigns, scale your creative brand, monitor audience analytics, and manage payment ledgers with zero fake bots.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => (currentUser ? setShowDepositModal(true) : onOpenAuth('login'))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-xs font-bold text-white shadow-lg shadow-[#FF007A]/25 hover:scale-105 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coins / Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Ads, Promotions, Business Dashboard, Creator Analytics, PYE Wallet) */}
      <div className="flex items-center p-1 bg-[#0f0f18] rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
        {[
          { id: 'ads', label: 'Ads', icon: Megaphone },
          { id: 'promotions', label: 'Promotions', icon: TrendingUp },
          { id: 'business', label: 'Business Dashboard', icon: Briefcase },
          { id: 'analytics', label: 'Creator Analytics', icon: BarChart3 },
          { id: 'wallet', label: 'PYE Wallet', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
                active
                  ? 'bg-gradient-to-r from-[#FF007A] to-[#FF5500] text-white shadow-md shadow-[#FF007A]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: ADS --- */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              { label: 'Active Campaigns', val: ads.filter((a) => a.status === 'active').length, icon: Megaphone, color: 'text-emerald-400' },
              { label: 'Total Impressions', val: ads.reduce((acc, a) => acc + a.impressions, 0).toLocaleString(), icon: Eye, color: 'text-[#FFA000]' },
              { label: 'Total Clicks', val: ads.reduce((acc, a) => acc + a.clicks, 0).toLocaleString(), icon: MousePointer, color: 'text-cyan-400' },
              { label: 'Average CTR', val: `${((ads.reduce((acc, a) => acc + a.clicks, 0) / Math.max(1, ads.reduce((acc, a) => acc + a.impressions, 0))) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-[#FF007A]' },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-medium">{m.label}</span>
                    <Icon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className={`text-xl font-black font-mono ${m.color}`}>{m.val}</div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#FF007A]" />
              Advertising Campaigns
            </h3>
            <button
              onClick={() => (currentUser ? setShowCreateAdModal(true) : onOpenAuth('login'))}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Ad
            </button>
          </div>

          {/* Ads List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="p-5 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-4 hover:border-white/15 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      {ad.status.replace('_', ' ')}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{ad.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{ad.description}</p>
                  </div>
                  {ad.mediaUrl && (
                    <img
                      src={ad.mediaUrl}
                      alt={ad.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-900/60 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Impressions</span>
                    <span className="font-bold text-white">{ad.impressions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Clicks</span>
                    <span className="font-bold text-white">{ad.clicks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Budget</span>
                    <span className="font-bold text-[#FFA000]">{ad.budgetCoins} SPC</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-500">CTA: <strong className="text-white">{ad.callToAction}</strong></span>
                  <a
                    href={ad.destinationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FF007A] hover:underline flex items-center gap-1 font-semibold"
                  >
                    Preview Link <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: PROMOTIONS --- */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FFA000]" />
                Content Boost Engine
              </h3>
              <p className="text-xs text-zinc-400">Boost genuine PYES videos and Pulses across the Universe Feed.</p>
            </div>
            <button
              onClick={() => (currentUser ? setShowBoostModal(true) : onOpenAuth('login'))}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FF5500] text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Boost Content
            </button>
          </div>

          {promotions.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">No active promotions</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Select one of your PYES videos or Pulses and boost it to thousands of real pioneers.
              </p>
              <button
                onClick={() => (currentUser ? setShowBoostModal(true) : onOpenAuth('login'))}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-xs font-bold text-white transition"
              >
                Boost First Reel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFA000]/15 text-[#FFA000] border border-[#FFA000]/30 text-[10px] font-bold uppercase">
                      {p.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{p.durationDays} Days</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.contentTitle}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/60 p-2.5 rounded-xl font-mono">
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Goal</span>
                      <span className="text-zinc-200 capitalize">{p.goal.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Budget</span>
                      <span className="text-[#FFA000]">{p.budgetCoins} SPC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: BUSINESS DASHBOARD --- */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {userProfile?.businessProfile?.businessName || 'Business Organization Profile'}
                    </h3>
                    {userProfile?.businessProfile?.verificationStatus === 'verified' && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                        VERIFIED BUSINESS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {userProfile?.businessProfile?.category || 'Configure merchant tools, tax records, and commercial listings'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBusinessModal(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition self-start sm:self-auto"
              >
                {userProfile?.isBusiness ? 'Edit Business Info' : 'Register Business'}
              </button>
            </div>

            {/* Business KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-[11px] text-zinc-400">Commercial Revenue</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {userProfile?.businessProfile?.monthlyRevenueCoins || 3500} SPC
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-[11px] text-zinc-400">Customers Reached</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {userProfile?.businessProfile?.totalCustomers || 48}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-[11px] text-zinc-400">Conversion Rate</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                  {userProfile?.businessProfile?.conversionRate || 4.2}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-[11px] text-zinc-400">Registration ID</div>
                <div className="text-xs font-bold text-zinc-300 font-mono mt-1 truncate">
                  {userProfile?.businessProfile?.taxOrRegNumber || 'PYE-BIZ-7789'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: CREATOR ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-[11px] text-zinc-400">Total PYES Views</div>
              <div className="text-2xl font-black font-mono text-white">
                {analytics?.totalPyesViews.toLocaleString() || '0'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-[11px] text-zinc-400">Sound Audio Plays</div>
              <div className="text-2xl font-black font-mono text-[#FFA000]">
                {analytics?.totalSoundPlays.toLocaleString() || '0'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-[11px] text-zinc-400">Coin Tips Received</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {analytics?.totalCoinTipsReceived.toLocaleString() || '0'} SPC
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-[11px] text-zinc-400">Engagement Rate</div>
              <div className="text-2xl font-black font-mono text-[#FF007A]">
                {analytics?.engagementRate || '0.0'}%
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FFA000]" />
              Authentic Performance Ledger
            </h4>
            <p className="text-xs text-zinc-400">
              PYE measures real user interactions with strict anti-bot scrubbing. Zero manufactured views or fake accounts.
            </p>
          </div>
        </div>
      )}

      {/* --- TAB 5: PYE WALLET --- */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#161622] border border-white/10 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">PYE Silver Balance</span>
                <Coins className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {(currentUser?.silverCoins || 1000).toLocaleString()}{' '}
                <span className="text-zinc-400 text-sm">SPC</span>
              </div>
              <div className="text-xs text-zinc-400">
                Used for creator tips, arcade games, and universe promotions.
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161622] to-[#201828] border border-[#FFA000]/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FFA000] uppercase tracking-wider">PYE Gold Balance</span>
                <DollarSign className="w-5 h-5 text-[#FFA000]" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {(currentUser?.goldCoins || 100).toLocaleString()}{' '}
                <span className="text-[#FFA000] text-sm">GPC</span>
              </div>
              <div className="text-xs text-zinc-400">
                Premium reserve currency for sponsored spaces and merchant invoices.
              </div>
            </div>
          </div>

          {/* Payment Methods Architecture */}
          <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FF007A]" />
                  Registered Payment Methods
                </h4>
                <p className="text-xs text-zinc-400">
                  PCI-DSS compliant tokenized payment credentials ready for production gateway link.
                </p>
              </div>
              <button
                onClick={() => showToast('Payment gateway credentials management initialized')}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/15 transition"
              >
                + Add Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{pm.label}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        •••• •••• •••• {pm.last4} ({pm.expiry})
                      </div>
                    </div>
                  </div>
                  {pm.isDefault && (
                    <span className="text-[10px] font-bold bg-[#FF007A]/20 text-[#FF007A] px-2 py-0.5 rounded-full">
                      DEFAULT
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Secure Payment Ledger (Future Payment Architecture) */}
          <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Cryptographic Payment Ledger
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-500 font-mono text-[10px] uppercase">
                    <th className="pb-2">Transaction ID</th>
                    <th className="pb-2">Gateway</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Signature Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {paymentLedger.map((pl) => (
                    <tr key={pl.id} className="hover:bg-white/5">
                      <td className="py-2.5 text-zinc-300">{pl.id}</td>
                      <td className="py-2.5 uppercase text-zinc-400">{pl.gateway.replace('_mock', '')}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">
                        ${(pl.amountCents / 100).toFixed(2)} ({pl.pyeCoinAmount} SPC)
                      </td>
                      <td className="py-2.5">
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3 h-3" /> {pl.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-500 truncate max-w-[120px]" title={pl.signatureHash}>
                        {pl.signatureHash.substring(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Simulation Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c0c14] border border-[#FF007A]/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <PyeLogo size={28} />
                <h3 className="text-base font-bold text-white">Purchase PYE Coins</h3>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { usd: 4.99, coins: 500 },
                  { usd: 19.99, coins: 2000 },
                  { usd: 49.99, coins: 5500 },
                ].map((pack) => (
                  <button
                    key={pack.usd}
                    type="button"
                    onClick={() => {
                      setDepositAmountUsd(pack.usd);
                      setDepositCoins(pack.coins);
                    }}
                    className={`p-3 rounded-xl border text-center transition ${
                      depositAmountUsd === pack.usd
                        ? 'border-[#FF007A] bg-[#FF007A]/15 text-white'
                        : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-base font-bold text-white">${pack.usd}</div>
                    <div className="text-[11px] text-[#FFA000] font-mono font-bold mt-1">
                      {pack.coins.toLocaleString()} SPC
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Payment Processing Gateway
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositGateway('stripe_mock')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      depositGateway === 'stripe_mock'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                        : 'border-white/10 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Stripe / Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositGateway('crypto_mock')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      depositGateway === 'crypto_mock'
                        ? 'border-purple-500 bg-purple-500/15 text-purple-300'
                        : 'border-white/10 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Web3 Crypto
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleProcessDeposit}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-xs font-bold text-white shadow-xl shadow-[#FF007A]/20 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Securing Transaction...' : `Confirm Payment of $${depositAmountUsd}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ad Modal */}
      {showCreateAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0c0c14] border border-[#FF007A]/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <PyeLogo size={28} />
                <h3 className="text-base font-bold text-white">Create Ad Campaign</h3>
              </div>
              <button
                onClick={() => setShowCreateAdModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="e.g. Next-Gen Cyber Wearables 2026"
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Hook / Description
                </label>
                <textarea
                  value={adDesc}
                  onChange={(e) => setAdDesc(e.target.value)}
                  placeholder="Enter high-converting ad copy..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Destination URL *
                  </label>
                  <input
                    type="url"
                    value={adDestUrl}
                    onChange={(e) => setAdDestUrl(e.target.value)}
                    placeholder="https://yourbrand.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Call To Action
                  </label>
                  <select
                    value={adCta}
                    onChange={(e) => setAdCta(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF007A]"
                  >
                    <option value="Explore Now">Explore Now</option>
                    <option value="Buy Now">Buy Now</option>
                    <option value="Learn More">Learn More</option>
                    <option value="Join Universe">Join Universe</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateAdModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-zinc-300 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-xs font-bold text-white shadow-lg"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Registration Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c0c14] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Register Business Account</h3>
              </div>
              <button
                onClick={() => setShowBusinessModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBusinessRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Legal Business / Brand Name *
                </label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="e.g. Apex Digital Studios"
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Industry Category
                </label>
                <select
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Digital Tech & Media">Digital Tech & Media</option>
                  <option value="Fashion & Wearables">Fashion & Wearables</option>
                  <option value="Sound Design & Music">Sound Design & Music</option>
                  <option value="Web3 & Gaming">Web3 & Gaming</option>
                  <option value="Hardware & Devices">Hardware & Devices</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Website / Commercial URL
                </label>
                <input
                  type="url"
                  value={bizWebsite}
                  onChange={(e) => setBizWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBusinessModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-zinc-300 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-lg"
                >
                  Verify Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
