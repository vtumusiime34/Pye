import React, { useState, useEffect, useCallback } from 'react';
import { Storage } from './services/storage';
import { WebRTC } from './services/webrtc';
import { User, CallSession } from './types';

// Layout & Core
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { HomeFeed } from './components/home/HomeFeed';
import { PyeShorts } from './components/shorts/PyeShorts';
import { PyeSounds } from './components/sounds/PyeSounds';
import { PyeGames } from './components/games/PyeGames';
import { PyeSpacesView } from './components/spaces/PyeSpacesView';
import { PyeMonetizationCenter } from './components/monetization/PyeMonetizationCenter';
import { PyeConference } from './components/conference/PyeConference';
import { PyeRankings } from './components/rankings/PyeRankings';
import { PyeMessages } from './components/messages/PyeMessages';
import { CreatorStudio } from './components/studio/CreatorStudio';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SearchView } from './components/search/SearchView';

// Modals & Drawers
import { CreateModal } from './components/create/CreateModal';
import { PyeWalletModal } from './components/wallet/PyeWalletModal';
import { TipModal } from './components/wallet/TipModal';
import { ReportModal } from './components/safety/ReportModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { AuthPage } from './components/auth/AuthPage';
import { CallModal } from './components/messages/CallModal';

// Mobile Bottom Navigation icons
import {
  Home,
  Flame,
  Plus,
  Compass,
  MessageSquare,
  User as UserIcon,
  Phone,
  PhoneOff,
  Video,
} from 'lucide-react';

export type AppView =
  | 'home'
  | 'shorts'
  | 'sounds'
  | 'games'
  | 'spaces'
  | 'monetization'
  | 'conferences'
  | 'rankings'
  | 'messages'
  | 'notifications'
  | 'studio'
  | 'settings'
  | 'profile'
  | 'admin'
  | 'search';

