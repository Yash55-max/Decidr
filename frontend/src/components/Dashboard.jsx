import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
  BrainCircuit, AlertTriangle, CheckCircle2, TrendingUp,
  Zap, Star, Cpu, ListChecks, ArrowRight, Sparkles
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ── Animated confidence bar ─────────────────────────────────────────────────
const ConfidenceBar = ({ value }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(value), 200); }, [value]);
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-full rounded-full confidence-fill"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
};

// ── Star rating (outcome) ───────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        className={`star-btn ${n <= value ? 'active' : ''}`}
        onClick={() => onChange(n)}
      >
        <Star size={20} fill={n <= value ? '#f59e0b' : 'none'} />
      </button>
    ))}
  </div>
);

// ── Action steps ────────────────────────────────────────────────────────────
const ActionSteps = ({ steps }) => (
  <div className="space-y-3">
    {steps.map((s, i) => (
      <div key={i} className="flex gap-4 items-start p-4 bg-neutral-950 rounded-xl border border-neutral-800 group hover:border-primary-500/30 transition-colors">
        <span className="flex-shrink-0 w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-xs font-black">{i + 1}</span>
        <p className="text-neutral-300 text-sm leading-relaxed pt-0.5">{s}</p>
      </div>
    ))}
  </div>
);

// ── Loading skeleton ────────────────────────────────────────────────────────
const SkeletonCard = ({ className = '' }) => (
  <div className={`shimmer rounded-2xl ${className}`} />
);

// ── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = ({ id }) => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [outcome, setOutcome]   = useState('');
  const [rating, setRating]     = useState(0);
  const [saved, setSaved]       = useState(false);
  const [savingOutcome, setSavingOutcome] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/api/result/${id}`)
      .then(r => {
        setData(r.data);
        if (r.data.actual_outcome) setOutcome(r.data.actual_outcome);
        if (r.data.outcome_rating) setRating(r.data.outcome_rating);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const saveOutcome = async () => {
    if (!outcome.trim()) return;
    setSavingOutcome(true);
    try {
      await axios.patch(`/api/decision/${id}/outcome`, { actual_outcome: outcome, outcome_rating: rating || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSavingOutcome(false); }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 p-10 space-y-8">
      <div className="flex justify-between">
        <div className="space-y-2">
          <SkeletonCard className="h-10 w-64" />
          <SkeletonCard className="h-5 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SkeletonCard className="lg:col-span-2 h-52" />
        <SkeletonCard className="h-52" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SkeletonCard className="h-72" />
        <SkeletonCard className="h-72" />
      </div>
    </div>
  );

  if (!data || data.error) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="glass p-10 text-center max-w-sm">
        <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
        <p className="text-lg font-bold mb-2">Result Not Found</p>
        <p className="text-neutral-500 text-sm">Try running the analysis again from the form.</p>
      </div>
    </div>
  );

  // ── Chart data ─────────────────────────────────────────────────────────
  const probData = Object.entries(data.probabilities || {}).map(([name, value]) => ({
    name, value: Math.round(value * 100),
  }));
  const riskData = Object.entries(data.risk_scores || {}).map(([name, value]) => ({
    name, value: Math.round(value * 100),
  }));
  const radarData = (data.options || Object.keys(data.probabilities || {})).map(opt => ({
    opt,
    Success:    Math.round((data.probabilities?.[opt] || 0) * 100),
    Safety:     Math.round((1 - (data.risk_scores?.[opt] || 0)) * 100),
  }));

  const bestProb = data.probabilities?.[data.best_option] ?? 0;
  const bestRisk = data.risk_scores?.[data.best_option]   ?? 0;
  const conf     = data.confidence ?? 75;

  return (
    <div className="flex-1 p-10 overflow-y-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-1">Analysis Dashboard</h1>
          <p className="text-neutral-500 font-medium">{data.title || `Decision #${id}`}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-neutral-800 rounded-xl text-sm border border-neutral-700 font-mono text-neutral-400">
            ID <span className="text-primary-400 ml-1">#{id}</span>
          </div>
          {data.used_llm ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-semibold">
              <Sparkles size={14} /> Gemini Flash
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-500 text-sm font-medium">
              <Cpu size={14} /> Rule Engine
            </div>
          )}
        </div>
      </div>

      {/* ── Top row: Recommendation + Confidence ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recommendation hero card */}
        <div className="lg:col-span-2 glass p-8 primary-gradient text-white relative overflow-hidden group">
          <BrainCircuit className="absolute -right-8 -top-8 w-52 h-52 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-widest mb-4">
              <Zap size={14} /> AI Recommendation
            </div>
            <h2 className="text-2xl font-black mb-4 leading-snug">{data.recommendation}</h2>
            <p className="text-primary-100/80 text-sm leading-relaxed mb-6 max-w-xl">{data.ai_analysis}</p>
            <div className="flex flex-wrap gap-3">
              <StatBadge icon={<TrendingUp size={14}/>} label="Best Option" val={data.best_option || '—'} />
              <StatBadge icon={<CheckCircle2 size={14}/>} label="Success" val={`${Math.round(bestProb * 100)}%`} />
              <StatBadge icon={<AlertTriangle size={14}/>} label="Risk" val={`${Math.round(bestRisk * 100)}%`} />
            </div>
          </div>
        </div>

        {/* Confidence card */}
        <div className="glass p-8 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Model Confidence</h3>
          <div className="flex items-center justify-center flex-1">
            <div className="relative">
              <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#262626" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="48" fill="none" stroke="#10b981" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 48 * conf / 100} ${2 * Math.PI * 48}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                <span className="text-3xl font-black text-white">{conf}%</span>
                <span className="text-xs text-neutral-500 font-medium">Confidence</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {probData.slice(0, 3).map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span className="font-medium text-neutral-300">{d.name}</span>
                  <span>{d.value}%</span>
                </div>
                <ConfidenceBar value={d.value} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Success Probability Bar */}
        <div className="glass p-8">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Success Probability</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  formatter={v => [`${v}%`, 'Success']}
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '10px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {probData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie */}
        <div className="glass p-8 flex flex-col items-center">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 self-start">Risk Distribution</h3>
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {riskData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`${v}%`, 'Risk']} contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {riskData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                {d.name} — {d.value}%
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass p-8">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Option Radar</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#262626" />
                <PolarAngleAxis dataKey="opt" tick={{ fill: '#737373', fontSize: 10 }} />
                <Radar name="Success" dataKey="Success" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Radar name="Safety" dataKey="Safety" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Bias + Trade-offs ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-5">Bias & Reasoning</h3>
          <div className="flex gap-4 p-5 bg-neutral-950 rounded-2xl border border-neutral-800">
            <div className="p-3 bg-red-400/10 text-red-400 rounded-xl flex-shrink-0"><AlertTriangle size={20} /></div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Bias Warning</p>
              <p className="text-neutral-300 text-sm leading-relaxed">{data.bias || 'No significant cognitive bias detected.'}</p>
            </div>
          </div>
        </div>
        <div className="glass p-8">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-5">Key Trade-offs</h3>
          <div className="flex gap-4 p-5 bg-neutral-950 rounded-2xl border border-neutral-800">
            <div className="p-3 bg-blue-400/10 text-blue-400 rounded-xl flex-shrink-0"><ArrowRight size={20} /></div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Trade-off Analysis</p>
              <p className="text-neutral-300 text-sm leading-relaxed">{data.trade_offs || 'No trade-off data available.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Steps ────────────────────────────────────────────────── */}
      {data.action_steps?.length > 0 && (
        <div className="glass p-8">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ListChecks size={16} className="text-primary-500" /> Recommended Action Plan
          </h3>
          <ActionSteps steps={data.action_steps} />
        </div>
      )}

      {/* ── Outcome Tracking ─────────────────────────────────────────────── */}
      <div className="glass p-8 border border-dashed border-neutral-700">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Star size={14} className="text-yellow-400" /> Mark Real Outcome
        </h3>
        <p className="text-neutral-600 text-xs mb-6">
          Come back later to record what actually happened — this improves future predictions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select
            value={outcome}
            onChange={e => setOutcome(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 focus:border-primary-500 outline-none text-sm"
          >
            <option value="">— Select actual outcome —</option>
            {(data.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            <option value="other">Other / Changed my mind</option>
          </select>
          <StarRating value={rating} onChange={setRating} />
          <button
            onClick={saveOutcome}
            disabled={!outcome || savingOutcome}
            className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingOutcome ? 'Saving...' : saved ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Outcome'}
          </button>
        </div>
      </div>

    </div>
  );
};

const StatBadge = ({ icon, label, val }) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-sm">
    <span className="text-white/60">{icon}</span>
    <span className="text-white/70 text-xs">{label}:</span>
    <span className="font-bold">{val}</span>
  </div>
);

export default Dashboard;
