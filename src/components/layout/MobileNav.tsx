import React from 'react';
import { Home, Flame, Plus, Music, User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCreate: () => void;
  currentUser: User | null;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onOpenCreate,
  currentUser,
  onOpenAuth,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#07070b]/95 backdrop-blur-lg border-t border-white/10 px-2 flex items-center justify-around">
      {/* 1. Home */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center w-14 h-full transition ${
          currentView === 'home' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Universe</span>
      </button>

      {/* 2. PYES */}
      <button
        onClick={() => onNavigate('shorts')}
        className={`flex flex-col items-center justify-center w-14 h-full transition ${
          currentView === 'shorts' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1 tracking-wider">PYES</span>
      </button>

      {/* 3. Create (+) - Prominent center button */}
      <button
        onClick={currentUser ? onOpenCreate : () => onOpenAuth('signup')}
        className="flex items-center justify-center -mt-4 w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000] p-[2px] shadow-lg shadow-[#FF007A]/30 active:scale-95 transition"
        aria-label="Create content"
      >
        <div className="w-full h-full bg-[#07070b] rounded-full flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
      </button>

      {/* 4. Sounds */}
      <button
        onClick={() => onNavigate('sounds')}
        className={`flex flex-col items-center justify-center w-14 h-full transition ${
          currentView === 'sounds' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Music className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Sounds</span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => {
          if (currentUser) {
            onNavigate('profile');
          } else {
            onOpenAuth('login');
          }
        }}
        className={`flex flex-col items-center justify-center w-14 h-full transition ${
          currentView === 'profile' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
        }`}
      >
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt="Profile"
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <UserIcon className="w-5 h-5" />
        )}
        <span className="text-[10px] font-medium mt-1">Profile</span>
      </button>
    </nav>
  );
};
