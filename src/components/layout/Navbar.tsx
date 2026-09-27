import React, { useState } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  Shield,
  Coins,
  Sparkles,
  User as UserIcon,
  LogOut,
  Settings,
  Tv,
  LayoutDashboard,
  CheckCircle,
} from 'lucide-react';
import { User } from '../../types';
import { PyeLogo } from '../ui/PyeLogo';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenCreate: () => void;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  onLogout: () => void;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  currentView,
  onOpenCreate,
  onOpenWallet,
  onOpenNotifications,
  onOpenMessages,
  onLogout,
  onOpenAuth,
  searchQuery,
  onSearchChange,
  unreadNotificationsCount,
  unreadMessagesCount,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#07070b]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 focus:outline-none group"
            title="PYE Social Universe"
          >
            <PyeLogo size={38} showText />
          </button>
        </div>

        {/* Middle: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (currentView !== 'search') onNavigate('search');
              }}
              placeholder="Search creators, #tags, shorts, conferences..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff1493] focus:ring-1 focus:ring-[#ff1493] transition"
            />
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Virtual Economy: Silver & Gold Coins Badge */}
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-zinc-900/90 border border-white/10 hover:border-[#ffd700]/50 transition group"
                title="PYE Virtual Currency Wallet"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:scale-110 transition" />
                  <span className="tabular-nums font-mono">
                    {currentUser.silverCoins.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-medium">SLV</span>
                </div>
                <div className="w-[1px] h-3 bg-zinc-700" />
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#ffd700]">
                  <Sparkles className="w-3 h-3 text-[#ffd700]" />
                  <span className="tabular-nums font-mono">
                    {currentUser.goldCoins.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-amber-400/80 font-medium">GLD</span>
                </div>
              </button>

              {/* Create (+) Button */}
              <button
                onClick={onOpenCreate}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-xs font-semibold text-white shadow-md shadow-[#ff1493]/20 hover:opacity-95 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>

              {/* Notifications */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff1493] rounded-full animate-pulse" />
                )}
              </button>

              {/* Messages */}
              <button
                onClick={onOpenMessages}
                className="relative p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                aria-label="Messages"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff8c00] rounded-full" />
                )}
              </button>

              {/* Profile Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full focus:outline-none ring-2 ring-transparent hover:ring-[#ff1493]/50 transition"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full bg-zinc-800 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f0f18] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">
                          {currentUser.fullName}
                        </span>
                        {currentUser.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#ff1493] shrink-0 fill-[#ff1493]/20" />
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">@{currentUser.username}</div>
                      <div className="text-[10px] text-zinc-400 mt-1">ID: {currentUser.pieId}</div>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2.5 text-zinc-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <UserIcon className="w-4 h-4 text-[#ff1493]" />
                        <span>My Universe Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('studio');
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2.5 text-zinc-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <Tv className="w-4 h-4 text-[#ff8c00]" />
                        <span>Creator Studio</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenWallet();
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2.5 text-zinc-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <Coins className="w-4 h-4 text-[#ffd700]" />
                        <span>Coin Wallet & Faucet</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('settings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2.5 text-zinc-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                        <span>Settings & Privacy</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setShowProfileMenu(false);
                          }}
                          className="w-full px-4 py-2 flex items-center gap-2.5 text-amber-300 hover:bg-amber-500/10 transition font-medium"
                        >
                          <Shield className="w-4 h-4 text-amber-400" />
                          <span>Admin Control Center</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-zinc-300 hover:text-white hover:border-[#FF007A]/60 hover:bg-white/5 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-xs font-bold text-white shadow-md shadow-[#FF007A]/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
