import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PAINEIS_MARKDOWN } from '../../types';
import type { ConvenioProtocolo } from '../../data/protocolosExames';
import { montarGuiaPainel } from '../../utils/montarGuiaExames';
import PreviaGuia, { Segmentado } from './PreviaGuia';

type TipoPainel = 'CR' | 'GASTRO' | 'GERAIS';

const ehGastro = (nome: string) => nome.startsWith('GASTRO — ');
const ehCR = (nome: string) => nome.includes('-CR-');
const tipoDe = (nome: string): TipoPainel => (ehCR(nome) ? 'CR' : ehGastro(nome) ? 'GASTRO' : 'GERAIS');

/** Painéis de cada tipo, na ordem do arquivo de dados. */
const PAINEIS_DO_TIPO: Record<TipoPainel, { id: string; nome: string }[]> = { CR: [], GASTRO: [], GERAIS: [] };
for (const [chave, painel] of Object.entries(PAINEIS_MARKDOWN)) {
  PAINEIS_DO_TIPO[tipoDe(painel.nome)].push({ id: chave, nome: painel.nome.replace('GASTRO — ', '') });
}

const TIPOS: { id: TipoPainel; nome: string }[] = [
  { id: 'CR', nome: 'Carlos Ribeiro' },
  { id: 'GASTRO', nome: 'Gastro' },
  { id: 'GERAIS', nome: 'Gerais' },
];

// Última escolha fica no navegador para a aba já abrir no painel de sempre.
const CHAVE_LEMBRAR = 'arcanjo-lab-paineis-escolha';
function lerEscolha(): { tipo: TipoPainel; painel: Partial<Record<TipoPainel, string>> } {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_LEMBRAR) || '{}');
    if (v && (v.tipo === 'CR' || v.tipo === 'GASTRO' || v.tipo === 'GERAIS')) return { tipo: v.tipo, painel: v.painel ?? {} };
  } catch {
    // sem armazenamento: começa do padrão
  }
  return { tipo: 'CR', painel: {} };
}
function salvarEscolha(v: ReturnType<typeof lerEscolha>) {
  try {
    localStorage.setItem(CHAVE_LEMBRAR, JSON.stringify(v));
  } catch {
    // sem armazenamento: só não lembra
  }
}

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
 * Aba Painéis, no mesmo formato da aba Protocolo: escolhas no topo e a guia do
 * painel logo abaixo, já aberta. Carlos Ribeiro sai de sexo × convênio (como o
 * protocolo); Gastro e Gerais, do painel escolhido. Sexo e convênio são os do
 * cadastro do paciente, então a guia lateral fica com o mesmo convênio.
 */
export default function PaineisExamesCard() {
  const genero = useAppStore((s) => s.genero);
  const convenio = useAppStore((s) => s.convenio);
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const setPaciente = useAppStore((s) => s.setPaciente);

  const [escolha, setEscolha] = useState(lerEscolha);
  const mudar = (v: typeof escolha) => {
    setEscolha(v);
    salvarEscolha(v);
  };

  const conv: ConvenioProtocolo | null = convenio === 'ISSEC' || convenio === 'IPM' ? convenio : null;
  const { tipo } = escolha;
  const opcoes = PAINEIS_DO_TIPO[tipo];
  const lembrado = escolha.painel[tipo];
  const painelLivre = opcoes.some((o) => o.id === lembrado) ? lembrado! : opcoes[0]?.id;
  const chave = tipo === 'CR' ? (conv ? `${conv}-CR-${genero}` : null) : painelLivre;

  const seletorConvenio = (
    <Segmentado<ConvenioProtocolo>
      rotulo="Convênio"
      opcoes={[
        { id: 'ISSEC', nome: 'ISSEC' },
        { id: 'IPM', nome: 'IPM' },
      ]}
      valor={conv}
      onChange={(v) => setPaciente({ convenio: v })}
    />
  );

  return (
    <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3.5">
        <Segmentado<TipoPainel> rotulo="Painel" opcoes={TIPOS} valor={tipo} onChange={(v) => mudar({ ...escolha, tipo: v })} />
        {tipo === 'CR' && (
          <Segmentado<'M' | 'F'>
            rotulo="Sexo"
            opcoes={[
              { id: 'M', nome: 'Masculino' },
              { id: 'F', nome: 'Feminino' },
            ]}
            valor={genero}
            onChange={(v) => setPaciente({ genero: v })}
            destaque={pacienteNome.trim() ? undefined : 'confirme'}
          />
        )}
        {seletorConvenio}
        {tipo !== 'CR' && (
          <div className="w-full min-w-0">
            <Segmentado<string>
              rotulo={tipo === 'GASTRO' ? 'Investigação' : 'Rastreio'}
              opcoes={opcoes}
              valor={painelLivre ?? null}
              onChange={(v) => mudar({ ...escolha, painel: { ...escolha.painel, [tipo]: v } })}
            />
          </div>
        )}
      </div>

      {chave && conv ? (
        <PreviaPainel key={`${chave}-${conv}`} chave={chave} convenio={conv} />
      ) : (
        <p className="px-4 pb-4 text-xs text-neutral-text-muted">
          Os painéis têm código e valor para ISSEC e IPM. Escolha um dos dois para montar a guia.
        </p>
      )}
    </section>
  );
}
