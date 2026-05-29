import React, { useState } from 'react';
import { 
  Database, DollarSign, Zap, HelpCircle, AlertCircle, 
  Smartphone, ArrowRight, ShieldCheck, CreditCard, Sparkles 
} from 'lucide-react';
import { MobileBundle, SimCardState, OperatorName } from '../types';

interface TariffsPanelProps {
  sims: SimCardState[];
  tariffs: MobileBundle[];
  onRecharge: (simId: string, amountAOA: number) => void;
  onBuyBundle: (simId: string, bundleId: string) => Promise<string | null>;
  isProcessing: boolean;
}

export default function TariffsPanel({
  sims,
  tariffs,
  onRecharge,
  onBuyBundle,
  isProcessing
}: TariffsPanelProps) {
  const [selectedSimId, setSelectedSimId] = useState<string>(sims[0]?.id || "");
  const [rechargeAmount, setRechargeAmount] = useState<number>(1000);
  const [operatorFilter, setOperatorFilter] = useState<OperatorName | 'TODAS'>('TODAS');
  const [actionFeedback, setActionFeedback] = useState<{ text: string; success: boolean } | null>(null);

  const activeSim = sims.find(s => s.id === selectedSimId) || sims[0];

  const filteredTariffs = tariffs.filter(t => {
    if (operatorFilter === 'TODAS') return true;
    return t.operator === operatorFilter;
  });

  const handleLocalRecharge = e => {
    e.preventDefault();
    if (!selectedSimId) return;
    onRecharge(selectedSimId, rechargeAmount);
    setActionFeedback({
      text: `Carregamento de ${rechargeAmount} AOA concluído com sucesso no número ${activeSim?.phoneNumber}!`,
      success: true
    });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleBuy = async (bundle: MobileBundle) => {
    if (!selectedSimId) return;
    if (activeSim.creditBalanceAOA < bundle.priceAOA) {
      setActionFeedback({
        text: `Saldo Insuficiente! O pacote custa ${bundle.priceAOA} AOA, mas tem apenas ${activeSim.creditBalanceAOA} AOA. Faça uma recarga abaixo primeiro!`,
        success: false
      });
      setTimeout(() => setActionFeedback(null), 6000);
      return;
    }

    const message = await onBuyBundle(selectedSimId, bundle.id);
    if (message) {
      setActionFeedback({
        text: message,
        success: true
      });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6" id="tariffs_panel_container">
      {/* Simulation Feedback Alert */}
      {actionFeedback && (
        <div 
          className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            actionFeedback.success 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
          id="action_feedback_toast"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-medium">{actionFeedback.text}</p>
        </div>
      )}

      {/* Grid: SIM Status and Recharge Station */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SIM Active Quick Selector Card */}
        <div className="md:col-span-2 p-5 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Smartphone className="w-4.5 h-4.5 text-indigo-400" />
              Gestão de Cartões SIM (Simulados)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sims.map((sim) => (
                <div 
                  key={sim.id}
                  onClick={() => setSelectedSimId(sim.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    selectedSimId === sim.id 
                      ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg' 
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                      sim.operator === 'UNITEL' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      sim.operator === 'AFRICELL' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold'
                    }`}>
                      {sim.operator}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${sim.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2.5">{sim.phoneNumber}</h4>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/65 text-[11px] text-slate-400">
                    <div>
                      <p className="text-slate-500">Crédito Kz</p>
                      <span className="font-mono text-white font-bold">{sim.creditBalanceAOA} Kz</span>
                    </div>
                    <div>
                      <p className="text-slate-500">Dados (MB)</p>
                      <span className="font-mono text-indigo-300 font-bold">{(sim.currentDataMB / 1024).toFixed(1)} GB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-indigo-950/20 border border-indigo-500/10 rounded-xl">
            <p className="text-xs text-slate-300 leading-relaxed">
              <Sparkles className="w-4 h-4 text-indigo-400 inline mr-1.5" />
              Cada SIM simula latências e custos de roaming em Angola. O saldo em <strong>Kwanzas (AOA)</strong> é debitado na ativação direta de pacotes de dados.
            </p>
          </div>
        </div>

        {/* Recharge money form */}
        <div className="p-5 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mb-2">
            <CreditCard className="w-4.5 h-4.5 text-cyan-400" />
            Recarga Rápida Angola (Kz)
          </h3>
          <p className="text-xs text-slate-400 mb-4">Selecione o cartão sim e simule a recarga física de recargas Unitela ou Africella.</p>

          <form onSubmit={handleLocalRecharge} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Destinatário</label>
              <select
                value={selectedSimId}
                onChange={(e) => setSelectedSimId(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                {sims.map(s => (
                  <option key={s.id} value={s.id}>{s.operator} ({s.phoneNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Montante da Recarga</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[150, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg border ${
                      rechargeAmount === amt 
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="Montante customizado (AOA)"
                min="50"
              />
            </div>

            <button
              type="submit"
              className="w-full text-xs py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 font-bold text-white rounded-xl transition-all shadow-md shadow-indigo-500/10"
            >
              Simular Inserção de Saldo
            </button>
          </form>
        </div>
      </div>

      {/* Operator Filter & Bundles List */}
      <div className="p-6 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-white">Tarifários de Dados Populares em Angola</h3>
            <p className="text-xs text-slate-400">Escolha o melhor plano de dados móveis com as tarifas oficiais das operadoras.</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {['TODAS', 'UNITEL', 'AFRICELL', 'MOVICEL'].map((op) => (
              <button
                key={op}
                onClick={() => setOperatorFilter(op as any)}
                className={`px-3 py-1.5 font-bold rounded-lg border transition-all ${
                  operatorFilter === op
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="tariffs_bento_grid">
          {filteredTariffs.map((bundle) => {
            const sizeGB = (bundle.volumeMB / 1024).toFixed(1);
            const isAffordable = activeSim && activeSim.creditBalanceAOA >= bundle.priceAOA;

            return (
              <div 
                key={bundle.id} 
                className="p-4 bg-slate-900/35 hover:bg-slate-900/60 transition-all border border-slate-800/80 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      bundle.operator === 'UNITEL' ? 'bg-orange-500/10 text-orange-400' :
                      bundle.operator === 'AFRICELL' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {bundle.operator}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      {bundle.priceAOA} Kz
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{bundle.name}</h4>
                  <p className="text-2xl font-black text-white mt-2 mb-2 font-sans tracking-tight">
                    {sizeGB} <span className="text-xs font-normal text-slate-400">GB</span>
                  </p>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    {bundle.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Validade: <strong>{bundle.validityDays} dias</strong></span>
                  
                  <button
                    onClick={() => handleBuy(bundle)}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition-all ${
                      isAffordable
                        ? 'bg-[#0f172a] hover:bg-cyan-950/40 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-900 text-slate-500 border border-slate-900 cursor-not-allowed'
                    }`}
                  >
                    <span>Ativar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
