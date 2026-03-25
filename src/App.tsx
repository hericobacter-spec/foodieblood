import { useState, useEffect } from 'react';
import { Activity, Apple, Trophy, Languages, List } from 'lucide-react';
import Dashboard from './components/Dashboard';
import FoodLogger from './components/FoodLogger';
import Gamification from './components/Gamification';
import History, { type LogEntry } from './components/History';
import { useI18n } from './i18n';



function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toggleLang, t } = useI18n();

  // Global mock state starts empty, synced explicitly.
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('foodieblood_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('foodieblood_logs', JSON.stringify(logs));
  }, [logs]);

  const handleLogMeal = (carbs: number, calories: number, timestamp: number, foodName?: string, category?: string) => {
    setLogs(prev => [{
      id: Date.now().toString(),
      type: 'food',
      value: carbs,
      category,
      calories,
      foodName,
      timestamp
    }, ...prev]);
  };

  const handleManualGlucose = (val: number, category: string, timestamp: number) => {
    setLogs(prev => [{
      id: Date.now().toString(),
      type: 'glucose',
      value: val,
      category,
      timestamp
    }, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)', position: 'relative', overflowX: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
      
      {/* Header */}
      <div style={{ position: 'sticky', top: '16px', margin: '0 var(--spacing-4)', marginBottom: '24px', zIndex: 10 }}>
        <header style={{ padding: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{t('appTitle')}</h1>
          </div>
          <button onClick={toggleLang} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-background)', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            <Languages size={18} color="var(--color-primary)" />
            <span>{t('langToggle')}</span>
          </button>
        </header>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '0 var(--spacing-4)', paddingBottom: 'calc(var(--spacing-12) + 80px)' }}>
        {activeTab === 'dashboard' && <Dashboard logs={logs} />}
        {activeTab === 'food' && <FoodLogger onLogMeal={handleLogMeal} onManualGlucose={handleManualGlucose} />}
        {activeTab === 'history' && <History logs={logs} onDelete={handleDeleteLog} />}
        {activeTab === 'profile' && <Gamification logs={logs} />}
      </main>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: '16px', left: 0, right: 0, margin: '0 auto', padding: '0 var(--spacing-4)', maxWidth: '480px', zIndex: 50, boxSizing: 'border-box' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-around', padding: 'var(--spacing-3)', backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.4)' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'dashboard' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
          <Activity size={28} />
          <span style={{ fontSize: 'var(--text-xs)', marginTop: '4px', fontWeight: activeTab === 'dashboard' ? 600 : 400 }}>{t('overview')}</span>
        </button>
        <button onClick={() => setActiveTab('food')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'food' ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
          <Apple size={28} />
          <span style={{ fontSize: 'var(--text-xs)', marginTop: '4px', fontWeight: activeTab === 'food' ? 600 : 400 }}>{t('logFood')}</span>
        </button>
        <button onClick={() => setActiveTab('history')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
          <List size={28} />
          <span style={{ fontSize: 'var(--text-xs)', marginTop: '4px', fontWeight: activeTab === 'history' ? 600 : 400 }}>{t('history')}</span>
        </button>
        <button onClick={() => setActiveTab('profile')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
          <Trophy size={28} />
          <span style={{ fontSize: 'var(--text-xs)', marginTop: '4px', fontWeight: activeTab === 'profile' ? 600 : 400 }}>{t('rewards')}</span>
        </button>
      </nav>
      </div>
    </div>
  );
}

export default App;
