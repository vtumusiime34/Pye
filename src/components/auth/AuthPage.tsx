import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  CheckCircle,
  Info,
  LogIn,
  UserPlus,
  Send,
  Calendar,
  Sparkles,
  ArrowLeft,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { Storage } from '../../services/storage';
import { User } from '../../types';
import { PyeLogo } from '../ui/PyeLogo';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onExploreAsGuest?: () => void;
  initialTab?: 'login' | 'signup' | 'appeal';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onExploreAsGuest,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'appeal'>(initialTab);

  // Sync if initialTab prop changes
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupBirthDate, setSignupBirthDate] = useState('2002-05-15');
  const [signupGender, setSignupGender] = useState<'boy' | 'girl' | 'other'>('other');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [avatarSeedIndex, setAvatarSeedIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [usernameStatus, setUsernameStatus] = useState<{
    text: string;
    color: string;
    suggestions: string[];
  }>({
    text: 'Use 3-20 lowercase letters, numbers, or underscores',
    color: 'text-zinc-400',
    suggestions: [],
  });

  // Appeal form state
  const [appealUsername, setAppealUsername] = useState('');
  const [appealEmail, setAppealEmail] = useState('');
  const [appealMessage, setAppealMessage] = useState('');

  // Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Avatar variations based on username and seed
  const avatarStyles = ['bottts', 'adventurer', 'shapes', 'icons'];
  const currentAvatarStyle = avatarStyles[avatarSeedIndex % avatarStyles.length];
  const previewAvatarUrl = `https://api.dicebear.com/7.x/${currentAvatarStyle}/svg?seed=${
    signupUsername || 'pioneer'
  }&backgroundColor=FF007A,FFA000`;

  // Real-time username validation and suggestions
  useEffect(() => {
    const v = signupUsername.trim();
    if (!v) {
      setUsernameStatus({
        text: 'Use 3-20 lowercase letters, numbers, or underscores',
        color: 'text-zinc-400',
        suggestions: [],
      });
      return;
    }
    if (!/^[a-z0-9_]+$/i.test(v)) {
      setUsernameStatus({
        text: 'Only letters, numbers, and underscores allowed',
        color: 'text-rose-400',
        suggestions: [],
      });
      return;
    }

    const timer = setTimeout(() => {
      const res = Storage.checkUsernameAvailability(v);
      if (res.available) {
        setUsernameStatus({
          text: '✓ Username is available',
          color: 'text-emerald-400',
          suggestions: [],
        });
      } else {
        setUsernameStatus({
          text: 'Username is taken. Try one of these:',
          color: 'text-amber-400',
          suggestions: res.suggestions,
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [signupUsername]);

  // Handle Real Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      showToast('Please enter your username or email.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await Storage.login(loginUsername, loginPassword);
      if (!res.ok) {
        showToast(res.error || 'Login failed. Please check your credentials.', 'error');
        return;
      }

      if (res.user) {
        showToast(`Welcome back to PYE Universe, @${res.user.username}!`, 'success');
        onSuccess(res.user);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Real Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupFullName.trim()) {
      showToast('Please enter your full name or display name.', 'error');
      return;
    }
    if (!signupUsername.trim() || signupUsername.trim().length < 3) {
      showToast('Username must be at least 3 characters.', 'error');
      return;
    }
    if (signupPassword !== signupConfirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (signupPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (!termsAccepted) {
      showToast('Please accept the Terms of Service & Privacy Policy.', 'error');
      return;
    }

    // Age validation (must be at least 13)
    if (signupBirthDate) {
      const birth = new Date(signupBirthDate);
      const now = new Date();
      const age = now.getFullYear() - birth.getFullYear();
      if (age < 13) {
        showToast('You must be at least 13 years old to join PYE.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await Storage.register({
        fullName: signupFullName,
        username: signupUsername,
        email: signupEmail,
        birthDate: signupBirthDate,
        gender: signupGender,
        password: signupPassword,
      });

      if (!res.ok) {
        showToast(res.error || 'Registration failed.', 'error');
        return;
      }

      if (res.user) {
        showToast(
          `Account created! Welcome to PYE Universe, ${res.user.fullName}! PYE ID: ${res.user.pieId}`,
          'success'
        );
        onSuccess(res.user);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Account Appeal
  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealUsername || !appealEmail) {
      showToast('Please enter your username and email.', 'error');
      return;
    }
    Storage.submitAppeal({
      username: appealUsername,
      email: appealEmail,
      message: appealMessage || 'User requested account access recovery via web form.',
    });
    showToast('Appeal submitted for review. We will contact you at your email.', 'success');
    setTab('login');
  };

  return (
    <div className="auth-body relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#07070b]">
      {/* Background Animated Canvas with Glowing Orbs */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 z-50 px-5 py-3 rounded-2xl border text-xs font-semibold shadow-2xl backdrop-blur-md transition-all animate-bounce ${
            toastType === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastType === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-zinc-900/90 border-zinc-700 text-white'
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Main Glass Card Shell */}
      <div className="relative z-10 w-full max-w-[460px]">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          {/* Logo & Header using exact official logo */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="mb-2 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-[#FF007A]/20 hover:scale-105 transition">
              <PyeLogo size={68} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display mt-2">
              PYE Social Universe
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {tab === 'login' && 'Sign in to access your feed, wallet & reels'}
              {tab === 'signup' && 'Create your genuine citizen account in seconds'}
              {tab === 'appeal' && 'Restore access to your universe account'}
            </p>
          </div>

          {/* Prominent Segmented Switcher for Login / Signup */}
          <div className="flex items-center p-1 bg-zinc-900/90 rounded-2xl border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-white shadow-md shadow-[#FF007A]/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                tab === 'signup'
                  ? 'bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-white shadow-md shadow-[#FF007A]/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* TAB 1: REAL LOGIN PAGE */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Username or email"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF007A] focus:ring-1 focus:ring-[#FF007A] transition"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF007A] focus:ring-1 focus:ring-[#FF007A] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-700 text-[#FF007A] focus:ring-0 bg-zinc-800"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTab('appeal')}
                  className="text-zinc-400 hover:text-[#FFA000] transition"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] hover:opacity-95 active:scale-[0.99] transition shadow-lg shadow-[#FF007A]/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to PYE'}</span>
              </button>

              <div className="pt-2 text-center text-xs text-zinc-400">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-[#FF007A] hover:underline font-semibold"
                >
                  Create one now
                </button>
              </div>

              {onExploreAsGuest && (
                <div className="pt-3 border-t border-white/5 text-center">
                  <button
                    type="button"
                    onClick={onExploreAsGuest}
                    className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                  >
                    Explore PYE as guest →
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: REAL SIGNUP PAGE */}
          {tab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              {/* Welcome Bonus Callout */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF007A]/15 via-[#FF5500]/15 to-[#FFA000]/15 border border-[#FFA000]/30 flex items-center gap-2 text-xs text-zinc-200">
                <Coins className="w-4 h-4 text-[#FFA000] shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong className="text-[#FFA000]">Welcome Bonus:</strong> Get{' '}
                  <strong className="text-white">250 Silver</strong> +{' '}
                  <strong className="text-[#FFA000]">10 Gold Coins</strong> credited to your wallet!
                </span>
              </div>

              {/* Avatar Live Preview with Style Changer */}
              <div className="flex items-center gap-3 p-2 bg-zinc-900/60 rounded-xl border border-white/5">
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000]">
                  <img
                    src={previewAvatarUrl}
                    alt="Avatar Preview"
                    className="w-12 h-12 rounded-full bg-zinc-800 object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white truncate">
                    {signupFullName || 'Your Profile Avatar'}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    @{signupUsername || 'username'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarSeedIndex((prev) => prev + 1)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-medium text-zinc-300 border border-zinc-700 transition"
                  title="Randomize avatar style"
                >
                  Change Style
                </button>
              </div>

              {/* Full Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder="Full name or display name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF007A] transition"
                />
              </div>

              {/* Username with Availability Indicator */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <span className="text-xs font-bold text-zinc-400">@</span>
                  </div>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) =>
                      setSignupUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))
                    }
                    placeholder="Choose unique username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF007A] transition"
                  />
                </div>
                <div className={`text-[11px] mt-1 px-1 ${usernameStatus.color}`}>
                  {usernameStatus.text}
                </div>
                {usernameStatus.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {usernameStatus.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setSignupUsername(sug)}
                        className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-[#FF007A]/20 border border-zinc-700 text-[10px] text-zinc-300 transition"
                      >
                        @{sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF007A] transition"
                />
              </div>

              {/* Birthdate & Gender (No Phone Required) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    value={signupBirthDate}
                    onChange={(e) => setSignupBirthDate(e.target.value)}
                    required
                    title="Date of birth (13+)"
                    className="w-full pl-8 pr-2 py-2 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-[#FF007A] transition"
                  />
                </div>

                <div className="relative">
                  <select
                    value={signupGender}
                    onChange={(e) => setSignupGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-[#FF007A] transition appearance-none cursor-pointer"
                  >
                    <option value="other">Prefer not to say</option>
                    <option value="boy">Male</option>
                    <option value="girl">Female</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Password (8+ characters)"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-11 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF007A] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF007A] transition"
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-400 pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="mt-0.5 rounded border-zinc-700 text-[#FF007A] bg-zinc-800"
                />
                <span className="text-[11px] leading-tight">
                  I agree to the <span className="text-[#FF007A] underline">Terms of Service</span> &{' '}
                  <span className="text-[#FF007A] underline">Privacy Policy</span> (Age 13+)
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] hover:opacity-95 active:scale-[0.99] transition shadow-lg shadow-[#FF007A]/25 flex items-center justify-center gap-2 text-xs sm:text-sm mt-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Create PYE Universe Account'}</span>
              </button>

              <div className="pt-2 text-center text-xs text-zinc-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#FF007A] hover:underline font-semibold"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACCOUNT RECOVERY */}
          {tab === 'appeal' && (
            <form onSubmit={handleAppealSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Submit your registered username and email. We will process your account recovery request immediately.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={appealUsername}
                  onChange={(e) => setAppealUsername(e.target.value)}
                  placeholder="Registered username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FFA000] transition"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={appealEmail}
                  onChange={(e) => setAppealEmail(e.target.value)}
                  placeholder="Registered email address"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FFA000] transition"
                />
              </div>

              <textarea
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                placeholder="Brief reason for account recovery..."
                rows={3}
                className="w-full p-3 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#FFA000] transition"
              />

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#FFA000] to-[#FF5500] hover:opacity-95 transition shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Recovery Request</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('login')}
                className="w-full py-2.5 rounded-xl border border-zinc-800 text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
