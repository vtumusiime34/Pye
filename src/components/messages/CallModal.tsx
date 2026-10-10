import React, { useEffect, useRef, useState } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { CallSession } from '../../types';
import { WebRTC } from '../../services/webrtc';

interface CallModalProps {
  currentUserId: string;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ currentUserId, onClose }) => {
  const [session, setSession] = useState<CallSession | null>(WebRTC.getCurrentSession());
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationTimerRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = WebRTC.subscribe((event) => {
      if (event.type === 'incoming_call' || event.type === 'call_connected') {
        setSession(event.session || WebRTC.getCurrentSession());
        if (event.type === 'call_connected') {
          // Attach remote stream
          const remote = WebRTC.getRemoteStream();
          if (remote && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remote;
          }
        }
      } else if (event.type === 'remote_stream') {
        if (event.stream && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.stream;
        }
      } else if (event.type === 'call_ended') {
        setSession(null);
        onClose();
      }
    });

    return () => {
      unsubscribe();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [onClose]);

  // Attach local stream
  useEffect(() => {
    const local = WebRTC.getLocalStream();
    if (local && localVideoRef.current) {
      localVideoRef.current.srcObject = local;
    }
  }, [session?.status]);

  // Duration counter when connected
  useEffect(() => {
    if (session?.status === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [session?.status]);

  if (!session) return null;

  const isIncoming = session.status === 'incoming' && session.receiverId === currentUserId;
  const isVideo = session.type === 'video';
  const partnerName = session.callerId === currentUserId ? session.receiverName : session.callerName;
  const partnerAvatar = session.callerId === currentUserId ? session.receiverAvatar : session.callerAvatar;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    const res = await WebRTC.answerCall(session);
    if (!res.ok) {
      alert(res.error || 'Failed to answer call');
    }
  };

  const handleReject = () => {
    WebRTC.rejectCall(session);
    onClose();
  };

  const handleEnd = () => {
    WebRTC.endCall();
    onClose();
  };

  const handleToggleMute = () => {
    const muted = WebRTC.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleVideo = () => {
    const videoOn = WebRTC.toggleVideo();
    setIsVideoEnabled(videoOn);
  };

  // --- 1. Incoming Call Prompt ---
  if (isIncoming) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-sm rounded-3xl bg-[#0f0f18] border border-[#FF007A]/40 p-6 text-center shadow-2xl space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF007A] to-[#FFA000] animate-ping opacity-40" />
            <img
              src={partnerAvatar}
              alt={partnerName}
              className="relative w-24 h-24 rounded-full object-cover ring-4 ring-[#FF007A] shadow-xl"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">{partnerName}</h3>
            <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              {isVideo ? (
                <>
                  <Video className="w-3.5 h-3.5 text-[#FFA000]" />
                  <span>Incoming PYE Video Call...</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5 text-[#FF007A]" />
                  <span>Incoming PYE Voice Call...</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              onClick={handleReject}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
              title="Decline Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={handleAccept}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition animate-bounce"
              title="Answer Call"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. Minimized Floating Call Bar ---
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 p-3 rounded-2xl bg-black/90 border border-white/10 shadow-2xl backdrop-blur-md flex items-center gap-3">
        <img src={partnerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        <div className="text-xs">
          <div className="font-bold text-white truncate max-w-[100px]">{partnerName}</div>
          <div className="text-[10px] text-emerald-400 font-mono">
            {session.status === 'connected' ? formatDuration(callDuration) : 'Calling...'}
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleEnd}
          className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // --- 3. Full Call Screen (Voice or Video) ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[720px] rounded-3xl bg-[#090912] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Top Header */}
        <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={partnerAvatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF007A]/50"
            />
            <div>
              <h4 className="text-sm font-bold text-white">{partnerName}</h4>
              <p className="text-xs text-zinc-400 font-mono">
                {session.status === 'connected' ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {formatDuration(callDuration)}
                  </span>
                ) : (
                  <span className="text-amber-400">Calling...</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Audio Area */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
          {isVideo ? (
            <>
              {/* Remote Video Stream */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Local Video Stream Preview */}
              <div className="absolute top-4 right-4 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-900 z-10">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                />
                {!isVideoEnabled && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 text-[10px]">
                    <VideoOff className="w-5 h-5 mb-1" />
                    <span>Camera Off</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Voice Call Graphic */
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000] p-1 shadow-2xl animate-pulse">
                  <img
                    src={partnerAvatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-black/80 border border-white/10 text-[#FFA000]">
                  <Volume2 className="w-5 h-5" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-sm font-bold text-white">PYE Encrypted Audio</div>
                <div className="text-xs text-zinc-500">Real-time low-latency WebRTC transmission</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 p-4 pb-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 to-transparent">
          {/* Mute Mic */}
          <button
            onClick={handleToggleMute}
            className={`p-3.5 rounded-full border transition ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Camera (if Video Call) */}
          {isVideo && (
            <button
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-full border transition ${
                !isVideoEnabled
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
              }`}
              title={isVideoEnabled ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {!isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={handleEnd}
            className="p-3.5 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
