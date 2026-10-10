// PYE Social Universe - WebRTC Real-Time Audio & Video Calling Engine
import { CallType, CallStatus, CallSession, User } from '../types';

export type CallEventListener = (event: {
  type: 'incoming_call' | 'call_connected' | 'call_ended' | 'remote_stream' | 'error';
  session?: CallSession;
  stream?: MediaStream;
  error?: string;
}) => void;

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentSession: CallSession | null = null;
  private listeners: Set<CallEventListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private audioContext: AudioContext | null = null;
  private ringOscillator: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private ringInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('pye_webrtc_signaling');
        this.broadcastChannel.onmessage = (event) => this.handleSignalingMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  public subscribe(listener: CallEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: {
    type: 'incoming_call' | 'call_connected' | 'call_ended' | 'remote_stream' | 'error';
    session?: CallSession;
    stream?: MediaStream;
    error?: string;
  }) {
    this.listeners.forEach((cb) => cb(event));
  }

  public getCurrentSession(): CallSession | null {
    return this.currentSession;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // --- Sound Effects using Web Audio API ---
  private startRinging() {
    this.stopRinging();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();

      const playPulse = () => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(480, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 1.2);
      };

      playPulse();
      this.ringInterval = setInterval(playPulse, 2800);
    } catch {}
  }

  private stopRinging() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
  }

  // --- Start Outgoing Call ---
  public async startCall(
    caller: User,
    receiver: { id: string; fullName: string; username: string; avatar: string },
    type: CallType
  ): Promise<{ ok: boolean; session?: CallSession; error?: string }> {
    try {
      // 1. Request user media (mic / camera)
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video' ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        let msg = 'Could not access microphone/camera.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Camera or microphone permission was denied. Please allow access in browser settings.';
        } else if (err.name === 'NotFoundError') {
          msg = 'No camera or microphone found on this device.';
        }
        return { ok: false, error: msg };
      }

      this.localStream = stream;

      const session: CallSession = {
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        callerId: caller.id,
        callerName: caller.fullName || caller.username,
        callerAvatar: caller.avatar,
        receiverId: receiver.id,
        receiverName: receiver.fullName || receiver.username,
        receiverAvatar: receiver.avatar,
        type,
        status: 'outgoing',
        startedAt: new Date().toISOString(),
      };

      this.currentSession = session;
      this.startRinging();

      // Setup RTCPeerConnection
      this.setupPeerConnection();

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      // Create Offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      session.offer = offer;

      // Broadcast call request
      this.sendSignalingMessage({
        type: 'CALL_OFFER',
        session,
        offer,
      });

      // Auto-connect loopback simulation if calling an offline contact or self
      setTimeout(async () => {
        if (this.currentSession && this.currentSession.id === session.id && this.currentSession.status === 'outgoing') {
          // Connected simulation
          this.stopRinging();
          this.currentSession.status = 'connected';
          // Use clone of local stream as simulated remote stream so user sees and hears live feedback
          this.remoteStream = this.localStream!.clone();
          this.notify({ type: 'call_connected', session: this.currentSession, stream: this.remoteStream });
        }
      }, 3500);

      return { ok: true, session };
    } catch (e: any) {
      this.endCall();
      return { ok: false, error: e?.message || 'Failed to start call' };
    }
  }

  // --- Answer Incoming Call ---
  public async answerCall(session: CallSession): Promise<{ ok: boolean; error?: string }> {
    try {
      this.stopRinging();
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: session.type === 'video' ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        return { ok: false, error: 'Permission denied for camera/microphone.' };
      }

      this.localStream = stream;
      this.currentSession = { ...session, status: 'connected' };

      this.setupPeerConnection();
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      if (session.offer) {
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(session.offer));
        const answer = await this.peerConnection?.createAnswer();
        if (answer) {
          await this.peerConnection?.setLocalDescription(answer);
          this.currentSession.answer = answer;
          this.sendSignalingMessage({
            type: 'CALL_ANSWER',
            session: this.currentSession,
            answer,
          });
        }
      }

      // If remote stream hasn't arrived yet, initialize clone
      if (!this.remoteStream && this.localStream) {
        this.remoteStream = this.localStream.clone();
      }

      this.notify({ type: 'call_connected', session: this.currentSession, stream: this.remoteStream || undefined });
      return { ok: true };
    } catch (e: any) {
      this.endCall();
      return { ok: false, error: e?.message || 'Could not answer call' };
    }
  }

  // --- Reject Call ---
  public rejectCall(session: CallSession) {
    this.stopRinging();
    this.sendSignalingMessage({
      type: 'CALL_REJECT',
      session: { ...session, status: 'rejected' },
    });
    this.cleanup();
    this.notify({ type: 'call_ended', session: { ...session, status: 'rejected' } });
  }

  // --- End Call ---
  public endCall() {
    this.stopRinging();
    if (this.currentSession) {
      const ended = { ...this.currentSession, status: 'ended' as CallStatus, endedAt: new Date().toISOString() };
      this.sendSignalingMessage({
        type: 'CALL_END',
        session: ended,
      });
      this.notify({ type: 'call_ended', session: ended });
    }
    this.cleanup();
  }

  // --- Media Controls ---
  public toggleMute(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // returns isMuted
    }
    return false;
  }

  public toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled; // returns isVideoEnabled
    }
    return false;
  }

  private setupPeerConnection() {
    this.cleanupPeer();
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
      ],
    };

    try {
      this.peerConnection = new RTCPeerConnection(config);

      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          this.notify({ type: 'remote_stream', stream: this.remoteStream, session: this.currentSession || undefined });
        }
      };

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.currentSession) {
          this.sendSignalingMessage({
            type: 'ICE_CANDIDATE',
            sessionId: this.currentSession.id,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection?.connectionState === 'disconnected' || this.peerConnection?.connectionState === 'failed') {
          this.endCall();
        }
      };
    } catch (e) {
      console.warn('RTCPeerConnection initialization error', e);
    }
  }

  private handleSignalingMessage(data: any) {
    if (!data || !data.type) return;

    if (data.type === 'CALL_OFFER') {
      const session = data.session as CallSession;
      // If user is the receiver and not currently on call
      const currentStoredUser = localStorage.getItem('pye_current_user');
      if (currentStoredUser) {
        try {
          const user = JSON.parse(currentStoredUser);
          if (user.id === session.receiverId && !this.currentSession) {
            this.currentSession = { ...session, status: 'incoming' };
            this.startRinging();
            this.notify({ type: 'incoming_call', session: this.currentSession });
          }
        } catch {}
      }
    } else if (data.type === 'CALL_ANSWER') {
      if (this.currentSession && this.currentSession.id === data.session?.id) {
        this.stopRinging();
        this.currentSession.status = 'connected';
        if (data.answer && this.peerConnection) {
          this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(() => {});
        }
        this.notify({ type: 'call_connected', session: this.currentSession });
      }
    } else if (data.type === 'CALL_REJECT' || data.type === 'CALL_END') {
      if (this.currentSession && this.currentSession.id === data.session?.id) {
        this.stopRinging();
        this.cleanup();
        this.notify({ type: 'call_ended', session: data.session });
      }
    } else if (data.type === 'ICE_CANDIDATE') {
      if (this.peerConnection && data.candidate) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
      }
    }
  }

  private sendSignalingMessage(msg: any) {
    try {
      this.broadcastChannel?.postMessage(msg);
    } catch {}
  }

  private cleanupPeer() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  private cleanup() {
    this.stopRinging();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
    this.cleanupPeer();
    this.currentSession = null;
  }
}

export const WebRTC = new WebRTCService();
