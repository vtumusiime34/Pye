import React, { useState } from 'react';
import {
  X,
  Shield,
  Users,
  Mail,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { PyeLogo } from '../ui/PyeLogo';

interface AboutAppixModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'founders' | 'support' | 'privacy' | 'terms';
}

export const AboutAppixModal: React.FC<AboutAppixModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'about' | 'founders' | 'support' | 'privacy' | 'terms'>(
    initialTab
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c0c16] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PyeLogo size={34} showText showAppixTag />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 px-6 bg-black/30 overflow-x-auto text-xs font-semibold gap-1 py-1.5">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/20 text-white border border-[#FF007A]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            About APPIX & PYE
          </button>
          <button
            onClick={() => setActiveTab('founders')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'founders'
                ? 'bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/20 text-white border border-[#FF007A]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Leadership & Founders
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'support'
                ? 'bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/20 text-white border border-[#FF007A]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Support & Inquiries
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/20 text-white border border-[#FF007A]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/20 text-white border border-[#FF007A]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF007A]/15 via-[#FF6A00]/10 to-transparent border border-white/10">
                <h3 className="text-sm font-black text-white font-display mb-1">
                  PYE Social Universe — An APPIX Project
                </h3>
                <p className="text-zinc-300">
                  PYE Social Universe is a next-generation decentralized-style media and social architecture created by **APPIX**. It merges short-form vertical reels (PYES), genuine community pulses, original audio stem synthesis, real-time WebRTC communications, and competitive turn-based multiplayer arcade gaming into a seamless single platform.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#FFA000] uppercase tracking-wider font-mono">
                    Zero Fake Metrics
                  </span>
                  <p className="text-[11px] text-zinc-300">
                    No bot engagement or inflated view totals. 1 verified person watching for 2 seconds equals 1 genuine view.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#FF007A] uppercase tracking-wider font-mono">
                    Real WebRTC Calling
                  </span>
                  <p className="text-[11px] text-zinc-300">
                    Peer-to-peer crystal clear voice and video calling directly from conversations or profile cards.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'founders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white font-display">
                APPIX Executive Leadership & Core Founders
              </h3>

              <div className="space-y-3">
                {/* Linus The Great */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=LinusTheGreat&backgroundColor=FF007A,FFA000"
                      alt="LTG"
                      className="w-12 h-12 rounded-xl bg-zinc-800 object-cover ring-2 ring-[#FF007A]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">Linus The Great (LTG)</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF007A]/20 text-[#FF007A] border border-[#FF007A]/30">
                          FOUNDER & LEAD
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Chief Software Architect, System Design & APPIX Creator
                      </p>
                      <a
                        href="mailto:abenaitwelinus153@gmail.com"
                        className="text-[10px] font-mono text-[#FFA000] hover:underline"
                      >
                        abenaitwelinus153@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Trix */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=TrixPye&backgroundColor=FF007A,FFA000"
                      alt="Trix"
                      className="w-12 h-12 rounded-xl bg-zinc-800 object-cover ring-2 ring-[#FFA000]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">Trix</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFA000]/20 text-[#FFA000] border border-[#FFA000]/30">
                          CO-FOUNDER
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Platform Infrastructure & Security Operations
                      </p>
                      <a
                        href="mailto:appixconsultations@proton.me"
                        className="text-[10px] font-mono text-[#FFA000] hover:underline"
                      >
                        appixconsultations@proton.me
                      </a>
                    </div>
                  </div>
                </div>

                {/* Timothy */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=TimothyA&backgroundColor=FF007A,FFA000"
                      alt="Timothy"
                      className="w-12 h-12 rounded-xl bg-zinc-800 object-cover ring-2 ring-emerald-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">Timothy Ainomugisha</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          OPERATIONS
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Quality Assurance, Partner Relations & Moderation
                      </p>
                      <a
                        href="mailto:ainomugishatimothy2011@gmail.com"
                        className="text-[10px] font-mono text-[#FFA000] hover:underline"
                      >
                        ainomugishatimothy2011@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white font-display">
                APPIX & PYE Official Contact Channels
              </h3>
              <p className="text-zinc-300">
                For administrative inquiries, copyright infringement claims, security audits, and moderation appeals, reach our verified support desk:
              </p>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF007A]" />
                  <a href="mailto:abenaitwelinus153@gmail.com" className="text-white hover:underline">
                    abenaitwelinus153@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FFA000]" />
                  <a href="mailto:appixconsultations@proton.me" className="text-white hover:underline">
                    appixconsultations@proton.me
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <a href="mailto:ainomugishatimothy2011@gmail.com" className="text-white hover:underline">
                    ainomugishatimothy2011@gmail.com
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-display">
                APPIX Data Protection & Privacy Architecture
              </h3>
              <p>
                PYE Social Universe prioritizes user safety, local sovereignty, and end-to-end communication hygiene. We do not sell personal data or monetize private conversations.
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Direct messages utilize cryptographic protections and client-authoritative privacy.</li>
                <li>Temporary content (Pulses and PYES) automatically expires within 24 hours.</li>
                <li>Users may delete their content at any time.</li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-display">
                Community Guidelines & Terms of Service
              </h3>
              <p>
                By accessing PYE Social Universe, users agree to respect intellectual property rights and community safety. Harassment, unauthorized copyright infringement, spamming, and malicious conduct result in permanent account termination.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
