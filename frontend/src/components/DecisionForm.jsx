import React, { useState } from 'react';
import { Upload, X, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const DecisionForm = ({ onComplete }) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['Option A', 'Option B']);
  const [constraints, setConstraints] = useState([{ key: 'Budget', value: 'Low' }]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const addOption = () => setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
  const removeOption = (idx) => setOptions(options.filter((_, i) => i !== idx));

  const addConstraint = () => setConstraints([...constraints, { key: '', value: '' }]);
  const updateConstraint = (idx, part, value) => {
    const next = [...constraints];
    next[idx][part] = value;
    setConstraints(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Prepare data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('options', JSON.stringify(options));
    formData.append('constraints', JSON.stringify(constraints));
    if (file) formData.append('file', file);

    try {
      // 1. Create decision
      const createRes = await axios.post('/api/decision', formData);
      const decisionId = createRes.data.id;

      // 2. Perform initial analysis
      const analysisData = new FormData();
      analysisData.append('decision_id', decisionId);
      if (file) analysisData.append('file', file);
      
      await axios.post('/api/analyze', analysisData);
      
      onComplete(decisionId);
    } catch (err) {
      console.error(err);
      alert("Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-neutral-900">
      <div className="w-full max-w-4xl glass p-10 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary-500/10 rounded-lg text-primary-500">
            <Zap size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">New Decision IQ</h1>
            <p className="text-neutral-400">Input your choices and constraints for AI analysis.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Decision Core */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Decision Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master's in CS vs Software Job" 
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-neutral-400">Options</label>
                <button type="button" onClick={addOption} className="text-xs text-primary-500 hover:text-primary-400 font-bold">+ ADD OPTION</button>
              </div>
              <div className="space-y-3">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[i] = e.target.value;
                        setOptions(next);
                      }}
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 focus:border-primary-500 outline-none"
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-neutral-600 hover:text-red-500 transition-colors"><X size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Constraints & Data */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-neutral-400">Constraints (e.g. Time/Budget)</label>
                <button type="button" onClick={addConstraint} className="text-xs text-primary-500 hover:text-primary-400 font-bold">+ ADD</button>
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {constraints.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      placeholder="Factor"
                      value={c.key}
                      onChange={(e) => updateConstraint(i, 'key', e.target.value)}
                      className="w-1/3 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 focus:border-primary-500 outline-none"
                    />
                    <input 
                      placeholder="Limit"
                      value={c.value}
                      onChange={(e) => updateConstraint(i, 'value', e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 focus:border-primary-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Historical Data (CSV - Optional)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-700 rounded-2xl cursor-pointer hover:bg-neutral-800/50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-neutral-500">
                    {file ? <CheckCircle2 className="text-primary-500 mb-2" /> : <Upload className="mb-2" />}
                    <p className="text-sm">{file ? file.name : 'Drop CSV or click to upload'}</p>
                  </div>
                  <input type="file" className="hidden" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 primary-gradient py-4 rounded-2xl font-bold shadow-2xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Processing Logical Reasoning...' : (
                <>Analyze Decision <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DecisionForm;
