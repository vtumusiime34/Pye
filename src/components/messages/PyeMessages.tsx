import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  MoreVertical,
  Shield,
  Search,
  CheckCircle,
  X,
  Trash2,
  Phone,
  Video,
} from 'lucide-react';
import { Conversation, User, CallType } from '../../types';
import { Storage } from '../../services/storage';
import { WebRTC } from '../../services/webrtc';
import { CallModal } from './CallModal';
import { PyeLogo } from '../ui/PyeLogo';

interface PyeMessagesProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onReportItem: (itemId: string, itemType: string, title?: string) => void;
  onViewProfile: (userId: string) => void;
  initialConversationId?: string;
  initialTargetUser?: User | null;
}

export const PyeMessages: React.FC<PyeMessagesProps> = ({
  currentUser,
  onOpenAuth,
  onReportItem,
  onViewProfile,
  initialConversationId,
  initialTargetUser,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const list = Storage.getConversations();
    if (initialTargetUser && currentUser) {
      const conv = Storage.getOrCreateConversation(currentUser.id, initialTargetUser);
      if (!list.some((c) => c.id === conv.id)) {
        return [conv, ...list];
      }
    }
    return list;
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => {
    if (initialConversationId) return initialConversationId;
    if (initialTargetUser && currentUser) {
      const conv = Storage.getOrCreateConversation(currentUser.id, initialTargetUser);
      return conv.id;
    }
    return conversations[0]?.id || '';
  });

  const [msgInput, setMsgInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);

  // Listen to incoming call events
  useEffect(() => {
    const unsubscribe = WebRTC.subscribe((event) => {
      if (event.type === 'incoming_call') {
        setShowCallModal(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialTargetUser && currentUser) {
      const conv = Storage.getOrCreateConversation(currentUser.id, initialTargetUser);
      setConversations(Storage.getConversations());
      setActiveConvId(conv.id);
    } else if (initialConversationId) {
      setActiveConvId(initialConversationId);
    }
  }, [initialTargetUser, initialConversationId, currentUser]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleStartCall = async (type: CallType) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!activeConversation) return;

    setShowCallModal(true);
    const res = await WebRTC.startCall(
      currentUser,
      activeConversation.participant,
      type
    );
    if (!res.ok) {
      showToast(res.error || 'Could not initiate call');
      setShowCallModal(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!msgInput.trim() || !activeConvId) return;

    const updated = Storage.sendDirectMessage(activeConvId, msgInput.trim());
    if (updated) {
      setConversations(Storage.getConversations());
      setMsgInput('');

      // Auto-reply simulation from contact for vivid realism after 1.5 seconds!
      setTimeout(() => {
        const replies = [
          'Got it! Sounds awesome.',
          'Let me test the latency on my side and get back to you.',
          'Agreed! Catch you on the next stage.',
          'Checking the pipeline now!',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const convs = Storage.getConversations();
        const target = convs.find((c) => c.id === activeConvId);
        if (target) {
          target.messages.push({
            id: `dm_reply_${Date.now()}`,
            senderId: target.participant.id,
            senderName: target.participant.fullName,
            senderAvatar: target.participant.avatar,
            text: randomReply,
            timestamp: 'Just now',
            isMine: false,
          });
          target.lastMessage = randomReply;
          target.lastMessageTime = 'Just now';
          localStorage.setItem('pye_conversations', JSON.stringify(convs));
          setConversations(convs);
        }
      }, 1500);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.participant.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.participant.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-8rem)] rounded-3xl bg-[#0f0f18] border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row pb-2">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#ff1493]/50 text-white text-xs shadow-2xl backdrop-blur-md">
          {toastMsg}
        </div>
      )}

      {/* Left List of Conversations */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-[#0b0b12]">
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PyeLogo size={20} />
              <span>PYE Chat</span>
            </h2>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff1493]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full p-3.5 flex items-center gap-3 text-left transition ${
                  isSelected ? 'bg-white/5 border-l-2 border-[#ff1493]' : 'hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.participant.avatar}
                    alt={conv.participant.fullName}
                    className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
                  />
                  {conv.participant.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0b0b12]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-white truncate">
                      {conv.participant.fullName}
                    </span>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Conversation Window */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-[#0f0f18]">
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => onViewProfile(activeConversation.participant.id)}>
                <img
                  src={activeConversation.participant.avatar}
                  alt={activeConversation.participant.fullName}
                  className="w-9 h-9 rounded-full bg-zinc-800 object-cover"
                />
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onViewProfile(activeConversation.participant.id)}
                    className="text-xs font-bold text-white hover:text-[#ff1493] transition"
                  >
                    {activeConversation.participant.fullName}
                  </button>
                  {activeConversation.participant.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff1493] shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-zinc-400">
                  @{activeConversation.participant.username}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Voice Call Button */}
              <button
                type="button"
                onClick={() => handleStartCall('voice')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/5 transition flex items-center gap-1.5"
                title="Start Voice Call (WebRTC)"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-semibold text-zinc-300">Voice</span>
              </button>

              {/* Video Call Button */}
              <button
                type="button"
                onClick={() => handleStartCall('video')}
                className="p-2 rounded-xl bg-gradient-to-r from-[#FF007A]/20 to-[#FFA000]/20 hover:from-[#FF007A]/30 hover:to-[#FFA000]/30 text-[#FFA000] border border-[#FF007A]/30 transition flex items-center gap-1.5 shadow"
                title="Start Video Call (WebRTC)"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-semibold text-white">Video</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onReportItem(
                    activeConversation.id,
                    'message',
                    `Conversation with @${activeConversation.participant.username}`
                  )
                }
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition"
                title="Report Conversation"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConversation.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-sm rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow ${
                    m.isMine
                      ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white rounded-tr-none'
                      : 'bg-zinc-800/90 text-zinc-200 rounded-tl-none border border-white/5'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Send Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder={`Message @${activeConversation.participant.username}...`}
              className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff1493]"
            />
            <button
              type="submit"
              disabled={!msgInput.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-zinc-500">
          Select a conversation from the left to start messaging.
        </div>
      )}
      {showCallModal && (
        <CallModal
          currentUserId={currentUser?.id || ''}
          onClose={() => setShowCallModal(false)}
        />
      )}
    </div>
  );
};
