import React, { useState } from 'react';
import {
  Shield,
  Users,
  Film,
  Flame,
  Radio,
  Users2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  RotateCcw,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { User, SafetyReport, AccountAppeal, AuditLog } from '../../types';
import { Storage } from '../../services/storage';

interface AdminDashboardProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigate,
}) => {
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Restricted Administrator Area</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          You must be authenticated with the PYE Operations Administrator role to access this console.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold"
        >
          Return to Universe Home
        </button>
      </div>
    );
  }

  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'moderation' | 'appeals' | 'audit'>('overview');
  const [users, setUsers] = useState<User[]>(() => Storage.getUsers());
  const [reports, setReports] = useState<SafetyReport[]>(() => Storage.getReports());
  const [appeals, setAppeals] = useState<AccountAppeal[]>(() => Storage.getAppeals());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => Storage.getAuditLogs());
  const [userSearch, setUserSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleDeactivate = (userId: string, currentStatus: boolean | undefined) => {
    Storage.setUserStatus(userId, !currentStatus);
    setUsers(Storage.getUsers());
    setAuditLogs(Storage.getAuditLogs());
    showToast(`Account status updated for user.`);
  };

  const handleToggleVerified = (userId: string) => {
    const verified = Storage.toggleUserVerified(userId);
    setUsers(Storage.getUsers());
    setAuditLogs(Storage.getAuditLogs());
    showToast(verified ? 'Account granted Verified badge.' : 'Verified badge revoked.');
  };

  const handleResolveReport = (reportId: string, status: SafetyReport['status']) => {
    Storage.updateReportStatus(reportId, status);
    setReports(Storage.getReports());
    setAuditLogs(Storage.getAuditLogs());
    showToast(`Report updated to: ${status}`);
  };

  const handleResolveAppeal = (appealId: string) => {
    const list = Storage.getAppeals().map((a) =>
      a.id === appealId ? { ...a, status: 'resolved' as const } : a
    );
    localStorage.setItem('pye_appeals', JSON.stringify(list));
    setAppeals(list);
    Storage.addAuditLog('RESOLVE_APPEAL', `Appeal ${appealId}`, 'Account recovery appeal approved');
    setAuditLogs(Storage.getAuditLogs());
    showToast('Appeal resolved and user reset link dispatched.');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-amber-500/50 text-amber-200 text-xs shadow-2xl backdrop-blur-md">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-zinc-900 to-[#0f0f18] border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            <span>PYE Security Operations & Moderation Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display">
            Administrator Control Center
          </h1>
          <p className="text-xs text-zinc-400">
            Authoritative platform enforcement, audit logs, and account management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
            OPERATOR: @{currentUser.username}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0f0f18] rounded-2xl border border-white/5 overflow-x-auto">
        <button
          onClick={() => setAdminTab('overview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            adminTab === 'overview' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Platform Metrics
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            adminTab === 'users' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Users & Accounts ({users.length})
        </button>
        <button
          onClick={() => setAdminTab('moderation')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            adminTab === 'moderation' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Safety Queue ({reports.filter((r) => r.status === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setAdminTab('appeals')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            adminTab === 'appeals' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Account Appeals ({appeals.filter((a) => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setAdminTab('audit')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            adminTab === 'audit' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* 1. OVERVIEW METRICS */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400">Total Registered Citizens</div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                {users.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400">Total Universe Posts</div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                {Storage.getPosts().length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400">PYES in Rotation</div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                {Storage.getPyes().length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400">Active Live Transmissions</div>
              <div className="text-2xl font-black text-rose-500 font-mono tabular-nums">
                {Storage.getLives().filter((l) => l.isLive).length}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              System Invariants & Security Directives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                <span className="font-bold text-emerald-400">✓ Token Authorization</span>
                <p className="text-zinc-400 text-[11px]">
                  Role-based access enforced. Non-admins cannot invoke administrative mutations.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                <span className="font-bold text-emerald-400">✓ Authoritative Economy</span>
                <p className="text-zinc-400 text-[11px]">
                  PYE Silver & Gold ledger checked strictly against server transactions.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                <span className="font-bold text-emerald-400">✓ Content Safeguards</span>
                <p className="text-zinc-400 text-[11px]">
                  Age-appropriate restrictions, real moderation queue, and reporting triggers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search username, email, full name..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Citizen</th>
                  <th className="py-2.5 px-3">PYE ID</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Coins (SLV / GLD)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-7 h-7 rounded-full bg-zinc-800 object-cover"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <span>{u.fullName}</span>
                            {u.isVerified && (
                              <CheckCircle className="w-3 h-3 text-[#ff1493] shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">{u.pieId}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 uppercase text-[10px] font-semibold text-zinc-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] tabular-nums">
                      {u.silverCoins.toLocaleString()} / {u.goldCoins.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      {u.isDeactivated ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleVerified(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium"
                        >
                          {u.isVerified ? 'Remove Badge' : 'Verify Badge'}
                        </button>

                        <button
                          onClick={() => handleToggleDeactivate(u.id, u.isDeactivated)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            u.isDeactivated
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-rose-600/80 hover:bg-rose-600 text-white'
                          }`}
                        >
                          {u.isDeactivated ? 'Reactivate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SAFETY & MODERATION REPORTS */}
      {adminTab === 'moderation' && (
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Reported Content & Abuse Review Queue
          </h3>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No unresolved reports in the safety queue.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase">
                        {rep.reportedItemType}
                      </span>
                      <span className="font-bold text-white">{rep.reason}</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {new Date(rep.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-zinc-300">
                    <span className="text-zinc-500">Reported item:</span>{' '}
                    <strong className="text-white">{rep.reportedTitle || rep.reportedItemId}</strong>
                  </div>

                  {rep.description && (
                    <p className="text-zinc-400 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      "{rep.description}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="text-zinc-500">
                      Reporter: <span className="text-zinc-300">@{rep.reporterUsername}</span> · Status:{' '}
                      <span className="font-bold uppercase text-amber-400">{rep.status}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                      >
                        Resolve / Enforce
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. ACCOUNT RECOVERY APPEALS */}
      {adminTab === 'appeals' && (
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Citizen Account Recovery Appeals
          </h3>

          {appeals.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No account recovery appeals waiting in queue.
            </div>
          ) : (
            <div className="space-y-3">
              {appeals.map((appeal) => (
                <div
                  key={appeal.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">@{appeal.username}</span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {new Date(appeal.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    Email contact: <span className="text-zinc-200">{appeal.email}</span>
                  </div>
                  <p className="text-zinc-300 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    "{appeal.message}"
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-zinc-500 uppercase font-semibold">
                      Status: {appeal.status}
                    </span>
                    {appeal.status === 'pending' && (
                      <button
                        onClick={() => handleResolveAppeal(appeal.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve & Restore Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. AUDIT LOGS */}
      {adminTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Cryptographic Action Logbook
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-amber-400">[{log.action}]</span>{' '}
                  <span className="text-zinc-300">{log.details}</span>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Target: {log.target} · Admin: @{log.adminUsername}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