export default function App() {
  // Initialize Storage schemas & seed data
  useEffect(() => {
    Storage.init();
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => Storage.getCurrentUser());

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [selectedSpaceSlug, setSelectedSpaceSlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [messageTargetUser, setMessageTargetUser] = useState<User | null>(null);

  // Modals & Popups
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: 'login' | 'signup' }>({
    isOpen: false,
    tab: 'login',
  });
  const [tipModal, setTipModal] = useState<{
    isOpen: boolean;
    targetUserId: string;
    targetName: string;
  }>({
    isOpen: false,
    targetUserId: '',
    targetName: '',
  });
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    targetId: string;
    targetType: string;
    targetTitle?: string;
  }>({
    isOpen: false,
    targetId: '',
    targetType: 'post',
  });

  // WebRTC Real-Time Calling State
  const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(() =>
    WebRTC.getCurrentSession()
  );
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [incomingCallBanner, setIncomingCallBanner] = useState<CallSession | null>(null);

  // Global Notification & Messages Counts
  const [unreadNotifications, setUnreadNotifications] = useState<number>(() => {
    return Storage.getNotifications().filter((n) => !n.isRead).length;
  });
  const [unreadMessages, setUnreadMessages] = useState<number>(() => {
    const convs = Storage.getConversations();
    return convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  });

  // Sync user changes
  const handleUserUpdated = useCallback((updated: User) => {
    setCurrentUser(updated);
    Storage.updateProfile(updated);
  }, []);

  const handleLogout = useCallback(() => {
    Storage.logout();
    setCurrentUser(null);
    setCurrentView('home');
  }, []);

  // WebRTC Calling Listener
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = WebRTC.subscribe((event) => {
      if (event.type === 'incoming_call' && event.session) {
        if (event.session.receiverId === currentUser.id) {
          setIncomingCallBanner(event.session);
        }
      } else if (event.type === 'call_connected') {
        setIncomingCallBanner(null);
        setActiveCallSession(event.session || WebRTC.getCurrentSession());
        setShowCallModal(true);
      } else if (event.type === 'call_ended') {
        setIncomingCallBanner(null);
        setActiveCallSession(null);
        setShowCallModal(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Navigate to profile
  const handleViewProfile = (userId: string) => {
    setSelectedProfileUserId(userId);
    setCurrentView('profile');
  };

  // Open direct messages with specific user
  const handleOpenMessagesWithUser = (target: User) => {
    setMessageTargetUser(target);
    setCurrentView('messages');
  };

  // Accept incoming call
  const handleAcceptIncomingCall = async () => {
    if (!incomingCallBanner) return;
    try {
      await WebRTC.answerCall(incomingCallBanner);
      setShowCallModal(true);
      setIncomingCallBanner(null);
    } catch (e) {
      console.error('Failed to answer call:', e);
    }
  };

  // Decline incoming call
  const handleDeclineIncomingCall = () => {
    if (incomingCallBanner) {
      WebRTC.rejectCall(incomingCallBanner);
      setIncomingCallBanner(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col font-sans selection:bg-[#FF007A]/30 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'profile') {
            setSelectedProfileUserId(currentUser?.id || null);
          }
          setCurrentView(v as AppView);
        }}
        onOpenCreate={() => {
          if (!currentUser) {
            setAuthModal({ isOpen: true, tab: 'login' });
          } else {
            setShowCreateModal(true);
          }
        }}
        onOpenWallet={() => setShowWalletModal(true)}
        onOpenNotifications={() => setShowNotificationsDrawer(true)}
        onOpenMessages={() => {
          if (!currentUser) {
            setAuthModal({ isOpen: true, tab: 'login' });
          } else {
            setCurrentView('messages');
          }
        }}
        onLogout={handleLogout}
        onOpenAuth={(tab = 'login') => setAuthModal({ isOpen: true, tab })}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'search') setCurrentView('search');
        }}
        unreadNotificationsCount={unreadNotifications}
        unreadMessagesCount={unreadMessages}
      />

      {/* 2. Main Content Layout (Desktop Sidebar + Center View) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(v) => {
            if (v === 'wallet') {
              setShowWalletModal(true);
              return;
            }
            if (v === 'notifications') {
              setShowNotificationsDrawer(true);
              return;
            }
            if (v === 'profile') {
              setSelectedProfileUserId(currentUser?.id || null);
            }
            setCurrentView(v as AppView);
          }}
          currentUser={currentUser}
          unreadNotificationsCount={unreadNotifications}
          unreadMessagesCount={unreadMessages}
        />

        {/* Center Main Stage View */}
        <main className="flex-1 min-w-0 px-2 sm:px-4 md:px-6 py-4 overflow-y-auto">
          {/* A. Universe Feed / Pulses (24-hour expiration, photo & video support) */}
          {currentView === 'home' && (
            <HomeFeed
              currentUser={currentUser}
              onOpenCreate={() => {
                if (!currentUser) {
                  setAuthModal({ isOpen: true, tab: 'login' });
                } else {
                  setShowCreateModal(true);
                }
              }}
              onOpenAuth={(tab = 'login') => setAuthModal({ isOpen: true, tab })}
              onReportItem={(id, type, title) =>
                setReportModal({ isOpen: true, targetId: id, targetType: type, targetTitle: title })
              }
              onOpenTipModal={(targetId, targetName) =>
                setTipModal({ isOpen: true, targetUserId: targetId, targetName })
              }
              onViewProfile={handleViewProfile}
              onSelectSpace={(slug) => {
                setSelectedSpaceSlug(slug);
                setCurrentView('spaces');
              }}
            />
          )}

          {/* B. PYES (Original Short-Form Vertical Feed, 24h expiration, photos & videos) */}
          {currentView === 'shorts' && (
            <div className="w-full flex justify-center py-2 h-[calc(100vh-5.5rem)]">
              <PyeShorts
                currentUser={currentUser}
                onOpenAuth={(tab = 'login') => setAuthModal({ isOpen: true, tab })}
                onOpenTipModal={(targetId, targetName) =>
                  setTipModal({ isOpen: true, targetUserId: targetId, targetName })
                }
                onReportItem={(id, type, title) =>
                  setReportModal({
                    isOpen: true,
                    targetId: id,
                    targetType: type,
                    targetTitle: title,
                  })
                }
                onViewProfile={handleViewProfile}
                onOpenCreate={() => {
                  if (!currentUser) {
                    setAuthModal({ isOpen: true, tab: 'login' });
                  } else {
                    setShowCreateModal(true);
                  }
                }}
              />
            </div>
          )}

          {/* C. PYE Sounds Library */}
          {currentView === 'sounds' && (
            <PyeSounds
              currentUser={currentUser}
              onOpenAuth={(tab = 'login') => setAuthModal({ isOpen: true, tab })}
              onViewProfile={handleViewProfile}
              onUseSoundInPyes={(sound) => {
                setCurrentView('shorts');
              }}
              onOpenCreateSound={() => {
                if (!currentUser) {
                  setAuthModal({ isOpen: true, tab: 'login' });
                } else {
                  setShowCreateModal(true);
                }
              }}
            />
          )}

          {/* D. PYE Games */}
          {currentView === 'games' && (
            <PyeGames
              currentUser={currentUser}
              onOpenAuth={(tab = 'login') => setAuthModal({ isOpen: true, tab })}
              onOpenWallet={() => setShowWalletModal(true)}
            />
          )}

          {/* E. PYE Spaces (Categories & Thematic Hubs) */}
          {currentView === 'spaces' && (
            <PyeSpacesView
              currentUser={currentUser}
              onOpenCreate={() => {
                if (!currentUser) {
                  setAuthModal({ isOpen: true, tab: 'login' });
                } else {
                  setShowCreateModal(true);
                }
              }}
              onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
              onViewProfile={handleViewProfile}
              onReportItem={(id, type, title) =>
                setReportModal({ isOpen: true, targetId: id, targetType: type, targetTitle: title })
              }
              onOpenTipModal={(targetId, targetName) =>
                setTipModal({ isOpen: true, targetUserId: targetId, targetName })
              }
            />
          )}

          {/* F. Monetization Center (Coins, Earnings, Creator Fund) */}
          {currentView === 'monetization' && (
            <PyeMonetizationCenter
              currentUser={currentUser}
              onOpenAuth={(tab = 'login') => setAuthModal({ isOpen: true, tab })}
            />
          )}

          {/* G. Virtual Conferences */}
          {currentView === 'conferences' && (
            <PyeConference
              currentUser={currentUser}
              onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
              onViewProfile={handleViewProfile}
            />
          )}

          {/* H. Leaderboard & Rankings */}
          {currentView === 'rankings' && (
            <PyeRankings
              currentUser={currentUser}
              onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
              onViewProfile={handleViewProfile}
            />
          )}

          {/* I. Direct Messages with WebRTC Real-Time Calling */}
          {currentView === 'messages' && (
            <PyeMessages
              currentUser={currentUser}
              onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
              onReportItem={(id, type, title) =>
                setReportModal({ isOpen: true, targetId: id, targetType: type, targetTitle: title })
              }
              onViewProfile={handleViewProfile}
              initialTargetUser={messageTargetUser}
            />
          )}

          {/* J. Creator Studio */}
          {currentView === 'studio' && (
            <CreatorStudio
              currentUser={currentUser}
              onOpenCreate={() => setShowCreateModal(true)}
              onViewProfile={handleViewProfile}
            />
          )}

          {/* K. Settings & Privacy */}
          {currentView === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onUserUpdated={handleUserUpdated}
              onLogout={handleLogout}
              onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
            />
          )}

          {/* L. User Profile (Pioneer profiles with Follow, Message button, and Followers/Following modals) */}
          {currentView === 'profile' && (
            <ProfileView
              userId={selectedProfileUserId || currentUser?.id || 'pye_official'}
              currentUser={currentUser}
              onOpenAuth={(tab = 'login') => setAuthModal({ isOpen: true, tab })}
              onUserUpdated={handleUserUpdated}
              onNavigateToPyes={() => setCurrentView('shorts')}
              onOpenMessagesWithUser={handleOpenMessagesWithUser}
              onNavigateToProfile={handleViewProfile}
            />
          )}

          {/* M. Admin Console */}
          {currentView === 'admin' && (
            <AdminDashboard
              currentUser={currentUser}
              onNavigate={(v) => setCurrentView(v as AppView)}
            />
          )}

          {/* N. Global Search View */}
          {currentView === 'search' && (
            <SearchView
              initialQuery={searchQuery}
              onNavigate={(v) => setCurrentView(v as AppView)}
              onViewProfile={handleViewProfile}
              onSelectHashtag={(tag) => {
                setSearchQuery(`#${tag}`);
              }}
            />
          )}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07070b]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            currentView === 'home' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Universe</span>
        </button>

        <button
          onClick={() => setCurrentView('shorts')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            currentView === 'shorts' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>PYES</span>
        </button>

        {/* Center Create Button */}
        <button
          onClick={() => {
            if (!currentUser) {
              setAuthModal({ isOpen: true, tab: 'login' });
            } else {
              setShowCreateModal(true);
            }
          }}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF007A] to-[#FFA000] flex items-center justify-center text-white shadow-lg shadow-[#FF007A]/30 active:scale-95 transition -mt-3 border-2 border-[#07070b]"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentView('spaces')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            currentView === 'spaces' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Spaces</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              setAuthModal({ isOpen: true, tab: 'login' });
            } else {
              setSelectedProfileUserId(currentUser.id);
              setCurrentView('profile');
            }
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            currentView === 'profile' ? 'text-[#FF007A]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* 4. Incoming Real-Time WebRTC Call Toast Banner */}
      {incomingCallBanner && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-4 rounded-3xl bg-zinc-900/95 border border-[#FF007A]/50 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={incomingCallBanner.callerAvatar}
              alt={incomingCallBanner.callerName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#FF007A] animate-pulse"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                {incomingCallBanner.callerName}
              </h4>
              <p className="text-[11px] text-[#FFA000] flex items-center gap-1 font-semibold">
                {incomingCallBanner.type === 'video' ? (
                  <Video className="w-3.5 h-3.5" />
                ) : (
                  <Phone className="w-3.5 h-3.5" />
                )}
                <span>Incoming {incomingCallBanner.type} call...</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDeclineIncomingCall}
              className="p-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition active:scale-95 shadow-lg shadow-rose-500/20"
              title="Decline"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
            <button
              onClick={handleAcceptIncomingCall}
              className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition active:scale-95 shadow-lg shadow-emerald-500/20 animate-bounce"
              title="Accept"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Active WebRTC Call Modal */}
      {showCallModal && currentUser && (
        <CallModal
          currentUserId={currentUser.id}
          onClose={() => {
            setShowCallModal(false);
            setActiveCallSession(null);
          }}
        />
      )}

      {/* 6. Create Modal (Pulses, PYES, Sounds) */}
      <CreateModal
        currentUser={currentUser}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
      />

      {/* 7. Virtual Wallet Modal (Silver & Gold Coins) */}
      <PyeWalletModal
        currentUser={currentUser}
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onUserUpdated={handleUserUpdated}
      />

      {/* 8. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        onNavigate={(v) => {
          setShowNotificationsDrawer(false);
          setCurrentView(v as AppView);
        }}
        onViewProfile={(uid) => {
          setShowNotificationsDrawer(false);
          handleViewProfile(uid);
        }}
        onUpdateNotifications={() => {
          setUnreadNotifications(
            Storage.getNotifications().filter((n) => !n.isRead).length
          );
        }}
      />

      {/* 9. Tip Pioneer Modal */}
      <TipModal
        currentUser={currentUser}
        isOpen={tipModal.isOpen}
        targetUserId={tipModal.targetUserId}
        targetName={tipModal.targetName}
        onClose={() => setTipModal({ isOpen: false, targetUserId: '', targetName: '' })}
        onSuccess={() => {
          setTipModal({ isOpen: false, targetUserId: '', targetName: '' });
          if (currentUser) {
            handleUserUpdated(Storage.getCurrentUser() || currentUser);
          }
        }}
        onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
        onUserUpdated={handleUserUpdated}
      />

      {/* 10. Report Item Modal */}
      <ReportModal
        currentUser={currentUser}
        isOpen={reportModal.isOpen}
        targetId={reportModal.targetId}
        targetType={reportModal.targetType}
        targetTitle={reportModal.targetTitle}
        onClose={() =>
          setReportModal({ isOpen: false, targetId: '', targetType: 'post' })
        }
        onOpenAuth={() => setAuthModal({ isOpen: true, tab: 'login' })}
      />

      {/* 11. Authentication Modal (Login / Signup) */}
      {authModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#0b0b14] border border-white/10 rounded-3xl shadow-2xl p-6 my-8">
            <button
              onClick={() => setAuthModal({ isOpen: false, tab: 'login' })}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
            >
              ✕
            </button>
            <AuthPage
              initialTab={authModal.tab}
              onSuccess={(user) => {
                setCurrentUser(user);
                setAuthModal({ isOpen: false, tab: 'login' });
              }}
              onExploreAsGuest={() => setAuthModal({ isOpen: false, tab: 'login' })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
