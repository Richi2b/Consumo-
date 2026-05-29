import React, { useState, useEffect } from 'react';
import { 
  Bot, Clock, Bell, Shield, Sliders, Database, Menu, X, 
  HelpCircle, AlertTriangle, ShieldCheck, Cpu, Smartphone, 
  LineChart, Sparkles, RefreshCw, CheckCircle 
} from 'lucide-react';
import { AppNetworkUsage, SimCardState, MobileBundle, SystemNotification, EconomySettings, AISuggestion } from './types';
import Dashboard from './components/Dashboard';
import NetworkSimulator from './components/NetworkSimulator';
import TariffsPanel from './components/TariffsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import ChatBot from './components/ChatBot';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastSimulatedUsage, setLastSimulatedUsage] = useState<number>(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

  // Core simulation state variables
  const [sims, setSims] = useState<SimCardState[]>([]);
  const [apps, setApps] = useState<AppNetworkUsage[]>([]);
  const [tariffs, setTariffs] = useState<MobileBundle[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [consumedToday, setConsumedToday] = useState<number>(312.4);
  const [totalSavedAOA, setTotalSavedAOA] = useState<number>(3000);

  const [economySettings, setEconomySettings] = useState<EconomySettings>({
    dataLimiterActive: true,
    dailyMBBudget: 350,
    blockBackgroundData: false,
    videoQualityLimit: 'medium',
    nightModeActive: false,
    autoSleepInactiveTime: false,
  });

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([
    {
      id: "sug_1",
      title: "Vazamento Grave no TikiToki (TikTok)",
      shortDesc: "TikTok carregou transmissões automáticas de anúncios em background.",
      detailedAnalysis: "Gasto de 280MB detectado fora de foco. Sugerimos ativar o HD Block para diminuir o tamanho dos buffers de vídeo móvel em Luanda.",
      category: "leak",
      estimatedSavingsAOA: 750,
      estimatedSavingsMB: 1200,
      actionLabel: "Impedir HD",
      applied: false
    },
    {
      id: "sug_2",
      title: "Sincronizações Redundantes de Sistema",
      shortDesc: "O utilitário de sistema está a transferir telemetria repetidamente.",
      detailedAnalysis: "Ao travar updates fúteis em rede móvel, poupa bateria e até 1.3GB de dados que podem ser usados para o seu negócio.",
      category: "efficiency",
      estimatedSavingsAOA: 1000,
      estimatedSavingsMB: 1390,
      actionLabel: "Limitar Segundo Plano",
      applied: false
    },
    {
      id: "sug_3",
      title: "Aproveitador do Plano Noite",
      shortDesc: "Mover downloads pesados para a meia-noite.",
      detailedAnalysis: "Subscrever o plano de 500 AOA da Unitel permite transferir pacotes muito grandes economizando mais de 70% de saldo principal.",
      category: "cost",
      estimatedSavingsAOA: 2500,
      estimatedSavingsMB: 4000,
      actionLabel: "Ativar Agendamento",
      applied: false
    }
  ]);

  // Load Initial Rest API data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rSims, rApps, rTariffs, rNotifs] = await Promise.all([
        fetch('/api/sims').then(r => r.json()),
        fetch('/api/apps').then(r => r.json()),
        fetch('/api/tariffs').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json())
      ]);

      setSims(rSims);
      setApps(rApps);
      setTariffs(rTariffs);
      setNotifications(rNotifs);
    } catch (err) {
      console.error("Erro ao carregar do servidor Express:", err);
    }
  };

  // Simulation Daemon Runner
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/simulator/tick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ economySettings })
          });
          const data = await res.json();
          if (data.success) {
            setSims(data.sims);
            setApps(data.apps);
            setLastSimulatedUsage(data.consumedMB);
            setConsumedToday(prev => prev + data.consumedMB);
            setNotifications(data.notifications);

            // Dynamically increment estimated savings in Kwanzas if background Block is on
            if (economySettings.blockBackgroundData) {
              setTotalSavedAOA(prev => prev + Math.floor(data.consumedMB * 0.65));
            } else {
              setTotalSavedAOA(prev => prev + Math.floor(data.consumedMB * 0.15));
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, economySettings]);

  // Handle local state updates from Sub-Components
  const handleToggleBlock = async (id: string) => {
    try {
      const res = await fetch('/api/apps/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setApps(prev => prev.map(a => a.id === id ? data.app : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRestrict = async (id: string) => {
    try {
      const res = await fetch('/api/apps/toggle-restrict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setApps(prev => prev.map(a => a.id === id ? data.app : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRechargeSim = async (simId: string, amount: number) => {
    try {
      const res = await fetch('/api/sims/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: simId, amountAOA: amount })
      });
      const data = await res.json();
      if (data.success) {
        setSims(prev => prev.map(s => s.id === simId ? data.sim : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyBundle = async (simId: string, bundleId: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/sims/buy-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simId, bundleId })
      });
      const data = await res.json();
      if (data.success) {
        setSims(prev => prev.map(s => s.id === simId ? data.sim : s));
        setNotifications(data.notifications);
        return data.message;
      } else {
        alert(data.error);
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleApplySuggestion = (id: string) => {
    setAiSuggestions(prev => prev.map(sug => {
      if (sug.id === id) {
        // Mock optimization acts: update apps or economy settings
        if (sug.category === 'leak') {
          // Restrict TikTok
          setApps(currentApps => currentApps.map(a => a.packageName.includes('tiktok') ? { ...a, isRestricted: true } : a));
        } else if (sug.category === 'efficiency') {
          // Block update
          setApps(currentApps => currentApps.map(a => a.packageName.includes('update') ? { ...a, isBlocked: true } : a));
        }
        return { ...sug, applied: true };
      }
      return sug;
    }));
  };

  const manualTriggerTick = async () => {
    try {
      const res = await fetch('/api/simulator/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ economySettings })
      });
      const data = await res.json();
      if (data.success) {
        setSims(data.sims);
        setApps(data.apps);
        setLastSimulatedUsage(data.consumedMB);
        setConsumedToday(prev => prev + data.consumedMB);
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetAllData = async () => {
    try {
      // Direct hard reset to original states
      await fetchData();
      setConsumedToday(312.4);
      setTotalSavedAOA(3000);
      setAiSuggestions(prev => prev.map(s => ({ ...s, applied: false })));
    } catch (e) {
      console.error(e);
    }
  };

  const activeSim = sims.find(s => s.isActive) || sims[0];
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 font-sans flex flex-col justify-between" id="netguardian_applet_root">
      {/* Top Premium Navbar */}
      <header className="sticky top-0 z-50 bg-[#030611]/90 backdrop-blur-md border-b border-slate-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo & Context */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  NetGuardian AI
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-indigo-500/10 rounded-full text-indigo-400 border border-indigo-500/15 font-mono">
                  AO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Poupança e Metrologia Inteligente</p>
            </div>
          </div>

          {/* Desktop Tab Selector */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            {[
              { id: 'dashboard', label: 'Monitor' },
              { id: 'simulator', label: 'Network Apps' },
              { id: 'bundles', label: 'Planos de Angola' },
              { id: 'reports', label: 'Otimizações & Relatórios' },
              { id: 'assistant', label: 'Cunene AI Chat' },
              { id: 'settings', label: 'Definições' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-2 font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* SIM Selector Badge, Clock, Notifications */}
          <div className="flex items-center gap-3">
            
            {/* Operator Active Showcase */}
            {activeSim && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#090D1A] border border-slate-800 rounded-xl">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-slate-300 font-medium">{activeSim.operator} • {activeSim.phoneNumber}</span>
              </div>
            )}

            {/* Custom Interactive Bell with Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-slate-350 transition-all relative"
                id="bell_button"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-extrabold flex items-center justify-center text-white text-sans animate-bounce">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-[#090D1A] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-fade-in text-left">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-850">
                    <span className="font-bold text-slate-200">Alertas Recentes da Firewall</span>
                    <button 
                      onClick={async () => {
                        await fetch('/api/notifications/mark-read', { method: 'POST' });
                        fetchData();
                      }}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Ler todas
                    </button>
                  </div>

                  <div className="space-y-3 pt-3 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">Sem notificações de rede.</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={`p-2.5 rounded-lg ${n.isRead ? 'bg-slate-900/30' : 'bg-slate-900 border-l-2 border-indigo-500'}`}>
                          <div className="flex justify-between font-bold text-slate-200">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Actions Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#030611] border-b border-slate-800 p-4 space-y-2 flex flex-col text-xs" id="mobile_drawer">
            {[
              { id: 'dashboard', label: 'Painel Central' },
              { id: 'simulator', label: 'Network Apps' },
              { id: 'bundles', label: 'Planos de Angola' },
              { id: 'reports', label: 'Otimizações & Relatórios' },
              { id: 'assistant', label: 'Cunene AI Chat' },
              { id: 'settings', label: 'Definições' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2 px-3 font-semibold rounded-xl ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600/15 text-indigo-300' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Container Element (Bento Frame styling) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            sims={sims}
            apps={apps}
            notifications={notifications}
            consumedTodayMB={consumedToday}
            totalSavedAOA={totalSavedAOA}
            onSelectTab={setActiveTab}
            onRefreshData={fetchData}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'simulator' && (
          <NetworkSimulator
            apps={apps}
            sims={sims}
            onToggleBlock={handleToggleBlock}
            onToggleRestrict={handleToggleRestrict}
            onTriggerTick={manualTriggerTick}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            lastSimulatedUsageMB={lastSimulatedUsage}
          />
        )}

        {activeTab === 'bundles' && (
          <TariffsPanel
            sims={sims}
            tariffs={tariffs}
            onRecharge={handleRechargeSim}
            onBuyBundle={handleBuyBundle}
            isProcessing={false}
          />
        )}

        {activeTab === 'reports' && (
          <AnalyticsPanel
            apps={apps}
            sims={sims}
            economySettings={economySettings}
            suggestions={aiSuggestions}
            onApplySuggestion={handleApplySuggestion}
            onRefreshAI={manualTriggerTick}
          />
        )}

        {activeTab === 'assistant' && (
          <ChatBot sims={sims} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={economySettings}
            onUpdateSettings={setEconomySettings}
            onResetSimulationData={resetAllData}
          />
        )}
      </main>

      {/* Corporate Premium Footer with African Context */}
      <footer className="bg-[#020409] border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <p>© 2026 NetGuardian AI • Tecnologia de Otimização e Medição Móvel</p>
          <div className="flex gap-4">
            <span className="text-[11px] text-slate-500">Desenvolvido para operadoras angolanas: <strong>Unitel, Africell & Movicel</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
