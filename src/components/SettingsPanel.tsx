import React, { useState } from 'react';
import { 
  Sliders, SlidersHorizontal, ShieldAlert, Sparkles, CheckCircle, 
  Settings, Clock, BellRing, Database, Trash2 
} from 'lucide-react';
import { EconomySettings } from '../types';

interface SettingsPanelProps {
  settings: EconomySettings;
  onUpdateSettings: (settings: EconomySettings) => void;
  onResetSimulationData: () => void;
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  onResetSimulationData
}: SettingsPanelProps) {
  const [budgetLocal, setBudgetLocal] = useState<number>(settings.dailyMBBudget);
  const [saveConfirmation, setSaveConfirmation] = useState<boolean>(false);

  const handleToggle = (key: keyof EconomySettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
    triggerFeedback();
  };

  const handleVideoQuality = (val: EconomySettings['videoQualityLimit']) => {
    onUpdateSettings({
      ...settings,
      videoQualityLimit: val
    });
    triggerFeedback();
  };

  const triggerFeedback = () => {
    setSaveConfirmation(true);
    setTimeout(() => setSaveConfirmation(false), 2500);
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      dailyMBBudget: budgetLocal
    });
    triggerFeedback();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="settings_panel_layout">
      {/* Settings Options Left Card */}
      <div className="lg:col-span-2 p-6 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Configurações de Poupança Extreme</h3>
          </div>
          {saveConfirmation && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Aplicado
            </span>
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          {/* Toggle background block */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Bloquear Dados em Segundo Plano</h4>
              <p className="text-xs text-slate-400">Suspende todas as fugas e transmissões ocultas de aplicativos que não estão no ecrã principal.</p>
            </div>
            
            <button
              onClick={() => handleToggle('blockBackgroundData')}
              className={`w-11 h-6 rounded-full transition-all relative ${
                settings.blockBackgroundData ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                settings.blockBackgroundData ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Toggle budget state */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Ativar Limitador de Alerta Diário</h4>
              <p className="text-xs text-slate-400">Gera avisos de telemetria no seu monitor móvel caso atinja o teto recomendado.</p>
            </div>
            
            <button
              onClick={() => handleToggle('dataLimiterActive')}
              className={`w-11 h-6 rounded-full transition-all relative ${
                settings.dataLimiterActive ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                settings.dataLimiterActive ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Toggle Night Sched */}
          <div className="flex items-start justify-between gap-4 p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl">
            <div className="space-y-0.5 text-xs">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide flex items-center gap-1.5 header-style">
                <Clock className="w-4 h-4 text-orange-400" /> Agendamento Noturno (00h - 05h)
              </h4>
              <p className="text-xs text-slate-400">Retarda atualizações automáticas e sincronizações de Drive para as horas baratas do pacote Net+ Noite.</p>
            </div>
            
            <button
              onClick={() => handleToggle('nightModeActive')}
              className={`w-11 h-6 rounded-full transition-all relative ${
                settings.nightModeActive ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                settings.nightModeActive ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Video Quality Preference Select */}
        <div className="p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Qualidade Máxima para Mídias & Vídeos</h4>
          <p className="text-xs text-slate-400 leading-relaxed">Comprime ficheiros multimédia ao navegar em sites corporativos.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            {['low', 'medium', 'high', 'auto'].map((q) => (
              <button
                key={q}
                onClick={() => handleVideoQuality(q as any)}
                className={`py-2 px-3.5 font-bold uppercase rounded-lg border transition-all ${
                  settings.videoQualityLimit === q
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                }`}
              >
                {q === 'low' ? 'Baixa (360p)' : q === 'medium' ? 'Média (480p)' : q === 'high' ? 'HD (720p)' : 'Automática'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extreme Settings Right Cards */}
      <div className="space-y-6">
        {/* Daily MB Budget Input Panel */}
        <div className="p-5 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
            <Database className="w-4.5 h-4.5 text-indigo-400" />
            Meta de Consumo Diário
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">Estipule o teto diário recomendado (MB) para evitar consumo extra.</p>

          <form onSubmit={handleBudgetSubmit} className="space-y-4 text-xs">
            <input
              type="number"
              value={budgetLocal}
              onChange={(e) => setBudgetLocal(Math.max(10, parseInt(e.target.value) || 0))}
              className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Ex: 250 MB"
              min="10"
            />

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
            >
              Definir Limite Diário
            </button>
          </form>
        </div>

        {/* Danger zone / resets */}
        <div className="p-5 bg-rose-950/20 border border-rose-500/20 rounded-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-rose-300">Zona de Restauro</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Apague o registo cronológico da simulação móvel local e retorne aos dados padrão do NetGuardian AI.</p>
          </div>

          <button
            onClick={() => {
              onResetSimulationData();
              alert("NetGuardian AI: Estatísticas móveis simuladas e dados de rede restaurados para os valores padrão de fábrica!");
            }}
            className="w-full text-xs py-2 bg-rose-950 hover:bg-rose-900 border border-rose-500/40 font-bold text-rose-300 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Restaurar Base de Dados
          </button>
        </div>
      </div>
    </div>
  );
}
