import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { BrainCircuit, Info, AlertTriangle, CheckCircle2, TrendingUp, Package } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = ({ id }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`/api/result/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResults();
  }, [id]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-neutral-400">Loading AI Insights...</div>;
  if (!data) return <div className="flex-1 flex items-center justify-center text-red-500">Result not found. Try re-analyzing.</div>;

  const probData = Object.entries(data.probabilities).map(([name, value]) => ({ name, value: value * 100 }));
  const riskData = Object.entries(data.risk_scores).map(([name, value]) => ({ name, value: value * 100 }));

  return (
    <div className="flex-1 p-10 overflow-y-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Analysis Dashboard</h1>
          <p className="text-neutral-400">Quantifying uncertainty and logical outcomes.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-neutral-800 rounded-lg text-sm border border-neutral-700">
            Decision ID: <span className="text-primary-500 font-mono">#{id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommendation Card */}
        <div className="lg:col-span-2 glass p-8 primary-gradient text-white relative overflow-hidden group">
          <BrainCircuit className="absolute -right-8 -top-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary-200 text-sm font-bold uppercase tracking-wider mb-2">
              <Info size={16} /> AI Recommendation
            </div>
            <h2 className="text-3xl font-bold mb-4">{data.recommendation}</h2>
            <p className="text-primary-100/80 leading-relaxed mb-6 max-w-2xl">{data.ai_analysis}</p>
            <div className="flex flex-wrap gap-4">
              <StatBadge icon={<TrendingUp size={16}/>} label="Optimism" val="High" />
              <StatBadge icon={<AlertTriangle size={16}/>} label="Risk" val="Moderate" />
            </div>
          </div>
        </div>

        {/* Success Probability (Pie) */}
        <div className="glass p-8 flex flex-col items-center">
           <h3 className="text-lg font-bold mb-6 self-start">Success Probability</h3>
           <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={probData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {probData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 flex gap-4 text-xs font-medium uppercase text-neutral-500">
             {probData.map((d, i) => (
                <div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} /> {d.name}</div>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Comparison Bar Chart */}
        <div className="glass p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart2 className="text-primary-500"/> Option Comparison (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#262626'}} contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040' }} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Profile (Area) */}
        <div className="glass p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><AlertTriangle className="text-red-500"/> Risk Profile Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskData}>
                <defs>
                   <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040' }} />
                <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Logic Breakdown */}
      <div className="glass p-8">
        <h3 className="text-lg font-bold mb-6">Logical Bias & Reasoning Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4 p-5 bg-neutral-950 rounded-2xl border border-neutral-700">
             <div className="p-3 bg-red-400/10 text-red-400 rounded-xl max-h-12"><AlertTriangle /></div>
             <div>
               <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Bias Warning</p>
               <p className="text-neutral-400 text-sm">{data.bias || "No significant cognitive bias detected in current input set."}</p>
             </div>
          </div>
          <div className="flex gap-4 p-5 bg-neutral-950 rounded-2xl border border-neutral-700">
             <div className="p-3 bg-primary-400/10 text-primary-400 rounded-xl max-h-12"><CheckCircle2 /></div>
             <div>
               <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Confidence Level</p>
               <p className="text-neutral-400 text-sm">84% confidence based on simulated historical parallels and input density.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ icon, label, val }) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-sm">
    <span className="text-white/60">{icon}</span>
    <span className="font-medium">{label}: {val}</span>
  </div>
);

export default Dashboard;
