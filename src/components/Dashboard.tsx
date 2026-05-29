import React, { useState } from 'react';
import { 
  Zap, ShieldAlert, Cpu, Award, ArrowUpRight, ArrowDownRight, 
  HelpCircle, RefreshCw, Smartphone, TrendingUp, DollarSign, Database 
} from 'lucide-react';
import { AppNetworkUsage, SimCardState, SystemNotification } from '../types';

interface DashboardProps {
  sims: SimCardState[];
  apps: AppNetworkUsage[];
  notifications: SystemNotification[];
  consumedTodayMB: number;
  totalSavedAOA: number;
  onSelectTab: (tab: string) => void;
  onRefreshData: () => void;
  isSimulating: boolean;
}

export default function Dashboard({
  sims,
  apps,
  notifications,
  consumedTodayMB,
  totalSavedAOA,
  onSelectTab,
  onRefreshData,
  isSimulating
}: DashboardProps) {
  const activeSim = sims.find(s => s.isActive) || sims[0];
  const unreadNotifications = notifications.filter(n => !n.isRead);

  // Math calculated stats
  const totalAppsUsageMB = apps.reduce((acc, current) => acc + current.currentUsageMB, 0);
  const totalBackgroundUsageMB = apps.reduce((acc, current) => acc + current.backgroundUsageMB, 0);
  const backgroundPercent = totalAppsUsageMB > 0 ? ((totalBackgroundUsageMB / totalAppsUsageMB) * 100).toFixed(0) : "0";

  // Identify heaviest app
  const heaviestApp = [...apps].sort((a, b) => b.currentUsageMB - a.currentUsageMB)[0];

  // Grade calculate
  const getEfficiencyScore = () => {
    const backgroundLeakRatio = totalBackgroundUsageMB / totalAppsUsageMB;
    const blockedAppsCount = apps.filter(a => a.isBlocked).length;
    const restrictedAppsCount = apps.filter(a => a.isRestricted).length;

    let score = 88; // Default good
    if (backgroundLeakRatio > 0.15) score -= 15;
    if (backgroundLeakRatio > 0.25) score -= 15;
    if (blockedAppsCount === 0) score -= 5;
    if (restrictedAppsCount > 1) score += 8;
    if (activeSim && activeSim.currentDataMB < 500) score -= 5;

    return Math.max(10, Math.min(100, score));
  };

  const score = getEfficiencyScore();
  const getGrade = (s: number) => {
    if (s >= 95) return { label: 'A++', desc: 'Guardião Lendário', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (s >= 88) return { label: 'A', desc: 'Soberano da Poupança', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' };
    if (s >= 75) return { label: 'B', desc: 'Eficiência Elevada', color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' };
    if (s >= 60) return { label: 'C', desc: 'Moderadamente Económico', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'D', desc: 'Sabor a Desperdício', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const grade = getGrade(score);

  // High quality premium manual SVG chart vector mapping
  // We'll map daily trend points based on mock state
  const mockChartData = [
    { label: "00h", val: 120 },
    { label: "04h", val: 40 },
    { label: "08h", val: 280 },
    { label: "12h", val: 560 },
    { label: "16h", val: 890 },
    { label: "20h", val: 1240 },
    { label: "24h", val: 780 }
  ];

  // Convert points to SVG polyline coordinators
  const width = 600;
  const height = 180;
  const maxVal = 1500;
  const points = mockChartData.map((d, index) => {
    const x = (index / (mockChartData.length - 1)) * (width - 40) + 20;
    const y = height - ((d.val / maxVal) * (height - 40) + 20);
    return { x, y, d };
  });

  const polylinePath = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = `20,${height - 10} ${polylinePath} ${width - 20},${height - 10}`;

  return (
    <div className="space-y-6" id="dashboard_container">
      {/* Top Banner News */}
      {unreadNotifications.length > 0 && (
        <div 
          onClick={() => onSelectTab('rules')}
          className="flex items-center justify-between p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl cursor-pointer hover:bg-rose-950/60 transition-all duration-300 animate-pulse"
          id="critical_alert_banner"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-200">
                Alerta Crítico de Internet: {unreadNotifications[0].title}
              </p>
              <p className="text-xs text-rose-400/80">
                {unreadNotifications[0].message}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 w-max py-0.5 bg-rose-500/20 rounded-full text-rose-300">
            Resolver
          </span>
        </div>
      )}

      {/* Main KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi_grid">
        {/* Metric 1: Current SIM Status */}
        <div className="p-5 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between opacity-85 mb-3">
            <span className="text-sm text-slate-400 font-medium">Cartão SIM Ativo</span>
            <span className={`text-xs px-2.5 py-0.5 font-bold rounded-full ${
              activeSim?.operator === 'UNITEL' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
              activeSim?.operator === 'AFRICELL' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {activeSim?.operator || "UNITEL"}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-sans tracking-tight text-white">
              {activeSim ? (activeSim.currentDataMB / 1024).toFixed(2) : "0.00"} <span className="text-xs text-slate-400">GB residual</span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Teto total contratado: {activeSim ? (activeSim.totalDataLimitMB / 1024).toFixed(0) : "10"}GB
            </p>
          </div>
          <button 
            onClick={() => onSelectTab('bundles')}
            className="w-full mt-4 flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 py-1 border-t border-slate-800/80 pt-3 group-hover:translate-x-0.5 transition-all"
          >
            <span>Carregar planos de Angola</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Metric 2: Today Consumption */}
        <div className="p-5 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between opacity-85 mb-3">
            <span className="text-sm text-slate-400 font-medium">Consumo Diário</span>
            <span className={`text-xs w-3 h-3 rounded-full ${isSimulating ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} title={isSimulating ? "Simulador Ativo" : "Estático"}></span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-sans tracking-tight text-slate-100">
              {consumedTodayMB.toFixed(1)} <span className="text-xs text-slate-400">MB consumidos</span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Previsão de consumo está estável
            </p>
          </div>
          <button 
            onClick={() => onSelectTab('simulator')}
            className="w-full mt-4 flex items-center justify-between text-xs text-cyan-400 hover:text-cyan-300 py-1 border-t border-slate-800/80 pt-3 group-hover:translate-x-0.5 transition-all"
          >
            <span>Ver tráfego em tempo real</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Metric 3: Estimados Kwanzas Poupativos */}
        <div className="p-5 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between opacity-85 mb-3">
            <span className="text-sm text-slate-400 font-medium">Saldo Poupado</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">AOA</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-sans tracking-tight text-emerald-400">
              {totalSavedAOA.toLocaleString('pt-AO')} <span className="text-xs">AOA Pouados</span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Equivale a ~{(totalSavedAOA / 500).toFixed(0)} pacotes Net+ Noite
            </p>
          </div>
          <button 
            onClick={() => onSelectTab('reports')}
            className="w-full mt-4 flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 py-1 border-t border-slate-800/80 pt-3 group-hover:translate-x-0.5 transition-all"
          >
            <span>Gerar relatório PDF oficial</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Metric 4: AI Audit Score */}
        <div className="p-5 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl group-hover:bg-fuchsia-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between opacity-85 mb-3">
            <span className="text-sm text-slate-400 font-medium">Eficiência de IA</span>
            <Award className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-extrabold px-3 py-1 font-mono rounded ${grade.color} border`}>
              {grade.label}
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{grade.desc}</p>
              <p className="text-[11px] text-slate-400">Pontuação de otimização: {score}/100</p>
            </div>
          </div>
          <button 
            onClick={() => onSelectTab('assistant')}
            className="w-full mt-4 flex items-center justify-between text-xs text-fuchsia-400 hover:text-fuchsia-300 py-1 border-t border-slate-800/80 pt-3 group-hover:translate-x-0.5 transition-all"
          >
            <span>Auditoria Inteligente de IA</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Analysis Chart & Operator Standout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="middle_panel_grid">
        {/* Dynamic Activity Area Chart (Visualized with SVG for stability) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-2xl relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Historial de Consumo Diário e Período de Pico
              </h2>
              <p className="text-xs text-slate-400">Inspeção de tráfego móvel simulado por faixas horárias</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
                Tráfego real (MB)
              </span>
            </div>
          </div>

          <div className="relative h-[200px]" id="chart_mount_wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[40, 75, 110, 145].map((yVal, i) => (
                <line 
                  key={i} 
                  x1="10" 
                  y1={yVal} 
                  x2={width - 10} 
                  y2={yVal} 
                  stroke="#1e293b" 
                  strokeDasharray="4 4" 
                  strokeWidth="1" 
                />
              ))}

              {/* Vector Area Shading */}
              <polygon points={areaPath} fill="url(#chart-grad)" />

              {/* Polyline Curve */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                points={polylinePath}
                className="transition-all duration-300"
              />

              {/* Critical Peak Line indicator at 20h */}
              <line 
                x1={points[5].x} 
                y1="10" 
                x2={points[5].x} 
                y2={height - 20} 
                stroke="#ff007f" 
                strokeDasharray="2 2"
                strokeWidth="1.5"
                className="animate-pulse"
              />

              {/* Vertices */}
              {points.map((p, i) => (
                <g key={i} className="group/dot cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#0f172a"
                    stroke={i === 5 ? "#ff007f" : "#06b6d4"}
                    strokeWidth="3"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="10"
                    fill={i === 5 ? "#ff007f" : "#06b6d4"}
                    fillOpacity="0"
                    className="hover:fill-opacity-15 transition-all duration-200"
                  />
                </g>
              ))}
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 px-4 mt-2 font-mono">
            {mockChartData.map((d, i) => (
              <span key={i} className={i === 5 ? 'text-rose-400 font-bold' : ''}>
                {d.label} {i === 5 ? '🔥 Peak' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Localized African / Angolan Mobile Context Panel */}
        <div className="p-6 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-2xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">Conselho Tarifário de Angola</h2>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Sabias que a internet móvel em Angola custa em média <strong className="text-white">600 AOA por Gigabyte</strong>? O sistema detetou que o seu consumo atual é propício para poupança!
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">UNITEL NET+ NOITE</p>
                <p className="text-xs text-slate-300 mt-1">Gaste apenas 500 AOA por 1GB durante as madrugadas (00h-05h).</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400">Economia recomendada</span>
                  <span className="text-xs text-emerald-400 font-bold">+80% de desconto</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">AFRICELL KAMBA WEEK</p>
                <p className="text-xs text-slate-300 mt-1">Assine 4GB por 1000 Kz semanais se estiver na zona metropolitana de Luanda.</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400">Custo por GB estimado</span>
                  <span className="text-xs text-cyan-400 font-bold">250 AOA / GB</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('assistant')}
            className="w-full mt-4 text-center text-xs py-2 px-3 bg-indigo-600 hover:bg-indigo-500 font-medium text-white rounded-xl transition-all shadow-md shadow-indigo-500/10"
          >
            Análise Inteligente Personalizada
          </button>
        </div>
      </div>

      {/* Extreme Low-End Smartphone Feature Alert */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/5 border border-amber-500/20 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-amber-400" />
            Perfil de Smartphone de Recursos Constritos (África Especial)
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
            Ativou a poupança heurística de recursos de bateria e caches offline parciais. O NetGuardian AI suspenderá gráficos pesados e fará download comprimido de dados em background sempre que a ligação cair para 2G ou 3G móvel.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-amber-400 font-bold px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0">
            Modo Leve Ativo
          </span>
        </div>
      </div>

      {/* Top Consuming Apps Highlights */}
      <div className="p-6 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Aplicativos Invisivelmente Pesados</h3>
          <button 
            onClick={() => onSelectTab('simulator')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Ajustar bloqueadores
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.slice(0, 4).map((appItem) => {
            const pct = totalAppsUsageMB > 0 ? ((appItem.currentUsageMB / totalAppsUsageMB) * 100).toFixed(0) : "0";
            return (
              <div key={appItem.id} className="flex items-center justify-between p-3.5 bg-slate-900/30 hover:bg-slate-900/60 transition-all rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${appItem.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                    {appItem.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{appItem.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono text-xs">
                      Background: {appItem.backgroundUsageMB.toFixed(0)}MB ({((appItem.backgroundUsageMB / appItem.currentUsageMB)*100).toFixed(0)}% de fuga)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-white">{appItem.currentUsageMB.toFixed(0)} MB</p>
                  <span className="text-[10px] text-slate-400 font-bold">{pct}% do Total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
