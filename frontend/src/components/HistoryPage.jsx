import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, Calendar, Search, ArrowUpRight } from 'lucide-react';

const HistoryPage = ({ onView }) => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/history');
        setDecisions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex-1 p-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Decision Vault</h1>
          <p className="text-neutral-500">History of analyzed decisions and logical paths.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search paths..." 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-primary-500 transition-all font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center py-20 text-neutral-600">Retrieving Vault Data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {decisions.map((d) => (
            <div 
              key={d.id} 
              className="glass p-8 group hover:border-primary-500/50 hover:shadow-primary-500/5 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onView(d.id)}
            >
              <div className="absolute -right-4 -bottom-4 p-8 bg-primary-500/5 rounded-full group-hover:scale-125 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                   <div className="px-3 py-1 bg-neutral-900 rounded-lg text-xs font-mono text-neutral-500 border border-neutral-800">#{d.id}</div>
                   <ArrowUpRight className="text-neutral-600 group-hover:text-primary-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors">{d.title}</h3>
                <div className="flex items-center gap-2 text-neutral-500 text-sm mb-6">
                   <Calendar size={14} /> {new Date(d.created_at).toLocaleDateString()}
                </div>
                <div className="flex flex-wrap gap-2">
                   {d.options.slice(0, 3).map((opt, i) => (
                      <span key={i} className="px-3 py-1 bg-neutral-950 rounded-full text-xs border border-neutral-800 text-neutral-400">{opt}</span>
                   ))}
                   {d.options.length > 3 && <span className="text-xs text-neutral-600 pt-1">+{d.options.length - 3}</span>}
                </div>
              </div>
            </div>
          ))}
          
          {decisions.length === 0 && (
            <div className="col-span-full py-20 text-center text-neutral-600 font-medium">No decisions recorded yet. Start one now.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
