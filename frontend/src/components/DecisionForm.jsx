import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, X, Zap, ChevronRight, CheckCircle2, Layout, BookTemplate, ChevronDown } from 'lucide-react';

// ─── Decision Templates ────────────────────────────────────────────────────
const TEMPLATE_ICONS = {
  job_vs_startup:      '🚀',
  masters_vs_work:     '🎓',
  freelance_vs_fulltime: '💼',
  relocate_vs_stay:    '🌍',
};

const DecisionForm = ({ onComplete }) => {
  const [title, setTitle]           = useState('');
  const [options, setOptions]       = useState(['Option A', 'Option B']);
  const [constraints, setConstraints] = useState([{ key: 'Budget', value: 'Low' }]);
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState(0); // 0=templates, 1=form
  const [templates, setTemplates]   = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Load templates from API
  useEffect(() => {
    axios.get('/api/templates')
      .then(r => setTemplates(r.data))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, []);

  const applyTemplate = (t) => {
    setTitle(t.title);
    setOptions(t.options);
    setConstraints(t.constraints);
    setStep(1);
  };

  const addOption      = () => setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
  const removeOption   = (idx) => setOptions(options.filter((_, i) => i !== idx));
  const addConstraint  = () => setConstraints([...constraints, { key: '', value: '' }]);
  const updateConstraint = (idx, part, value) => {
    const next = [...constraints]; next[idx][part] = value; setConstraints(next);
  };
  const removeConstraint = (idx) => setConstraints(constraints.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('options', JSON.stringify(options));
    fd.append('constraints', JSON.stringify(constraints));
    if (file) fd.append('file', file);
    try {
      const { data: createData } = await axios.post('/api/decision', fd);
      const decisionId = createData.id;
      const af = new FormData();
      af.append('decision_id', decisionId);
      if (file) af.append('file', file);
      await axios.post('/api/analyze', af);
      onComplete(decisionId);
    } catch (err) {
      console.error(err);
      alert('Something went wrong: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-start justify-center p-8 bg-neutral-900 overflow-y-auto">
      <div className="w-full max-w-4xl py-8">

        {/* ── Step 0 : Template Picker ─────────────────────────────────── */}
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500"><Layout size={28} /></div>
              <div>
                <h1 className="text-3xl font-black">Start a Decision</h1>
                <p className="text-neutral-400">Pick a template to prefill — or start blank.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {loadingTemplates
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 shimmer rounded-2xl" />
                  ))
                : templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      className="glass p-6 text-left hover:border-primary-500/50 hover:shadow-primary-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-3xl">{TEMPLATE_ICONS[t.id] || '🧠'}</span>
                        <span className="font-bold text-white group-hover:text-primary-400 transition-colors">{t.label}</span>
                      </div>
                      <p className="text-neutral-500 text-sm line-clamp-1">{t.title}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {t.options.map((opt, i) => (
                          <span key={i} className="px-2 py-0.5 bg-neutral-900 rounded-full text-xs text-neutral-400 border border-neutral-800">{opt}</span>
                        ))}
                      </div>
                    </button>
                  ))
              }
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full border border-dashed border-neutral-700 rounded-2xl py-4 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Zap size={16} /> Start from scratch
            </button>
          </div>
        )}

        {/* ── Step 1 : Decision Form ────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep(0)} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all">
                <ChevronDown size={20} className="rotate-90" />
              </button>
              <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500"><Zap size={28} /></div>
              <div>
                <h1 className="text-3xl font-black">New Decision IQ</h1>
                <p className="text-neutral-400">Define your options and constraints for AI analysis.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Decision Title */}
              <div className="glass p-6">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Decision Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Master's Degree vs. Software Job"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-lg font-semibold focus:border-primary-500 outline-none transition-all placeholder:text-neutral-700"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Options */}
                <div className="glass p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Options</label>
                    <button type="button" onClick={addOption} className="text-xs text-primary-500 hover:text-primary-400 font-bold">+ ADD</button>
                  </div>
                  {options.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs font-mono text-neutral-600 w-5">{String.fromCharCode(65 + i)}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                        className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 focus:border-primary-500 outline-none transition-all"
                      />
                      {options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="text-neutral-600 hover:text-red-500 transition-colors p-1">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="glass p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Constraints</label>
                    <button type="button" onClick={addConstraint} className="text-xs text-primary-500 hover:text-primary-400 font-bold">+ ADD</button>
                  </div>
                  <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {constraints.map((c, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          placeholder="Factor (e.g. Budget)"
                          value={c.key}
                          onChange={e => updateConstraint(i, 'key', e.target.value)}
                          className="w-2/5 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:border-primary-500 outline-none transition-all"
                        />
                        <input
                          placeholder="Value (e.g. Low)"
                          value={c.value}
                          onChange={e => updateConstraint(i, 'value', e.target.value)}
                          className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:border-primary-500 outline-none transition-all"
                        />
                        <button type="button" onClick={() => removeConstraint(i)} className="text-neutral-700 hover:text-red-500 transition-colors p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600">Use text levels: Low / Medium / High / Very High</p>
                </div>
              </div>

              {/* CSV Upload (optional) */}
              <div className="glass p-6">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Historical Data — CSV (Optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-neutral-700 rounded-2xl cursor-pointer hover:bg-neutral-800/40 hover:border-primary-500/40 transition-all">
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    {file ? <CheckCircle2 className="text-primary-500" size={24} /> : <Upload size={22} />}
                    <p className="text-sm font-medium">{file ? file.name : 'Drop CSV or click to upload'}</p>
                    {file && <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 hover:text-red-400">Remove</button>}
                  </div>
                  <input type="file" className="hidden" accept=".csv" onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 primary-gradient py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Running AI Analysis...
                  </>
                ) : (
                  <>Analyze Decision <ChevronRight size={22} /></>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionForm;
