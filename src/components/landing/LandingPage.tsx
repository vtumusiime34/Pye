import React from 'react';
import {
  Flame,
  Music,
  Gamepad2,
  Users2,
  Trophy,
  Coins,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { PyeLogo } from '../ui/PyeLogo';

interface LandingPageProps {
  onEnter: () => void;
  onExplore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onExplore }) => {
  return (
    <div className="relative min-h-screen bg-[#07070b] text-white overflow-hidden">
      {/* Background Animated Atmosphere */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PyeLogo size={38} showText />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExplore}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition"
          >
            Explore Universe
          </button>
          <button
            onClick={onEnter}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-xs font-bold text-white shadow-lg shadow-[#FF007A]/25 hover:opacity-95 transition"
          >
            Sign In / Join
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-[#FFA000]" />
          <span>The Next Frontier of Social Media Architecture</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase font-display leading-[1.08]">
            More than a social app. <br />
            <span className="pye-gradient-text">It's a universe.</span>
          </h1>
          <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            PYE fuses short-form vertical reels (PYES), curated PYE Sounds, multiplayer PYE Games, virtual multi-speaker summits, and a centralized Monetization Center into one seamless ecosystem.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onEnter}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-white font-extrabold text-sm shadow-xl shadow-[#FF007A]/20 hover:scale-105 active:scale-95 transition flex items-center gap-2"
          >
            <span>Enter PYE Universe</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExplore}
            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition"
          >
            Explore Content Feed
          </button>
        </div>

        {/* Hero Pillars Showcase Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 text-left">
          <div className="p-4 rounded-2xl bg-[#0f0f18]/80 border border-white/10 backdrop-blur-md space-y-2">
            <Flame className="w-6 h-6 text-[#FF007A]" />
            <h3 className="text-sm font-bold text-white">PYES</h3>
            <p className="text-xs text-zinc-400">
              PYE&apos;s original vertical video universe with haptic interactions, live audio, and instant creator tipping.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0f18]/80 border border-white/10 backdrop-blur-md space-y-2">
            <Music className="w-6 h-6 text-[#FFA000]" />
            <h3 className="text-sm font-bold text-white">PYE Sounds</h3>
            <p className="text-xs text-zinc-400">
              High-fidelity sound catalog, audio waveforms, discovery playlists, and creator original music tracks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0f18]/80 border border-white/10 backdrop-blur-md space-y-2">
            <Gamepad2 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">PYE Games</h3>
            <p className="text-xs text-zinc-400">
              Multiplayer board & strategy games: Chess, Checkers, Ludo, Snakes & Ladders, and PYE Tycoon.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0f18]/80 border border-white/10 backdrop-blur-md space-y-2">
            <Users2 className="w-6 h-6 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Conferences</h3>
            <p className="text-xs text-zinc-400">
              Interactive multi-speaker virtual stages with agenda RSVPs and stage discussion.
            </p>
          </div>
        </div>
      </section>

      {/* Virtual Economy Highlight */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="rounded-3xl bg-gradient-to-r from-[#ffd700]/10 via-[#ff1493]/10 to-transparent border border-[#ffd700]/30 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2 text-xs font-bold text-[#ffd700] uppercase tracking-wider">
              <Coins className="w-4 h-4" />
              <span>Dual Virtual Economy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              PYE Silver & PYE Gold
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Every citizen earns PYE Silver through genuine community participation and daily faucets. Reward visionary creators directly with PYE Gold tips.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 text-center min-w-[130px]">
              <div className="text-xs text-zinc-400 font-semibold mb-1">PYE SILVER</div>
              <div className="text-xl font-bold font-mono text-white">250 Free</div>
              <div className="text-[10px] text-zinc-500 mt-1">Daily Grant</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#ffd700]/20 to-zinc-900 border border-[#ffd700]/40 text-center min-w-[130px]">
              <div className="text-xs text-[#ffd700] font-semibold mb-1">PYE GOLD</div>
              <div className="text-xl font-bold font-mono text-[#ffd700]">Creator Tier</div>
              <div className="text-[10px] text-zinc-400 mt-1">Direct Tipping</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <PyeLogo size={20} />
          <span>PYE SOCIAL UNIVERSE © 2026. Built for high-speed, modern social interaction.</span>
        </div>
        <div className="flex gap-4">
          <span onClick={onEnter} className="hover:text-white cursor-pointer">
            Sign In
          </span>
          <span onClick={onExplore} className="hover:text-white cursor-pointer">
            Feed
          </span>
          <span className="hover:text-white cursor-pointer">Privacy</span>
          <span className="hover:text-white cursor-pointer">Terms</span>
        </div>
      </footer>
    </div>
  );
};
