import React from 'react';
import {
  Home,
  Flame,
  Music,
  Gamepad2,
  Users2,
  Trophy,
  MessageSquare,
  Bell,
  Sparkles,
  Settings,
  Shield,
  LayoutDashboard,
  Compass,
  Coins,
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  unreadNotificationsCount,
  unreadMessagesCount,
}) => {
  const navItems: { id: string; label: string; icon: any; badge?: string; isLive?: boolean }[] = [
    { id: 'home', label: 'Universe Feed', icon: Home },
    { id: 'shorts', label: 'PYES', icon: Flame },
    { id: 'sounds', label: 'PYE Sounds', icon: Music },
    { id: 'games', label: 'PYE Games', icon: Gamepad2 },
    { id: 'spaces', label: 'PYE Spaces', icon: Compass },
    { id: 'monetization', label: 'Monetization Center', icon: Coins },
    { id: 'conferences', label: 'Conferences', icon: Users2 },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
  ];

  const secondaryItems = [
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessagesCount },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotificationsCount },
    { id: 'studio', label: 'Creator Studio', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-white/5 bg-[#07070b] p-4 overflow-y-auto select-none">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Main Universe
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/10 text-white border-l-2 border-[#FF007A]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#FF007A]' : item.isLive ? 'text-[#FF007A]' : 'text-zinc-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.isLive && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Live
                </span>
              )}

              {item.badge && !item.isLive && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#FFA000]/15 text-[#FFA000] text-[9px] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Social & Studio
        </div>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/10 text-white border-l-2 border-[#FF007A]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFA000]' : 'text-zinc-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#FF007A] text-white text-[10px] font-bold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition mt-2 ${
              currentView === 'admin'
                ? 'bg-amber-500/20 text-amber-200 border-l-2 border-amber-400'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Admin Console</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
              ROOT
            </span>
          </button>
        )}
      </div>

      {/* Mini Promotion Banner */}
      <div className="mt-auto pt-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FF007A]/15 via-[#FF6A00]/10 to-transparent border border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FFA000]" />
            <span>PYE Universe Daily</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5">
            Claim free PYE Silver & Gold daily. Real balances, zero inflation.
          </p>
          <button
            onClick={() => onNavigate('wallet')}
            className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold text-zinc-200 transition"
          >
            Claim Faucet Grant
          </button>
        </div>
      </div>
    </aside>
  );
};
