import React, { useState } from 'react';
import {
  Search,
  Users,
  Flame,
  Tv,
  Radio,
  Users2,
  CheckCircle,
  Hash,
  Play,
  Heart,
} from 'lucide-react';
import { User, ShortVideo, TubeVideo, Conference, Post } from '../../types';
import { Storage } from '../../services/storage';

interface SearchViewProps {
  initialQuery?: string;
  onNavigate: (view: string) => void;
  onViewProfile: (userId: string) => void;
  onSelectHashtag: (tag: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  onNavigate,
  onViewProfile,
  onSelectHashtag,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'creators' | 'shorts' | 'tube' | 'conferences'>('all');

  const users = Storage.getUsers();
  const shorts = Storage.getShorts();
  const tubes = Storage.getTubeVideos();
  const conferences = Storage.getConferences();
  const posts = Storage.getPosts();

  const q = query.toLowerCase().trim();

  const matchedUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
  );

  const matchedShorts = shorts.filter(
    (s) =>
      (s.title ? s.title.toLowerCase().includes(q) : false) ||
      s.caption.toLowerCase().includes(q) ||
      s.hashtags.some((t) => t.toLowerCase().includes(q))
  );

  const matchedTubes = tubes.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );

  const matchedConferences = conferences.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
  );

  const trendingTags = ['SpatialComputing', 'ModularSynth', 'NeuralGraphics', 'Universe', 'Astronomy'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators, shorts, tube videos, conferences, #topics..."
          className="w-full pl-12 pr-4 py-3.5 bg-[#0f0f18] border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff1493] focus:ring-1 focus:ring-[#ff1493] transition shadow-xl"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Suggested Trending Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-zinc-400 shrink-0">Popular:</span>
        {trendingTags.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag);
              onSelectHashtag(tag);
            }}
            className="px-3 py-1 rounded-full bg-zinc-900 border border-white/5 hover:border-[#ff1493]/50 text-xs text-zinc-300 hover:text-[#ff1493] transition shrink-0"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0f0f18] rounded-2xl border border-white/5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Results
        </button>

        <button
          onClick={() => setActiveTab('creators')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1 ${
            activeTab === 'creators'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Creators ({matchedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shorts')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1 ${
            activeTab === 'shorts'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>PYES ({matchedShorts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tube')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1 ${
            activeTab === 'tube'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Tube ({matchedTubes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conferences')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1 ${
            activeTab === 'conferences'
              ? 'bg-gradient-to-r from-[#ff1493] to-[#ff8c00] text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>Summits ({matchedConferences.length})</span>
        </button>
      </div>

      {/* Results Display */}
      <div className="space-y-6">
        {/* Section: Creators */}
        {(activeTab === 'all' || activeTab === 'creators') && matchedUsers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Creators & Accounts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onViewProfile(user.id)}
                  className="p-3.5 rounded-2xl bg-[#0f0f18] border border-white/5 hover:border-white/20 transition cursor-pointer flex items-center gap-3"
                >
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full bg-zinc-800 object-cover ring-2 ring-[#ff1493]/30"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{user.fullName}</span>
                      {user.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#ff1493] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">@{user.username}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {user.followersCount.toLocaleString()} followers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: PYES */}
        {(activeTab === 'all' || activeTab === 'shorts') && matchedShorts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              PYES
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {matchedShorts.map((short) => (
                <div
                  key={short.id}
                  onClick={() => onNavigate('shorts')}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-800 border border-white/5 cursor-pointer group shadow-lg"
                >
                  <img
                    src={short.posterUrl}
                    alt={short.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{short.title}</h4>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {short.viewsCount.toLocaleString()} views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Tube Videos */}
        {(activeTab === 'all' || activeTab === 'tube') && matchedTubes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              PYE Tube Videos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedTubes.map((tube) => (
                <div
                  key={tube.id}
                  onClick={() => onNavigate('tube')}
                  className="p-3 rounded-2xl bg-[#0f0f18] border border-white/5 hover:border-white/20 transition cursor-pointer space-y-2.5"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                    <img src={tube.thumbnailUrl} alt={tube.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {tube.duration}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2">{tube.title}</h4>
                    <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                      <span>{tube.author.fullName}</span>
                      <span>·</span>
                      <span>{tube.viewsCount.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Conferences */}
        {(activeTab === 'all' || activeTab === 'conferences') && matchedConferences.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Upcoming Conferences & Summits
            </h3>
            <div className="space-y-2.5">
              {matchedConferences.map((conf) => (
                <div
                  key={conf.id}
                  onClick={() => onNavigate('conferences')}
                  className="p-3.5 rounded-2xl bg-[#0f0f18] border border-white/5 hover:border-white/20 transition cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      {conf.category}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{conf.title}</h4>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {conf.scheduledDate} at {conf.scheduledTime} · Host: {conf.host.fullName}
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold shrink-0">
                    View Stage
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
