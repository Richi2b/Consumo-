import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Zap, Flame, Shield, ShieldAlert, CheckCircle, 
  XOctagon, RefreshCw, Layers, Database, Terminal, Sliders, Smartphone 
} from 'lucide-react';
import { AppNetworkUsage, SimCardState } from '../types';

interface NetworkSimulatorProps {
  apps: AppNetworkUsage[];
  sims: SimCardState[];
  onToggleBlock: (id: string) => void;
  onToggleRestrict: (id: string) => void;
  onTriggerTick: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  lastSimulatedUsageMB: number;
}

export default function NetworkSimulator({
  apps,
  sims,
  onToggleBlock,
  onToggleRestrict,
  onTriggerTick,
  isSimulating,
  onToggleSimulation,
  lastSimulatedUsageMB
}: NetworkSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'monitor' | 'control' | 'logs'>('monitor');
  const [mockTerminalLogs, setMockTerminalLogs] = useState<string[]>([
    "NetGuardian DAEMON v2.0 - Inicializado com pacotes root angolanos.",
    "Procurando canais de rádio ativos... Ligação LTE detetada.",
    "Bateria: 85% (Proteção de recursos: Ligado)",
    "Controlo de custos UNITEL ativo com alertas em tempo real."
  ]);

  const activeSim = sims.find(s => s.isActive) || sims[0];

  // Append logs when usage happens
  useEffect(() => {
    if (lastSimulatedUsageMB > 0) {
      const timestamp = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const randomApp = apps[Math.floor(Math.random() * apps.length)];
      
      const newLog = `[${timestamp}] TELEMETRIA: Capturado fluxo de ${lastSimulatedUsageMB.toFixed(1)}MB de tráfego de '${randomApp?.name}'.`;
      
      setMockTerminalLogs(prev => [newLog, ...prev.slice(0, 15)]);
    }
  }, [lastSimulatedUsageMB]);

  const totalUsage = apps.reduce((sum, current) => sum + current.currentUsageMB, 0);

  return (
    <div className="space-y-6" id="simulator_container_layout">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            Agente Live & Simulador de Redes Android
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Simula um gancho de inspectores de pacotes de dados Android reais em Angola. Ativa a simulação dinâmica para correr aplicações em background e observar a atuação de bloqueadores inteligentes.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTriggerTick}
            disabled={isSimulating}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl transition-all disabled:opacity-40"
          >
            Disparar Rajada de Dados (+15MB)
          </button>
          
          <button
            onClick={onToggleSimulation}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md ${
              isSimulating 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/10 animate-pulse' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isSimulating ? "Pausar Simulador" : "Iniciar Escuta Ativa"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800/60 pb-px">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'monitor' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Monitor de Tráfego por App
        </button>
        <button
          onClick={() => setActiveTab('control')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'control' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Regras de Firewall Móvel
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'logs' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Consola de Telemetria (Live)
        </button>
      </div>

      {/* Tab: Monitor - App List with Details */}
      {activeTab === 'monitor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Main List */}
          <div className="md:col-span-2 space-y-3">
            {apps.map(appItem => {
              const appPercentage = totalUsage > 0 ? ((appItem.currentUsageMB / totalUsage) * 100).toFixed(1) : "0";
              const backgroundLeakRatio = ((appItem.backgroundUsageMB / appItem.currentUsageMB) * 100).toFixed(0);

              return (
                <div 
                  key={appItem.id} 
                  className={`p-4 rounded-xl bg-slate-900/30 border transition-all duration-200 ${
                    appItem.isBlocked 
                      ? 'border-rose-950/40 bg-rose-950/5 opacity-70' 
                      : appItem.isRestricted 
                      ? 'border-cyan-500/30 bg-cyan-950/5' 
                      : 'border-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${appItem.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                        {appItem.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{appItem.name}</h4>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                            {appItem.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{appItem.packageName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-white font-mono">{appItem.currentUsageMB.toFixed(1)} MB</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{appPercentage}% do consumo líquido</p>
                    </div>
                  </div>

                  {/* Progressive visual bar of usage */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                    <div 
                      className={`h-full transition-all duration-500 ${appItem.isBlocked ? 'bg-red-500' : appItem.isRestricted ? 'bg-cyan-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(100, parseFloat(appPercentage) * 2)}%` }}
                    />
                  </div>

                  {/* Diagnostic warnings and inline settings */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/40 text-[11px]">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span>Background Leak: <strong className="text-amber-400">{appItem.backgroundUsageMB.toFixed(0)}MB ({backgroundLeakRatio}%)</strong></span>
                      {appItem.isBlocked && <span className="text-rose-400 flex items-center gap-1"><XOctagon className="w-3.5 h-3.5" /> BLOQUEADO</span>}
                      {appItem.isRestricted && <span className="text-cyan-400 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> COMPRIMIDO</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleRestrict(appItem.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          appItem.isRestricted 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {appItem.isRestricted ? "Liberar HD" : "Limitar Imagens"}
                      </button>

                      <button
                        onClick={() => onToggleBlock(appItem.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          appItem.isBlocked 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {appItem.isBlocked ? "Ativar Net" : "Bloquear"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick settings and Simulator diagnosis */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-3">
                <Database className="w-4 h-4 text-cyan-400" />
                Diagnóstico de Tráfego Angolano
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Redes sociais e streaming em Angola são as maiores causas de recargas consecutivas de Kwanzas.
              </p>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-slate-400">Total detetado em background</span>
                  <span className="font-mono text-amber-400 font-semibold">{apps.reduce((sum, item) => sum + item.backgroundUsageMB, 0).toFixed(0)} MB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-slate-400">Desperdício de Kz Estimado</span>
                  <span className="font-mono text-rose-400 font-bold">~{((apps.reduce((sum, item) => sum + item.backgroundUsageMB, 0) / 1024) * 600).toFixed(0)} AOA</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-slate-400">Aplicativos Bloqueados</span>
                  <span className="font-mono text-white font-semibold">{apps.filter(x => x.isBlocked).length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Compressão de vídeo (HD Block)</span>
                  <span className="font-mono text-cyan-400 font-bold">{apps.filter(x => x.isRestricted).length} ativados</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-slate-950/10 border border-indigo-500/20 shadow-xl">
              <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">💡 Dica de Especialista</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Maninho, o aplicativo <strong>Atualizações do Sistema</strong> está a devorar giga-octetos invisíveis nas tuas costas! Recomenda-se bloquear o seu tráfego móvel permanentemente e libertá-lo apenas em ligações Wi-Fi residenciais de alta velocidade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Control - Firewall Setup */}
      {activeTab === 'control' && (
        <div className="p-6 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 animate-fade-in space-y-6">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Central de Moderação de Dados</h3>
              <p className="text-xs text-slate-400">Proteja agressivamente o seu crédito UNITEL ou saldo de dados de atuações maliciosas do ecossistema Android.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-slate-900/45 border border-slate-800 rounded-xl relative">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">MODO ANTI-VIGILÂNCIA</span>
              <h4 className="text-sm font-bold text-slate-100 mt-1">Limitar Consumo Telemetria Android</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Bloqueia envios automatizados de logs diagnósticos do sistema Android de hora em hora para o Google. Esta medida economiza em média de 120MB de internet a cada 2 dias na província de Luanda.
              </p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/60">
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> RECOMENDADO
                </span>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Totalmente Automático
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/45 border border-slate-800 rounded-xl relative">
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">LIMITADOR DE MÍDIA WHATSAPP</span>
              <h4 className="text-sm font-bold text-slate-100 mt-1">Bloquear Downloads Automáticos</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Força o WhatsApp a restringir o download automático de autocolantes, áudios promocionais longos, imagens pesadas e vídeos engraçados de grupos, reduzindo consideravelmente as fugas.
              </p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/60">
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> RECOMENDADO
                </span>
                <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  Ativo por Proxy
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Logs - Terminal console view */}
      {activeTab === 'logs' && (
        <div className="p-5 rounded-2xl bg-black border border-slate-900 font-mono text-sm leading-relaxed text-emerald-400 animate-fade-in relative shadow-2xl">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-900 mb-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              NETGUARDIAN DAEMON CONSOLE (ANGOLA)
            </span>
            <span>Estabilidade de Ligação: Excelente</span>
          </div>

          <div className="space-y-2 h-[280px] overflow-y-auto pr-2 custom-scrollbar text-xs">
            {mockTerminalLogs.length === 0 ? (
              <p className="text-slate-600">Aguardando telemetria... Inicie a escuta activa ou faça rajadas de dados.</p>
            ) : (
              mockTerminalLogs.map((log, index) => (
                <div key={index} className={`flex items-start gap-2 ${index === 0 ? 'text-white' : 'text-emerald-400/80'}`}>
                  <span className="text-indigo-400 select-none">&gt;</span>
                  <p>{log}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
