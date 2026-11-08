import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PAINEIS_MARKDOWN } from '../../types';
import type { ConvenioProtocolo } from '../../data/protocolosExames';
import { montarGuiaPainel } from '../../utils/montarGuiaExames';
import PreviaGuia, { Segmentado } from './PreviaGuia';

const ehGastro = (nome: string) => nome.startsWith('GASTRO — ');
const ehCR = (nome: string) => nome.includes('-CR-');

/** Painel CR (ISSEC-CR-M, IPM-CR-F...) tem convênio próprio; os outros usam o do paciente. */
const convenioDoPainel = (nome: string): ConvenioProtocolo | null =>
  ehCR(nome) ? (nome.startsWith('IPM') ? 'IPM' : 'ISSEC') : null;

const rotulo = (nome: string) => {
  if (ehGastro(nome)) return nome.replace('GASTRO — ', '');
  if (ehCR(nome)) return `${nome.slice(0, -5)} · ${nome.endsWith('-M') ? 'Homem' : 'Mulher'}`;
  return nome;
};

const SECOES = [
  { titulo: 'Gastro — Investigação', filtro: ehGastro, cor: 'emerald' },
  { titulo: 'Carlos Ribeiro (CR) — ISSEC e IPM', filtro: ehCR, cor: 'indigo' },
  { titulo: 'Gerais', filtro: (n: string) => !ehGastro(n) && !ehCR(n), cor: 'blue' },
] as const;

const COR = {
  emerald: {
    titulo: 'text-emerald-700',
    botao: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    ativo: 'bg-emerald-600 text-white border-emerald-600',
  },
  indigo: {
    titulo: 'text-indigo-700',
    botao: 'text-indigo-700 border-indigo-200 hover:bg-indigo-50',
    ativo: 'bg-indigo-600 text-white border-indigo-600',
  },
  blue: {
    titulo: 'text-blue-700',
    botao: 'text-blue-600 border-blue-200 hover:bg-blue-50',
    ativo: 'bg-blue-600 text-white border-blue-600',
  },
};

/** Guia de um painel num convênio; a `key` (painel + convênio) recomeça as marcações. */
function PreviaPainel({ chave, convenio }: { chave: string; convenio: ConvenioProtocolo }) {
  const setJustificativa = useAppStore((s) => s.setJustificativa);
  const painel = PAINEIS_MARKDOWN[chave];
  const guia = useMemo(() => montarGuiaPainel(painel.exames, convenio), [painel, convenio]);

  // Junta a justificativa do painel à que já existe, sem repetir.
  const aplicarJustificativa = () => {
    const nova = painel.justificativa.trim();
    if (!nova) return;
    const atual = (useAppStore.getState().justificativa || '').trim();
    if (!atual) setJustificativa(nova);
    else if (!atual.toUpperCase().includes(nova.toUpperCase())) setJustificativa(`${atual}\n${nova}`);
  };

  return <PreviaGuia guia={guia} convenio={convenio} aoAplicar={aplicarJustificativa} />;
}

/**
 * Aba Painéis: escolher um painel abre a guia dele organizada como na aba
 * Protocolo (grupos, código, valor, marcação e total) antes de ir para a seleção.
 */
export default function PaineisExamesCard() {
  const convenioPaciente = useAppStore((s) => s.convenio);
  const setPaciente = useAppStore((s) => s.setPaciente);
  const [escolhido, setEscolhido] = useState<string | null>(null);

  const convPaciente: ConvenioProtocolo | null =
    convenioPaciente === 'ISSEC' || convenioPaciente === 'IPM' ? convenioPaciente : null;
  const convFixo = escolhido ? convenioDoPainel(escolhido) : null;
  const conv = convFixo ?? convPaciente;

  return (
    <div className="space-y-5">
      {SECOES.map(({ titulo, filtro, cor }) => (
        <div key={titulo}>
          <span className={`block text-[10px] font-extrabold uppercase tracking-wider mb-2 ${COR[cor].titulo}`}>{titulo}</span>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(PAINEIS_MARKDOWN)
              .filter(([, painel]) => filtro(painel.nome))
              .map(([key, painel]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={escolhido === key}
                  onClick={() => setEscolhido(escolhido === key ? null : key)}
                  title={painel.justificativa || `${painel.exames.length} exames`}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    escolhido === key ? COR[cor].ativo : `bg-white ${COR[cor].botao}`
                  }`}
                >
                  {rotulo(painel.nome)}
                </button>
              ))}
          </div>
        </div>
      ))}

      {escolhido ? (
        <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
          <div className="flex items-end justify-between gap-3 flex-wrap px-4 py-3.5">
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted mb-1">Painel</span>
              <span className="text-sm font-bold text-neutral-text">{rotulo(PAINEIS_MARKDOWN[escolhido].nome)}</span>
            </div>
            {convFixo ? (
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted mb-1">Convênio</span>
                <span className="inline-block rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">{convFixo}</span>
                {convPaciente && convPaciente !== convFixo && (
                  <span className="block mt-1 text-[10px] font-semibold text-amber-700">O paciente está como {convPaciente}.</span>
                )}
              </div>
            ) : (
              <Segmentado<ConvenioProtocolo>
                rotulo="Convênio"
                opcoes={[
                  { id: 'ISSEC', nome: 'ISSEC' },
                  { id: 'IPM', nome: 'IPM' },
                ]}
                valor={convPaciente}
                onChange={(v) => setPaciente({ convenio: v })}
              />
            )}
          </div>

          {conv ? (
            <PreviaPainel key={`${escolhido}-${conv}`} chave={escolhido} convenio={conv} />
          ) : (
            <p className="px-4 pb-4 text-xs text-neutral-text-muted">
              Os códigos e valores existem para ISSEC e IPM. Escolha um dos dois para montar a guia.
            </p>
          )}
        </section>
      ) : (
        <p className="text-[11px] text-neutral-text-muted">
          Escolha um painel para ver os exames por grupo, com código e valor, antes de levá-los para a guia.
        </p>
      )}
    </div>
  );
}
