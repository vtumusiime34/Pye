import React, { useState } from 'react';
import {
  Users2,
  Calendar,
  Clock,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Hand,
  PhoneOff,
  Send,
  Plus,
  CheckCircle,
  Share2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Conference, User } from '../../types';
import { Storage } from '../../services/storage';

interface PyeConferenceProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onViewProfile: (userId: string) => void;
}

export const PyeConference: React.FC<PyeConferenceProps> = ({
  currentUser,
  onOpenAuth,
  onViewProfile,
}) => {
  const [conferences, setConferences] = useState<Conference[]>(() => Storage.getConferences());
  const [activeRoom, setActiveRoom] = useState<Conference | null>(null);
  
  // Interactive Room States
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [roomChat, setRoomChat] = useState<{ id: string; sender: string; text: string }[]>([
    { id: '1', sender: 'Alex Vance', text: 'Welcome everyone to the summit! We are starting the keynote in 2 minutes.' },
    { id: '2', sender: 'Maya Lin', text: 'Stems are linked in the stage notes.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Create Conference Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-10-15');
  const [newTime, setNewTime] = useState('17:00 UTC');
  const [newMax, setNewMax] = useState(500);
  const [newCategory, setNewCategory] = useState('Technology & Meta');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleJoin = (conf: Conference) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const isJoined = Storage.toggleJoinConference(conf.id);
    setConferences(Storage.getConferences());
    showToast(isJoined ? 'RSVP confirmed! Added to your schedule.' : 'RSVP cancelled.');
  };

  const handleEnterRoom = (conf: Conference) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setActiveRoom(conf);
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setIsHandRaised(false);
  };

  const handleSendRoomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    setRoomChat((prev) => [
      ...prev,
      {
        id: `chat_${Date.now()}`,
        sender: currentUser.fullName,
        text: chatInput.trim(),
      },
    ]);
    setChatInput('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newTitle.trim()) return;

    const created = Storage.createConference({
      hostId: currentUser.id,
      host: {
        id: currentUser.id,
        username: currentUser.username,
        fullName: currentUser.fullName,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      title: newTitle.trim(),
      description: newDesc.trim(),
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
      scheduledDate: newDate,
      scheduledTime: newTime,
      maxParticipants: Number(newMax),
      privacy: 'public',
      speakers: [currentUser.fullName],
      category: newCategory,
    });

    setConferences([created, ...conferences]);
    setShowCreateModal(false);
    showToast('Conference summit scheduled and announced!');
  };

  // If user is inside an active conference room stage:
  if (activeRoom) {
    return (
      <div className="w-full max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4 pb-4">
        {/* Stage Header */}
        <div className="p-3.5 rounded-2xl bg-[#0f0f18] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h2 className="text-sm font-bold text-white">{activeRoom.title}</h2>
              <div className="text-xs text-zinc-400">
                Hosted by {activeRoom.host.fullName} · {activeRoom.currentParticipants} Attendees
              </div>
            </div>
          </div>

          <button
            onClick={handleLeaveRoom}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave Stage</span>
          </button>
        </div>

        {/* Stage Video Grid & Live Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
          {/* Main Stage Grid (3 Cols) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-black border border-white/10 overflow-y-auto">
            {/* Primary Keynote Speaker Tile */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-purple-500/40 aspect-video flex items-center justify-center">
              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{activeRoom.host.fullName} (Host / Speaker)</span>
              </div>
            </div>

            {/* Co-host / Participant 2 */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 aspect-video flex items-center justify-center">
              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Maya Lin (Speaker)</span>
              </div>
            </div>

            {/* Current User Camera Tile */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900/90 border border-white/10 aspect-video flex flex-col items-center justify-center text-center p-4">
              {isVideoOn ? (
                <div className="w-full h-full flex items-center justify-center text-emerald-400 text-xs">
                  [WebRTC Camera Active]
                </div>
              ) : (
                <img
                  src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me'}
                  alt="My avatar"
                  className="w-16 h-16 rounded-full bg-zinc-800 object-cover ring-2 ring-[#ff1493]"
                />
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2">
                <span>{currentUser?.fullName || 'You'}</span>
                {!isMicOn && <MicOff className="w-3 h-3 text-rose-400" />}
              </div>
            </div>

            {/* Participant 4 */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900/90 border border-white/10 aspect-video flex flex-col items-center justify-center text-center p-4">
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=ZenoSpace"
                alt="Zeno"
                className="w-16 h-16 rounded-full bg-zinc-800 object-cover"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2">
                <span>Dr. Zeno Stark</span>
              </div>
            </div>
          </div>

          {/* Room Side Chat (1 Col) */}
          <div className="p-3.5 rounded-2xl bg-[#0f0f18] border border-white/10 flex flex-col h-full">
            <div className="pb-2 border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider">
              Stage Chat
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
              {roomChat.map((m) => (
                <div key={m.id} className="p-2 rounded-xl bg-zinc-900/60 border border-white/5">
                  <span className="font-semibold text-[#ff8c00]">{m.sender}: </span>
                  <span className="text-zinc-200">{m.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendRoomChat} className="pt-2 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message stage..."
                className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-purple-600 text-white disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Stage Bottom Controls */}
        <div className="p-3 rounded-2xl bg-[#0f0f18] border border-white/10 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              isMicOn ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-rose-400" />}
            <span>{isMicOn ? 'Mute Mic' : 'Unmute Mic'}</span>
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              isVideoOn ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
            <span>{isVideoOn ? 'Turn Video Off' : 'Turn Video On'}</span>
          </button>

          <button
            onClick={() => {
              setIsHandRaised(!isHandRaised);
              showToast(isHandRaised ? 'Hand lowered' : 'Hand raised! The host has been notified.');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              isHandRaised ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#ff1493]/50 text-white text-xs shadow-2xl backdrop-blur-md">
          {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-[#0f0f18] border border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Users2 className="w-4 h-4" />
            <span>PYE Global Conferences & Summits</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Connect Across Virtual Stages
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-lg">
            Host live keynotes, interactive multi-speaker summits, and developer roundtables with zero lag.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setShowCreateModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#ff1493] text-xs font-bold text-white shadow-lg shadow-purple-600/25 hover:opacity-95 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Host a Conference</span>
        </button>
      </div>

      {/* Conferences List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conferences.map((conf) => (
          <div
            key={conf.id}
            className="rounded-2xl bg-[#0f0f18] border border-white/5 hover:border-white/10 transition overflow-hidden flex flex-col shadow-xl"
          >
            {/* Cover image */}
            <div className="relative aspect-video bg-zinc-800">
              <img
                src={conf.coverImage}
                alt={conf.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                {conf.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-[#ff8c00]" />
                  <span>{conf.scheduledDate}</span>
                  <span>·</span>
                  <Clock className="w-3.5 h-3.5 text-[#ff8c00]" />
                  <span>{conf.scheduledTime}</span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                  {conf.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {conf.description}
                </p>
              </div>

              {/* Host & Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={conf.host.avatar}
                    alt={conf.host.fullName}
                    className="w-6 h-6 rounded-full bg-zinc-800 object-cover shrink-0"
                  />
                  <span className="text-xs text-zinc-300 font-medium truncate">
                    {conf.host.fullName}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleJoin(conf)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      conf.isJoined
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {conf.isJoined ? 'Joined' : 'RSVP'}
                  </button>

                  <button
                    onClick={() => handleEnterRoom(conf)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#ff1493] text-white text-xs font-bold shadow-md hover:opacity-95 transition"
                  >
                    Enter Stage
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Host Conference Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0f0f18] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users2 className="w-5 h-5 text-purple-400" />
                <span>Host Virtual Summit</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Conference Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Quantum Computing & Spatial Web Summit"
                  required
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description & Agenda
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Topics, keynote speakers, session agenda..."
                  rows={3}
                  required
                  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="18:00 UTC"
                    required
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Technology & Meta">Technology & Meta</option>
                    <option value="Audio Engineering">Audio Engineering</option>
                    <option value="Science & Space">Science & Space</option>
                    <option value="Film & Motion">Film & Motion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Max Attendees</label>
                  <input
                    type="number"
                    value={newMax}
                    onChange={(e) => setNewMax(Number(e.target.value))}
                    min={10}
                    max={10000}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-[#ff1493] text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition mt-2"
              >
                Schedule & Publish Conference
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
