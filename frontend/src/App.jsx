import React, { useState } from 'react';
import { Layout, PlusCircle, History, BarChart2, Home as HomeIcon } from 'lucide-react';
import DecisionForm from './components/DecisionForm';
import Dashboard from './components/Dashboard';
import HistoryPage from './components/HistoryPage';
import Landing from './components/Landing';

const NAV_ITEMS = [
  { view: 'home',      icon: <HomeIcon />,    label: 'Home'      },
  { view: 'input',     icon: <PlusCircle />,  label: 'New'       },
  { view: 'history',   icon: <History />,     label: 'Vault'     },
  { view: 'dashboard', icon: <BarChart2 />,   label: 'Dashboard' },
];

const App = () => {
  const [view, setView]                       = useState('home');
  const [currentDecisionId, setCurrentDecisionId] = useState(null);

  const navigateToDashboard = (id) => {
    setCurrentDecisionId(id);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 bottom-0 w-20 flex flex-col items-center py-8 bg-neutral-950 border-r border-neutral-800 z-50">

        {/* Logo */}
        <div className="mb-10">
          <div className="p-3 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/30 hover:scale-110 transition-transform">
            <Layout className="text-white w-6 h-6" />
          </div>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-6 flex-1">
          {NAV_ITEMS.map(({ view: v, icon, label }) => {
            if (v === 'dashboard' && !currentDecisionId) return null;
            return (
              <NavItem
                key={v}
                icon={icon}
                label={label}
                active={view === v}
                onClick={() => setView(v)}
              />
            );
          })}
        </div>

        {/* Version badge */}
        <div className="text-[10px] font-mono text-neutral-700 tracking-widest">v2.0</div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="pl-20 flex-1 flex flex-col min-h-screen">
        {view === 'home'      && <Landing onStart={() => setView('input')} />}
        {view === 'input'     && <DecisionForm onComplete={navigateToDashboard} />}
        {view === 'dashboard' && <Dashboard id={currentDecisionId} />}
        {view === 'history'   && <HistoryPage onView={navigateToDashboard} />}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div className="relative nav-item group">
    <button
      onClick={onClick}
      title={label}
      className={`p-3 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30'
          : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
      }`}
    >
      {React.cloneElement(icon, { size: 22 })}
    </button>
    <span className="nav-tooltip">{label}</span>
  </div>
);

export default App;
