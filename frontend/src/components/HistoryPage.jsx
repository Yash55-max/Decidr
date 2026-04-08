import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, Calendar, Search, ArrowUpRight, Star, CheckCircle2, Clock } from 'lucide-react';

const HistoryPage = ({ onView }) => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');

  useEffect(() => {
    axios.get('/api/history')
      .then(r => setDecisions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = decisions.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    (d.options || []).some(o => o.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="flex-1 p-10 animate-in fade-in duration-700 overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-1">Decision Vault</h1>
          <p className="text-neutral-500">
            {loading ? 'Loading…' : `${decisions.length} decision${decisions.length !== 1 ? 's' : ''} recorded`}
          </p>
        </div>

        {/* Live Search */}
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary-500 transition-colors" size={16} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search decisions or options…"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-primary-500 transition-all font-medium text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
            >✕</button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!loading && decisions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <StatTile
            icon={<Clock size={18} className="text-primary-500" />}
            label="Total Decisions"
            value={decisions.length}
          />
          <StatTile
            icon={<CheckCircle2 size={18} className="text-green-400" />}
            label="Outcomes Tracked"
            value={decisions.filter(d => d.actual_outcome).length}
          />
          <StatTile
            icon={<Star size={18} className="text-yellow-400" />}
            label="Avg Rating"
            value={(() => {
              const rated = decisions.filter(d => d.outcome_rating);
              if (!rated.length) return '—';
              return (rated.reduce((a, d) => a + d.outcome_rating, 0) / rated.length).toFixed(1) + ' ★';
            })()}
          />
          <StatTile
            icon={<ArrowUpRight size={18} className="text-blue-400" />}
            label="Latest"
            value={decisions[0] ? new Date(decisions[0].created_at).toLocaleDateString() : '—'}
          />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer rounded-2xl h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-neutral-500 font-medium text-lg">
            {query ? `No decisions match "${query}"` : 'No decisions recorded yet. Start one now.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(d => (
            <DecisionCard key={d.id} decision={d} onClick={() => onView(d.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Decision card ───────────────────────────────────────────────────────────
const DecisionCard = ({ decision: d, onClick }) => {
  const hasOutcome = !!d.actual_outcome;

  return (
    <div
      className="glass p-8 group hover:border-primary-500/50 hover:shadow-primary-500/5 transition-all cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      {/* Bubble decoration */}
      <div className="absolute -right-4 -bottom-4 p-12 bg-primary-500/5 rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex justify-between items-start mb-5">
          <span className="px-3 py-1 bg-neutral-900 rounded-lg text-xs font-mono text-neutral-500 border border-neutral-800">#{d.id}</span>
          <div className="flex items-center gap-2">
            {hasOutcome && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle2 size={10} /> Tracked
              </span>
            )}
            <ArrowUpRight className="text-neutral-600 group-hover:text-primary-500 transition-colors" size={18} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug group-hover:text-primary-400 transition-colors">{d.title}</h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-neutral-600 text-xs mb-5">
          <Calendar size={12} />
          {new Date(d.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        {/* Options chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(d.options || []).slice(0, 3).map((opt, i) => (
            <span key={i} className="px-3 py-1 bg-neutral-950 rounded-full text-xs border border-neutral-800 text-neutral-400">{opt}</span>
          ))}
          {(d.options || []).length > 3 && (
            <span className="text-xs text-neutral-600 pt-1">+{d.options.length - 3}</span>
          )}
        </div>

        {/* Outcome + rating */}
        {hasOutcome && (
          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Chose: <span className="text-neutral-200 font-medium">{d.actual_outcome}</span></span>
            {d.outcome_rating && (
              <span className="text-xs text-yellow-400 font-bold">{'★'.repeat(d.outcome_rating)}{'☆'.repeat(5 - d.outcome_rating)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Stat tile ───────────────────────────────────────────────────────────────
const StatTile = ({ icon, label, value }) => (
  <div className="glass px-5 py-4 flex items-center gap-4">
    <div className="p-2.5 bg-neutral-900 rounded-xl ring-1 ring-white/5 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-neutral-500 text-xs font-medium">{label}</p>
      <p className="text-white font-black text-lg leading-tight">{value}</p>
    </div>
  </div>
);

export default HistoryPage;
