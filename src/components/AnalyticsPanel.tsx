import React, { useState } from 'react';
import { 
  Cpu, Sliders, AlertCircle, RefreshCw, FileText, CheckCircle, 
  ArrowRight, Award, ShieldAlert, Zap, Sparkles 
} from 'lucide-react';
import { AISuggestion, AppNetworkUsage, SimCardState, EconomySettings } from '../types';

interface AnalyticsPanelProps {
  apps: AppNetworkUsage[];
  sims: SimCardState[];
  economySettings: EconomySettings;
  suggestions: AISuggestion[];
  onApplySuggestion: (id: string) => void;
  onRefreshAI: () => void;
}

export default function AnalyticsPanel({
  apps,
  sims,
  economySettings,
  suggestions,
  onApplySuggestion,
  onRefreshAI
}: AnalyticsPanelProps) {
  const [geminiReport, setGeminiReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [exportingPDF, setExportingPDF] = useState<boolean>(false);
  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);

  const activeSim = sims.find(s => s.isActive) || sims[0];

  const triggerGeminiAudit = async () => {
    setLoadingReport(true);
    try {
      const response = await fetch('/api/gemini/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apps,
          activeSim,
          economySettings
        })
      });
      const data = await response.json();
      setGeminiReport(data.text || '');
    } catch (err) {
      console.error(err);
      setGeminiReport("Erro de ligação ao módulo de inteligência artificial de Luanda. Por favor, tente novamente.");
    } finally {
      setLoadingReport(false);
    }
  };

  const triggerPDFMockExport = () => {
    setExportingPDF(true);
    setPdfDownloaded(false);
    setTimeout(() => {
      setExportingPDF(false);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 5000);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="analytics_panel_container">
      {/* Suggestions List Left Pane */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Deteções de Poupabilidade Dinâmica
              </h3>
              <p className="text-xs text-slate-400">Medidas de otimização instantâneas baseadas nos seus hábitos de tráfego.</p>
            </div>
            <button 
              onClick={onRefreshAI}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 hover:rotate-180 transition-all duration-500"
            >
              <RefreshCw className="w-4 h-4" />
              Reanalisar
            </button>
          </div>

          <div className="space-y-4">
            {suggestions.map((sug) => (
              <div 
                key={sug.id} 
                className={`p-4 border rounded-xl transition-all duration-300 ${
                  sug.applied 
                    ? 'bg-slate-900/20 border-slate-800/60 opacity-60' 
                    : sug.category === 'leak' 
                    ? 'bg-rose-950/10 border-rose-500/20' 
                    : sug.category === 'efficiency' 
                    ? 'bg-cyan-950/10 border-cyan-500/20' 
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      sug.category === 'leak' ? 'bg-rose-500/10 text-rose-400' :
                      sug.category === 'efficiency' ? 'bg-cyan-500/10 text-cyan-400' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {sug.category === 'leak' ? <ShieldAlert className="w-4.5 h-4.5" /> : <Zap className="w-4.5 h-4.5" />}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{sug.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{sug.shortDesc}</p>
                      
                      <p className="text-[11px] text-slate-500 mt-2 italic">
                        {sug.detailedAnalysis}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-emerald-400 font-mono">+{sug.estimatedSavingsMB} MB</p>
                    <p className="text-[10px] text-emerald-500 font-semibold font-mono">~{sug.estimatedSavingsAOA} AOA</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Gravidade: <strong className={sug.category === 'leak' ? 'text-rose-400' : 'text-slate-300'}>
                    {sug.category === 'leak' ? 'Crítica (Vazamento)' : 'Média'}
                  </strong></span>

                  <button
                    onClick={() => onApplySuggestion(sug.id)}
                    disabled={sug.applied}
                    className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg border flex items-center gap-1 transition-all ${
                      sug.applied
                        ? 'bg-slate-900 text-slate-500 border-slate-900 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20'
                    }`}
                  >
                    <span>{sug.applied ? 'Otimizado ✓' : sug.actionLabel}</span>
                    {!sug.applied && <ArrowRight className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Export Sim Setup */}
        <div className="p-6 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Exportação de Relatórios Corporativos</h3>
              <p className="text-xs text-slate-400 font-sans">Gere documentação em PDF contendo gráficos, tabelas e proezas economizadoras.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={triggerPDFMockExport}
              disabled={exportingPDF}
              className="py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all rounded-xl disabled:opacity-45"
            >
              {exportingPDF ? "A compilar tabelas PDF..." : "Exportar Relatório Mensal (.pdf)"}
            </button>
          </div>

          {pdfDownloaded && (
            <p className="text-xs text-emerald-400 font-bold animate-pulse">
              Sucesso! O ficheiro "NetGuardian_Relatorio_Mensal.pdf" de compressão digital de 14.5KB foi descarregado com sucesso de Luanda.
            </p>
          )}
        </div>
      </div>

      {/* AI Assistant Report Right Pane */}
      <div className="space-y-6">
        <div className="p-5 bg-gradient-to-b from-[#0e162f] to-[#040815] border border-indigo-500/20 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shadow-inner">
              <Cpu className="w-4.5 h-4.5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Cunene AI Auditoria</h3>
              <p className="text-[10px] text-slate-400">O seu perito virtual angolano em consumos</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-5">
            O nosso motor virtual está preparado para efetuar uma auditoria instantânea baseada nas operadoras angolanas e sugerir planos inteligentes para aliviar a sua fatura digital.
          </p>

          <button
            onClick={triggerGeminiAudit}
            disabled={loadingReport}
            className="w-full text-xs font-bold py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-40"
          >
            {loadingReport ? "A analisar padrões de rede..." : "Interrogar Cunene AI"}
          </button>
        </div>

        {/* Gemini Report Output Layout (High-fidelity custom markdown parser helper) */}
        {geminiReport && (
          <div className="p-5 rounded-2xl bg-[#090D1A] border border-slate-800 shadow-xl overflow-hidden animate-fade-in">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3.5 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Parecer da IA Oficial</span>
              <span className="text-[10px] lowercase font-normal text-slate-500 font-mono">v1.2 active</span>
            </h4>

            <div className="text-xs text-slate-300 leading-relaxed space-y-4 max-h-[460px] overflow-y-auto pr-2 font-sans custom-scrollbar">
              {/* Very clean simple translation of custom paragraphs mimicking real responsive md */}
              {geminiReport.split('\n\n').map((paragraph, pid) => {
                if (paragraph.startsWith('###') || paragraph.startsWith('####')) {
                  const title = paragraph.replace(/#/g, '').trim();
                  return <h5 key={pid} className="text-xs font-bold text-white mt-4">{title}</h5>;
                }
                if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
                  return (
                    <ul key={pid} className="list-disc pl-4 space-y-1.5 text-slate-300">
                      {paragraph.split('\n').map((li, lid) => {
                        const cleanLi = li.replace(/^[-*]\s*/, '');
                        return <li key={lid}>{cleanLi}</li>;
                      })}
                    </ul>
                  );
                }
                return <p key={pid} className="text-slate-300">{paragraph}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
