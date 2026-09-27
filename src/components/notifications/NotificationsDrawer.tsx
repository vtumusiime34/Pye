import React, { useState } from 'react';
import { Bell, Heart, UserPlus, Radio, MessageCircle, Calendar, CheckCheck, X } from 'lucide-react';
import { NotificationItem, User } from '../../types';
import { Storage } from '../../services/storage';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onViewProfile: (userId: string) => void;
  onUpdateNotifications: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onViewProfile,
  onUpdateNotifications,
}) => {
  if (!isOpen) return null;

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    Storage.getNotifications()
  );

  const handleMarkAllRead = () => {
    Storage.markNotificationsAsRead();
    setNotifications(Storage.getNotifications());
    onUpdateNotifications();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-[#ff8c00]" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-purple-400" />;
      case 'live':
        return <Radio className="w-3.5 h-3.5 text-rose-500" />;
      case 'conference':
        return <Calendar className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm h-full bg-[#0d0d16] border-l border-white/10 shadow-2xl flex flex-col p-4 space-y-4 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#ff1493]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Universe Notifications
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Recent Activity</span>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-[#ff8c00] hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center text-xs text-zinc-500 py-12">
              You are all caught up! No new notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.type === 'live') onNavigate('live');
                  else if (n.type === 'conference') onNavigate('conferences');
                  else onViewProfile(n.actor.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  n.isRead
                    ? 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                    : 'bg-[#ff1493]/10 border-[#ff1493]/30'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={n.actor.avatar}
                    alt={n.actor.fullName}
                    className="w-9 h-9 rounded-full bg-zinc-800 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#0d0d16]">
                    {getIcon(n.type)}
                  </div>
                </div>

                <div className="min-w-0 flex-1 text-xs">
                  <div className="leading-snug">
                    <span className="font-bold text-white">{n.actor.fullName}</span>{' '}
                    <span className="text-zinc-300">{n.content}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">{n.createdAt}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
