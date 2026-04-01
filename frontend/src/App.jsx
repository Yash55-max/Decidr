import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, PlusCircle, History, BarChart2, Home as HomeIcon } from 'lucide-react';
import DecisionForm from './components/DecisionForm';
import Dashboard from './components/Dashboard';
import HistoryPage from './components/HistoryPage';
import Landing from './components/Landing';

const App = () => {
  const [view, setView] = useState('home');
  const [currentDecisionId, setCurrentDecisionId] = useState(null);

  const navigateToDashboard = (id) => {
    setCurrentDecisionId(id);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      {/* Sidebar / Nav */}
      <nav className="fixed top-0 left-0 bottom-0 w-20 flex flex-col items-center py-8 bg-neutral-950 border-r border-neutral-800 z-50">
        <div className="mb-12">
          <div className="p-3 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/30">
            <Layout className="text-white w-6 h-6" />
          </div>
        </div>
        <div className="flex flex-col gap-8 flex-1">
          <NavItem icon={<HomeIcon />} active={view === 'home'} onClick={() => setView('home')} />
          <NavItem icon={<PlusCircle />} active={view === 'input'} onClick={() => setView('input')} />
          <NavItem icon={<History />} active={view === 'history'} onClick={() => setView('history')} />
          {currentDecisionId && (
            <NavItem icon={<BarChart2 />} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20 flex-1 flex flex-col">
        {view === 'home' && <Landing onStart={() => setView('input')} />}
        {view === 'input' && <DecisionForm onComplete={navigateToDashboard} />}
        {view === 'dashboard' && <Dashboard id={currentDecisionId} />}
        {view === 'history' && <HistoryPage onView={navigateToDashboard} />}
      </main>
    </div>
  );
};

const NavItem = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl transition-all duration-300 ${
      active ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
    }`}
  >
    {React.cloneElement(icon, { size: 24 })}
  </button>
);

export default App;
