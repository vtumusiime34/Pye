import React, { useState } from 'react';
import { User, Conference } from './types';
import { Storage } from './services/storage';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { RightSidebar } from './components/layout/RightSidebar';

// View Components
import { HomeFeed } from './components/home/HomeFeed';
import { PyeShorts } from './components/shorts/PyeShorts';
import { PyeSpacesView } from './components/spaces/PyeSpacesView';
import { PyeTube } from './components/tube/PyeTube';
import { PyeLive } from './components/live/PyeLive';
import { PyeConference } from './components/conference/PyeConference';
import { PyeRankings } from './components/rankings/PyeRankings';
import { CreatorStudio } from './components/studio/CreatorStudio';
import { PyeMessages } from './components/messages/PyeMessages';
import { ProfileView } from './components/profile/ProfileView';
import { SearchView } from './components/search/SearchView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';

// Modals
import { CreateModal } from './components/create/CreateModal';
import { PyeWalletModal } from './components/wallet/PyeWalletModal';
import { TipModal } from './components/wallet/TipModal';
import { ReportModal } from './components/safety/ReportModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => Storage.getCurrentUser());
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewedProfileId, setViewedProfileId] = useState<string>(currentUser?.id || 'user_pye_official');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [tipTarget, setTipTarget] = useState<{ id: string; name: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    type: string;
    title?: string;
  } | null>(null);

  const handleOpenAuth = (tab: 'login' | 'signup' = 'login') => {
    setAuthInitialTab(tab);
    setShowAuthModal(true);
  };

  // Global toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real synchronized state from relational storage
  const [creators, setCreators] = useState<User[]>(() =>
    Storage.getUsers().filter((u) => u.id !== currentUser?.id)
  );
  const [conferences, setConferences] = useState<Conference[]>(() => Storage.getConferences());
  const [notifications, setNotifications] = useState(() => Storage.getNotifications());
  const [conversations, setConversations] = useState(() => Storage.getConversations());

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleUserLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    setViewedProfileId(user.id);
    setCreators(Storage.getUsers().filter((u) => u.id !== user.id));
    showToast(`Welcome to PYE Social Universe, @${user.username}!`);
  };

  const handleLogout = () => {
    Storage.logout();
    setCurrentUser(null);
    showToast('Signed out of PYE Universe.');
  };

  const handleFollowToggle = (userId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const isNow = Storage.toggleFollow(userId);
    setCreators(Storage.getUsers().filter((u) => u.id !== currentUser.id));
    showToast(isNow ? 'Creator followed!' : 'Unfollowed.');
  };

  const handleViewProfile = (userId: string) => {
    setViewedProfileId(userId);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHashtag = (tag: string) => {
    setSearchQuery(tag);
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectConference = (conf: Conference) => {
    setCurrentView('conferences');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user navigates to standalone Landing page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnter={() => setShowAuthModal(true)}
        onExplore={() => setCurrentView('home')}
      />
    );
  }

  // If standalone Auth View is requested
  if (showAuthModal && !currentUser) {
    return (
      <AuthPage
        initialTab={authInitialTab}
        onSuccess={handleUserLoginSuccess}
        onExploreAsGuest={() => {
          setShowAuthModal(false);
          setCurrentView('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-[#f1f1f5] flex flex-col selection:bg-[#FF007A] selection:text-white">
      {/* Global Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-[#FF007A]/60 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onNavigate={(view) => {
          if (view === 'profile' && currentUser) {
            setViewedProfileId(currentUser.id);
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentView={currentView}
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenWallet={() => setShowWalletModal(true)}
        onOpenNotifications={() => setShowNotificationsDrawer(true)}
        onOpenMessages={() => setCurrentView('messages')}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'search') setCurrentView('search');
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Main 3-Column Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start">
        {/* Left Sidebar (Desktop) */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'profile' && currentUser) {
              setViewedProfileId(currentUser.id);
            }
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
        />

        {/* Central View Content Area */}
        <main
          className={`flex-1 min-w-0 overflow-x-hidden ${
            currentView === 'shorts' ? 'p-1 sm:p-3 lg:p-4' : 'p-3 sm:p-5 lg:p-6'
          }`}
        >
          {currentView === 'home' && (
            <HomeFeed
              currentUser={currentUser}
              onOpenCreate={() => setShowCreateModal(true)}
              onOpenAuth={handleOpenAuth}
              onReportItem={(id, type, title) => setReportTarget({ id, type, title })}
              onOpenTipModal={(id, name) => setTipTarget({ id, name })}
              onViewProfile={handleViewProfile}
              onSelectSpace={(slug) => {
                setCurrentView('spaces');
              }}
            />
          )}

          {currentView === 'shorts' && (
            <PyeShorts
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenTipModal={(id, name) => setTipTarget({ id, name })}
              onReportItem={(id, type, title) => setReportTarget({ id, type, title })}
              onViewProfile={handleViewProfile}
              onOpenCreate={() => setShowCreateModal(true)}
            />
          )}

          {currentView === 'spaces' && (
            <PyeSpacesView
              currentUser={currentUser}
              onOpenCreate={() => setShowCreateModal(true)}
              onOpenAuth={handleOpenAuth}
              onViewProfile={handleViewProfile}
              onReportItem={(id, type, title) => setReportTarget({ id, type, title })}
              onOpenTipModal={(id, name) => setTipTarget({ id, name })}
            />
          )}

          {currentView === 'tube' && (
            <PyeTube
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenTipModal={(id, name) => setTipTarget({ id, name })}
              onReportItem={(id, type, title) => setReportTarget({ id, type, title })}
              onViewProfile={handleViewProfile}
            />
          )}

          {currentView === 'live' && (
            <PyeLive
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenTipModal={(id, name) => setTipTarget({ id, name })}
              onReportItem={(id, type, title) => setReportTarget({ id, type, title })}
              onViewProfile={handleViewProfile}
            />
          )}

          {currentView === 'conferences' && (
            <PyeConference
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onViewProfile={handleViewProfile}
            />
          )}

          {currentView === 'rankings' && (
            <PyeRankings
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onViewProfile={handleViewProfile}
            />
          )}

          {currentView === 'studio' && (
            <CreatorStudio
              currentUser={currentUser}
              onOpenCreate={() => setShowCreateModal(true)}
              onViewProfile={handleViewProfile}
            />
          )}

          {currentView === 'messages' && (
            <PyeMessages
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onReportItem={(id, type, title) => setReportTarget({ id, type, title })}
              onViewProfile={handleViewProfile}
            />
          )}

          {currentView === 'search' && (
            <SearchView
              initialQuery={searchQuery}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewProfile={handleViewProfile}
              onSelectHashtag={handleSelectHashtag}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              userId={viewedProfileId}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onUserUpdated={(updated) => setCurrentUser(updated)}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onUserUpdated={(updated) => setCurrentUser(updated)}
              onLogout={handleLogout}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {currentView === 'admin' && (
            <AdminDashboard
              currentUser={currentUser}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}
        </main>

        {/* Right Discovery Sidebar (Desktop, on Home feed) */}
        {currentView === 'home' && (
          <RightSidebar
            creators={creators}
            conferences={conferences}
            onFollowToggle={handleFollowToggle}
            isFollowing={(id) => Storage.isFollowing(id)}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectHashtag={handleSelectHashtag}
            onSelectConference={handleSelectConference}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'profile' && currentUser) {
            setViewedProfileId(currentUser.id);
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreate={() => setShowCreateModal(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
      />

      {/* --- Global Modals --- */}

      {/* Create Content Modal */}
      <CreateModal
        currentUser={currentUser}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(msg) => {
          showToast(msg);
          setCurrentView('home');
        }}
        onOpenAuth={() => {
          setShowCreateModal(false);
          handleOpenAuth('login');
        }}
        onGoLiveTrigger={() => setCurrentView('live')}
        onGoConferenceTrigger={() => setCurrentView('conferences')}
      />

      {/* Virtual Currency Wallet & Faucet Modal */}
      <PyeWalletModal
        currentUser={currentUser}
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onUserUpdated={(u) => setCurrentUser(u)}
      />

      {/* Tip Creator Modal */}
      {tipTarget && (
        <TipModal
          currentUser={currentUser}
          targetUserId={tipTarget.id}
          targetName={tipTarget.name}
          isOpen={!!tipTarget}
          onClose={() => setTipTarget(null)}
          onSuccess={(msg) => showToast(msg)}
          onOpenAuth={() => {
            setTipTarget(null);
            handleOpenAuth('login');
          }}
          onUserUpdated={(u) => setCurrentUser(u)}
        />
      )}

      {/* Safety & Moderation Report Modal */}
      {reportTarget && (
        <ReportModal
          currentUser={currentUser}
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          targetTitle={reportTarget.title}
          onOpenAuth={() => {
            setReportTarget(null);
            handleOpenAuth('login');
          }}
        />
      )}

      {/* Slide-out Notifications Drawer */}
      <NotificationsDrawer
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        onNavigate={(view) => {
          setCurrentView(view);
          setShowNotificationsDrawer(false);
        }}
        onViewProfile={handleViewProfile}
        onUpdateNotifications={() => setNotifications(Storage.getNotifications())}
      />
    </div>
  );
}
