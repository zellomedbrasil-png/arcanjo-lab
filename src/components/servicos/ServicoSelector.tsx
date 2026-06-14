import { useAppStore } from '../../store/useAppStore';
import {
  SERVICOS, GRUPOS_SERVICOS, SERVICOS_POR_GRUPO, SERVICO_REGRAS,
} from '../../data/servicos';
import type { ServicoGrupo, ServicoDef } from '../../data/servicos';
import {
  Activity, Wind, Ear, Brain, Apple, Hand, Sparkles, X, CheckCircle2, Wand2, Info,
} from 'lucide-react';
import type { ElementType } from 'react';
import { toast } from '../../lib/toast';

const GRUPO_UI: Record<ServicoGrupo, { label: string; icon: ElementType; activeBg: string; color: string }> = {
  FISIOTERAPIA:        { label: '🦴 Fisioterapia',        icon: Activity, activeBg: 'bg-emerald-600', color: 'text-emerald-500' },
  FONOAUDIOLOGIA:      { label: '👂 Fonoaudiologia',      icon: Ear,      activeBg: 'bg-sky-600',     color: 'text-sky-500' },
  PSICOLOGIA:          { label: '🧠 Psicologia',          icon: Brain,    activeBg: 'bg-indigo-600',  color: 'text-indigo-500' },
  NUTRICAO:            { label: '🍎 Nutrição',            icon: Apple,    activeBg: 'bg-rose-600',    color: 'text-rose-500' },
  TERAPIA_OCUPACIONAL: { label: '🖐️ Terapia Ocupacional', icon: Hand,     activeBg: 'bg-amber-600',   color: 'text-amber-500' },
  ACUPUNTURA:          { label: '🌿 Acupuntura',          icon: Sparkles, activeBg: 'bg-teal-600',    color: 'text-teal-500' },
};

const ICON_POR_ID: Record<string, ElementType> = {
  FISIO_MOTORA: Activity,
  FISIO_RESPIRATORIA: Wind,
  FONOAUDIOLOGIA: Ear,
  PSICOLOGIA: Brain,
  NUTRICAO: Apple,
  TERAPIA_OCUPACIONAL: Hand,
  ACUPUNTURA: Sparkles,
};

export default function ServicoSelector() {
  const {
    convenio, servicosSelecionados, toggleServico, setServicosSelecionados,
    justificativaServicos, setJustificativaServicos,
  } = useAppStore();

  const total = servicosSelecionados.length;
  const regras = convenio === 'ISSEC' ? SERVICO_REGRAS.ISSEC : convenio === 'IPM' ? SERVICO_REGRAS.IPM : null;

  const cobertura = (s: ServicoDef) =>
    convenio === 'ISSEC' ? s.coberturaIssec : convenio === 'IPM' ? s.coberturaIpm : '';

  const aplicarJustificativaPadrao = (s: ServicoDef) => {
    // Aplicar o texto-padrão também seleciona a terapia (evita a guia ficar sem terapia marcada).
    if (!servicosSelecionados.includes(s.id) && servicosSelecionados.length < 3) {
      toggleServico(s.id);
    }
    const atual = justificativaServicos.trim();
    if (atual && !atual.includes(s.justificativaPadrao.slice(0, 30))) {
      setJustificativaServicos(`${atual}\n\n${s.justificativaPadrao}`);
    } else {
      setJustificativaServicos(s.justificativaPadrao);
    }
    toast.success(`${s.nomeCurto} selecionada · texto-padrão aplicado`);
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
      <div className="p-5.5">
        {/* Counter & info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-neutral-text font-medium">
              Selecione até <strong>3 terapias</strong> por guia.
            </p>
            <p className="text-xs text-neutral-text-muted mt-0.5">
              O ISSEC recomenda <strong>uma terapia por guia</strong> (emita guias separadas para tipos distintos de serviço).
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-8 h-2 rounded-full transition-all ${i < total ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            ))}
            <span className="text-xs text-neutral-text-muted ml-1 font-semibold">{total}/3</span>
          </div>
        </div>

        {/* Regras do convênio ativo */}
        {regras && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-[11px] text-blue-900 leading-relaxed">
            <Info size={15} className="shrink-0 mt-0.5 text-blue-500" />
            <div className="space-y-0.5">
              <p><strong className="font-bold">{convenio}</strong> · Guia: {regras.guia}</p>
              <p>Validade do pedido: {regras.validade}</p>
              <p className="text-blue-700/90">Documentos: {regras.documentos}</p>
              <p className="text-blue-700/80">Excedente: {regras.excedente}</p>
            </div>
          </div>
        )}

        {/* Selected chips */}
        {total > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
            {servicosSelecionados.map(id => {
              const s = SERVICOS.find(x => x.id === id);
              if (!s) return null;
              const Icon = ICON_POR_ID[id] ?? Activity;
              return (
                <span key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                  <Icon size={11} />
                  {s.nomeCurto}
                  <button onClick={() => toggleServico(id)} className="ml-1 hover:text-emerald-200 transition-colors cursor-pointer">
                    <X size={11} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Therapy grid grouped */}
        <div className="space-y-4">
          {GRUPOS_SERVICOS.map(grupo => {
            const servicos = SERVICOS_POR_GRUPO[grupo];
            if (!servicos || servicos.length === 0) return null;
            const ui = GRUPO_UI[grupo];
            return (
              <div key={grupo} className="rounded-xl border border-neutral-border overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50">
                  <h4 className="text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider">{ui.label}</h4>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-white">
                  {servicos.map((s) => {
                    const isSelected = servicosSelecionados.includes(s.id);
                    const isFull = total >= 3 && !isSelected;
                    const Icon = ICON_POR_ID[s.id] ?? ui.icon;
                    const cob = cobertura(s);
                    return (
                      <div
                        key={s.id}
                        className={`relative flex flex-col gap-2 p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? `${ui.activeBg} border-transparent text-white shadow-sm`
                            : isFull
                              ? 'border-neutral-border bg-slate-50 text-neutral-text-muted/50'
                              : 'border-neutral-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <button
                          onClick={() => toggleServico(s.id)}
                          disabled={isFull}
                          title={isFull ? 'Limite de 3 terapias atingido' : s.nome}
                          className="flex items-start gap-2 text-left cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Icon size={18} className={`shrink-0 mt-0.5 ${isSelected ? 'text-white' : ui.color}`} />
                          <div className="min-w-0">
                            <span className={`block text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-neutral-text'}`}>
                              {s.nomeCurto}
                            </span>
                            {cob && (
                              <span className={`block text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-white/85' : 'text-neutral-text-muted'}`}>
                                {cob}
                              </span>
                            )}
                          </div>
                          {isSelected && <CheckCircle2 size={13} className="absolute top-2 right-2 text-white opacity-90" />}
                        </button>
                        <button
                          onClick={() => aplicarJustificativaPadrao(s)}
                          title="Aplicar texto-padrão de justificativa (anti-glosa)"
                          className={`flex items-center justify-center gap-1 text-[10px] font-bold rounded-md py-1 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Wand2 size={10} />
                          Texto-padrão
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {total > 0 && (
          <button
            onClick={() => {
              if (confirm('Limpar todas as terapias selecionadas?')) setServicosSelecionados([]);
            }}
            className="mt-4.5 text-xs text-neutral-text-muted hover:text-neutral-text underline transition-colors cursor-pointer"
          >
            Limpar toda a seleção
          </button>
        )}
      </div>
    </div>
  );
}
