import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Users,
  Heart,
  Send,
  Sparkles,
  Gift,
  Share2,
  AlertTriangle,
  Play,
  Square,
  CheckCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LiveStream, User } from '../../types';
import { Storage } from '../../services/storage';

interface PyeLiveProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenTipModal: (targetUserId: string, targetName: string) => void;
  onReportItem: (itemId: string, itemType: string, title?: string) => void;
  onViewProfile: (userId: string) => void;
}

export const PyeLive: React.FC<PyeLiveProps> = ({
  currentUser,
  onOpenAuth,
  onOpenTipModal,
  onReportItem,
  onViewProfile,
}) => {
  const [lives, setLives] = useState<LiveStream[]>(() => Storage.getLives());
  const [activeLive, setActiveLive] = useState<LiveStream>(() => lives[0] || null);
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Broadcast modal state for creators
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('Creative & Code');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Scroll chat on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeLive?.chatMessages]);

  // Periodic random reactions and simulated viewer comments for vitality
  useEffect(() => {
    if (!activeLive || !activeLive.isLive) return;

    const interval = setInterval(() => {
      // 30% chance of random viewer chat
      if (Math.random() > 0.6) {
        const sampleComments = [
          'Audio levels are so crisp! 🎧',
          'Greetings from Neo Tokyo!',
          'Can you show that modulation routing again?',
          'This is why I love PYE Universe 🔥',
          'Volumetric textures look insane',
        ];
        const randomText = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        const simulatedSenders = ['alex_fan', 'synth_lover', 'quantum_dev', 'cyber_pilot'];
        const randomSender = simulatedSenders[Math.floor(Math.random() * simulatedSenders.length)];

        const newMsg = {
          id: `sim_${Date.now()}`,
          sender: {
            id: `u_${randomSender}`,
            username: randomSender,
            fullName: randomSender.replace('_', ' ').toUpperCase(),
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSender}`,
            isVerified: false,
          },
          text: randomText,
          timestamp: 'Just now',
        };

        setActiveLive((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            chatMessages: [...prev.chatMessages.slice(-40), newMsg],
          };
          return updated;
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [activeLive?.id]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!chatInput.trim() || !activeLive) return;

    const sent = Storage.sendLiveChatMessage(activeLive.id, chatInput.trim());
    setActiveLive((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, sent],
    }));
    setChatInput('');
  };

  const handleHeartReaction = () => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    setFloatingHearts((prev) => [...prev, { id, left }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);

    // Update active stream likes count
    setActiveLive((prev) => ({ ...prev, likesCount: prev.likesCount + 1 }));
  };

  const handleStartBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!broadcastTitle.trim()) return;

    const newLive = Storage.startLiveStream({
      title: broadcastTitle.trim(),
      category: broadcastCategory,
      coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    });

    setLives([newLive, ...lives]);
    setActiveLive(newLive);
    setIsBroadcasting(true);
    setShowBroadcastModal(false);
    showToast('Your live stream has begun! You are now on air.');
  };

  const handleEndBroadcast = () => {
    if (!activeLive) return;
    Storage.endLiveStream(activeLive.id);
    setIsBroadcasting(false);
    setActiveLive((prev) => ({ ...prev, isLive: false }));
    showToast('Live broadcast ended.');
  };

  const handleShareLive = async () => {
    if (!activeLive) return;
    const url = `${window.location.origin}/#live-${activeLive.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PYE Live: ${activeLive.title}`,
          url,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(url);
    showToast('Live stream link copied!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#ff1493]/50 text-white text-xs shadow-2xl backdrop-blur-md">
          {toastMsg}
        </div>
      )}

      {/* Top Banner & Start Live CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-[#0f0f18] border border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              PYE Live Transmissions
            </h2>
            <p className="text-xs text-zinc-400">
              Real-time streams, masterclasses, and interactive live rooms.
            </p>
          </div>
        </div>

        {isBroadcasting ? (
          <button
            onClick={handleEndBroadcast}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/30"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>End Live Broadcast</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
              } else {
                setShowBroadcastModal(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#ff1493]/20"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Go Live Now</span>
          </button>
        )}
      </div>

      {/* Main Broadcast Viewer & Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Video Stream Stage */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-2xl flex items-center justify-center">
            {/* Live Video Canvas */}
            <video
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
              poster={activeLive.coverImage}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Floating Heart Burst Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {floatingHearts.map((heart) => (
                <div
                  key={heart.id}
                  style={{ left: `${heart.left}%` }}
                  className="absolute bottom-10 animate-fade-up text-[#ff1493] drop-shadow-lg"
                >
                  <Heart className="w-8 h-8 fill-[#ff1493]" />
                </div>
              ))}
            </div>

            {/* Overlays: LIVE Pill & Viewer Counter */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/40">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                LIVE
              </span>

              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                <Users className="w-3.5 h-3.5 text-zinc-300" />
                <span className="tabular-nums font-mono">
                  {(activeLive.viewersCount || activeLive.viewerCount || 0).toLocaleString()}
                </span>
              </span>
            </div>

            {/* Sound toggle button */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/90 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom Stream Details Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between z-10">
              <div className="space-y-1 max-w-lg">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                  {activeLive.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white drop-shadow">
                  {activeLive.title}
                </h3>
              </div>

              {/* Heart burst reaction trigger */}
              <button
                onClick={handleHeartReaction}
                className="w-12 h-12 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 backdrop-blur-md flex items-center justify-center text-rose-400 active:scale-125 transition shadow-lg"
                title="Send Live Heart"
              >
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </button>
            </div>
          </div>

          {/* Stream Host & Action Bar */}
          <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => onViewProfile(activeLive.hostId)}>
                <img
                  src={activeLive.host.avatar}
                  alt={activeLive.host.fullName}
                  className="w-11 h-11 rounded-full bg-zinc-800 object-cover ring-2 ring-rose-500"
                  referrerPolicy="no-referrer"
                />
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onViewProfile(activeLive.hostId)}
                    className="text-sm font-semibold text-white hover:text-rose-400 transition"
                  >
                    {activeLive.host.fullName}
                  </button>
                  {activeLive.host.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff1493] shrink-0" />
                  )}
                </div>
                <div className="text-xs text-zinc-400">@{activeLive.host.username}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenTipModal(activeLive.hostId, activeLive.host.fullName)}
                className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Tip Creator</span>
              </button>

              <button
                onClick={handleShareLive}
                className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white transition"
                title="Share Live"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onReportItem(activeLive.id, 'live', activeLive.title)}
                className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-rose-400 transition"
                title="Report Live"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Real-time Live Chat Feed */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 flex flex-col h-[520px] shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Broadcast Chat
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              {activeLive.likesCount.toLocaleString()} ❤️
            </span>
          </div>

          {/* Chat Messages Log */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 scrollbar-thin text-xs"
          >
            {activeLive.chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <img
                  src={msg.sender.avatar}
                  alt={msg.sender.fullName}
                  className="w-5 h-5 rounded-full bg-zinc-800 object-cover mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-semibold truncate ${
                        msg.isHost ? 'text-rose-400' : 'text-zinc-300'
                      }`}
                    >
                      {msg.sender.fullName}
                    </span>
                    {msg.isHost && (
                      <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                        HOST
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-200 break-words leading-relaxed mt-0.5">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to live room..."
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-[#ff1493] text-white disabled:opacity-40 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Start Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f0f18] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-500" />
                <span>Configure Live Broadcast</span>
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleStartBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Broadcast Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g., Live Shader Coding & Ambient Synth Jam"
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
                <select
                  value={broadcastCategory}
                  onChange={(e) => setBroadcastCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Creative & Code">Creative & Code</option>
                  <option value="Music & Production">Music & Production</option>
                  <option value="Science & Space">Science & Space</option>
                  <option value="Gaming & Virtual">Gaming & Virtual</option>
                  <option value="Metaverse Talk">Metaverse Talk</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-[11px] text-zinc-400 space-y-1">
                <div className="font-semibold text-white">Broadcast Permissions:</div>
                <div>✓ WebRTC low-latency transmission</div>
                <div>✓ Live chat moderation active</div>
                <div>✓ PYE Silver & Gold tipping enabled</div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-[#ff1493] text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:opacity-95 transition"
              >
                Go Live
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
