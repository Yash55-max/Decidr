import React from 'react';
import { ArrowRight, Brain, Shield, BarChart3, Sparkles, Target, GitBranch } from 'lucide-react';

const FEATURES = [
  {
    icon: <Brain className="text-primary-400" size={24} />,
    title: 'ML Scoring Engine',
    desc: 'Constraint-weighted probability models compute per-option success and risk scores without needing historical datasets.',
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
  },
  {
    icon: <Sparkles className="text-blue-400" size={24} />,
    title: 'Gemini AI Reasoning',
    desc: 'Google Gemini Flash analyses your decision in natural language — detecting bias, trade-offs, and action steps.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: <BarChart3 className="text-purple-400" size={24} />,
    title: 'Visual Risk Matrix',
    desc: 'Interactive bar, pie, and radar charts break down your options so patterns become immediately obvious.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: <Shield className="text-yellow-400" size={24} />,
    title: 'Bias Guard',
    desc: 'The AI layer flags emotional framing and cognitive biases embedded in your decision title and options.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: <Target className="text-red-400" size={24} />,
    title: 'Action Plan',
    desc: 'Every analysis generates a concrete 3-step action plan tailored to your best option and constraints.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: <GitBranch className="text-cyan-400" size={24} />,
    title: 'Outcome Tracking',
    desc: 'Record what actually happened after your decision and rate the outcome — closing the prediction-reality loop.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

const STATS = [
  { value: '98%', label: 'Constraint coverage' },
  { value: '<2s', label: 'Analysis time' },
  { value: '4+', label: 'Built-in templates' },
  { value: '∞', label: 'Decisions tracked' },
];

const Landing = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="w-full flex flex-col items-center justify-center px-8 py-24 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary-500/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/6 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl w-full text-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-neutral-800/60 backdrop-blur rounded-full border border-neutral-700/50 text-neutral-400 text-sm font-medium mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            Powered by Google Gemini Flash · ML Scoring Engine
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Decide with{' '}
            <span className="animated-gradient-text">Intelligence.</span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-400 mb-14 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Quantify your biggest life decisions with constraint-weighted ML models, Gemini AI reasoning, and real-time risk analytics.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col md:flex-row gap-5 justify-center items-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button
              onClick={onStart}
              id="cta-start-analysis"
              className="px-10 py-5 bg-white text-black font-black text-lg rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
            >
              START ANALYSIS <ArrowRight size={22} />
            </button>
            <button
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 border border-neutral-700 text-white font-bold text-lg rounded-2xl hover:bg-neutral-800/60 transition-all backdrop-blur"
            >
              SEE CAPABILITIES
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-500">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-primary-400 mb-1">{value}</p>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features section ─────────────────────────────────────────────── */}
      <section id="features-section" className="w-full max-w-6xl px-8 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-white mb-3">Everything You Need to Decide Smarter</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">Six intelligent layers working together to transform your gut-feeling into a quantified, defensible choice.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {FEATURES.map(({ icon, title, desc, bg }) => (
            <div key={title} className="glass p-8 group hover:border-neutral-600/60 transition-all">
              <div className={`w-12 h-12 flex items-center justify-center ${bg} rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                {icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-3">{title}</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Landing;
