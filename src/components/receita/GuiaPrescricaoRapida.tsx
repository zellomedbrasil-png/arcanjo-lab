import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  GERIATRICO_PRESETS, GASTRO_PRESETS, SUS_PRESETS,
  CANAL_INFO, CEAF_NOTA_INFORMATIVA, SUS_ALERTAS,
  type CanalGratuito, type MedicamentoPreset,
} from '../../data/medicamentosGuia';
import GuiaPresetCard from './GuiaPresetCard';

type TabId = 'geriatria' | 'gastro' | 'sus';

const TABS: Array<{ id: TabId; label: string; count: number }> = [
  { id: 'geriatria', label: 'Geriátricos', count: GERIATRICO_PRESETS.length },
  { id: 'gastro', label: 'Gastroenterologia', count: GASTRO_PRESETS.length },
  { id: 'sus', label: 'SUS Gratuitos', count: SUS_PRESETS.length },
];

// Ordem e estilos dos grupos de canal da aba SUS. Classes completas — Tailwind
// não compila classe montada dinamicamente.
const CANAIS_ORDEM: Array<{ canal: CanalGratuito; titulo: string; heading: string; dot: string }> = [
  { canal: 'FP', titulo: 'Farmácia Popular — retire na drogaria com esta receita', heading: 'text-emerald-700', dot: 'bg-emerald-500' },
  { canal: 'CBAF', titulo: 'UBS — retirada na farmácia da unidade', heading: 'text-sky-700', dot: 'bg-sky-500' },
  { canal: 'CEAF', titulo: 'Alto custo — via LME/PCDT', heading: 'text-violet-700', dot: 'bg-violet-500' },
];

export default function GuiaPrescricaoRapida({
  onPrescrever,
}: {
  onPrescrever: (preset: MedicamentoPreset) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('geriatria');

  return (
    <div className="mb-6 bg-gradient-to-br from-indigo-50/20 via-indigo-50/10 to-transparent border border-indigo-100/50 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <span className="block text-xs font-bold uppercase text-indigo-700 tracking-wider">
          Guia Clínico de Prescrição Rápida
        </span>

        {/* Abas */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? tab.id === 'sus'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {activeTab !== 'sus' ? (
        /* Abas Geriátricos / Gastro — grade simples */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
          {(activeTab === 'geriatria' ? GERIATRICO_PRESETS : GASTRO_PRESETS).map((preset) => (
            <GuiaPresetCard key={preset.nome} preset={preset} onPrescrever={onPrescrever} />
          ))}
        </div>
      ) : (
        /* Aba SUS Gratuitos — agrupada por canal de acesso */
        <div className="max-h-[340px] overflow-y-auto pr-1 space-y-4">
          {/* Legenda dos canais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {CANAIS_ORDEM.map(({ canal, dot }) => (
              <div key={canal} className="flex items-start gap-1.5 bg-white/70 border border-gray-100 rounded-lg px-2 py-1.5">
                <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${dot}`} />
                <div className="min-w-0">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-700">
                    {CANAL_INFO[canal].rotulo}
                  </span>
                  <span className="block text-[9px] text-gray-500 leading-snug">
                    {CANAL_INFO[canal].descricao}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Grupos por canal */}
          {CANAIS_ORDEM.map(({ canal, titulo, heading, dot }) => {
            const itens = SUS_PRESETS.filter((p) => p.gratuito?.canal === canal);
            if (itens.length === 0) return null;
            return (
              <div key={canal}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${heading}`}>
                    {titulo} ({itens.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {itens.map((preset) => (
                    <GuiaPresetCard key={preset.nome} preset={preset} onPrescrever={onPrescrever} />
                  ))}
                </div>
                {canal === 'CEAF' && (
                  <p className="mt-2 bg-violet-50 border border-violet-100 rounded-lg p-2 text-[10px] text-violet-800 leading-snug">
                    {CEAF_NOTA_INFORMATIVA}
                  </p>
                )}
              </div>
            );
          })}

          {/* Alertas clínicos e de acesso */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle size={12} className="text-amber-600 shrink-0" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                Atenção — regras de acesso e segurança
              </span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {SUS_ALERTAS.map((alerta) => (
                <li key={alerta} className="text-[10px] text-amber-800 leading-snug">
                  {alerta}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
