import React from 'react';
import { ArrowRight, Brain, Shield, Rocket, Target, BarChart3 } from 'lucide-react';

const Landing = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800/50 backdrop-blur rounded-full border border-neutral-700/50 text-neutral-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" /> AI Powered Decision Framework
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight leading-none animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
           Decide with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Intelligence.</span>
        </h1>

        <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          Elevate your choices beyond instinct. Our platform integrates ML probability models with AI logic to output quantified risk analysis for your life's biggest pivots.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <button 
             onClick={onStart}
             className="px-8 py-5 bg-white text-black font-black text-lg rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
          >
             START ANALYSIS <ArrowRight size={24} />
          </button>
          <button className="px-8 py-5 border border-neutral-700 text-white font-bold text-lg rounded-2xl hover:bg-neutral-800/50 transition-all backdrop-blur">
             VIEW CAPABILITIES
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1500 delay-500">
           <FeatureCard icon={<Brain className="text-primary-500"/>} title="ML Core" desc="Predict outcomes based on historical trends and datasets." />
           <FeatureCard icon={<Shield className="text-blue-500"/>} title="Logical Guard" desc="Detect bias and emotional leaning in your variables." />
           <FeatureCard icon={<BarChart3 className="text-purple-500"/>} title="Risk Matrix" desc="Visual dashboard for cross-option risk distribution." />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass p-8 text-left border border-neutral-800/80 group hover:border-neutral-600/50 transition-colors">
     <div className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-xl mb-6 shadow-inner ring-1 ring-white/5 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
       {icon}
     </div>
     <h4 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h4>
     <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
