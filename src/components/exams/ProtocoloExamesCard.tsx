import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ESPECIALIDADES, type ConvenioProtocolo, type TipoConsulta } from '../../data/protocolosExames';
import { lerIdade, montarGuiaExames, type ContextoGuia } from '../../utils/montarGuiaExames';
import PreviaGuia, { Segmentado } from './PreviaGuia';

/** Guia do protocolo para um contexto; a `key` do contexto recomeça as marcações. */
function PreviaProtocolo({ ctx, idade }: { ctx: ContextoGuia; idade?: number }) {
  const guia = useMemo(() => montarGuiaExames(ctx, idade), [ctx, idade]);
  return <PreviaGuia guia={guia} convenio={ctx.convenio} />;
}

/**
 * Protocolo de exames: área × consulta × sexo × convênio → guia montada pelos
 * blocos de src/data/protocolosExames.ts, revisável antes de ir para a seleção.
 * Sexo e convênio são os mesmos campos do cadastro do paciente.
 */
export default function ProtocoloExamesCard() {
  const especialidade = useAppStore((s) => s.especialidade);
  const tipoConsulta = useAppStore((s) => s.tipoConsulta);
  const genero = useAppStore((s) => s.genero);
  const convenio = useAppStore((s) => s.convenio);
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const pacienteIdade = useAppStore((s) => s.pacienteIdade);
  const setPaciente = useAppStore((s) => s.setPaciente);

  const conv: ConvenioProtocolo | null = convenio === 'ISSEC' || convenio === 'IPM' ? convenio : null;
  const ctx = useMemo<ContextoGuia | null>(
    () => (conv ? { area: especialidade, consulta: tipoConsulta, sexo: genero, convenio: conv } : null),
    [especialidade, tipoConsulta, genero, conv]
  );
  const idade = lerIdade(pacienteIdade);

  return (
    <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3.5">
        <Segmentado
          rotulo="Área"
          opcoes={ESPECIALIDADES.map((e) => ({ id: e.id, nome: e.nome === 'Gastroenterologia' ? 'Gastro' : e.nome === 'Clínica Médica' ? 'Clínica' : e.nome }))}
          valor={especialidade}
          onChange={(v) => setPaciente({ especialidade: v })}
        />
        <Segmentado<TipoConsulta>
          rotulo="Consulta"
          opcoes={[
            { id: 'PRIMEIRA', nome: '1ª consulta' },
            { id: 'RETORNO', nome: 'Retorno' },
          ]}
          valor={tipoConsulta}
          onChange={(v) => setPaciente({ tipoConsulta: v })}
        />
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
        <Segmentado<ConvenioProtocolo>
          rotulo="Convênio"
          opcoes={[
            { id: 'ISSEC', nome: 'ISSEC' },
            { id: 'IPM', nome: 'IPM' },
          ]}
          valor={conv}
          onChange={(v) => setPaciente({ convenio: v })}
        />
      </div>

      {ctx ? (
        <PreviaProtocolo key={`${ctx.area}-${ctx.consulta}-${ctx.sexo}-${ctx.convenio}`} ctx={ctx} idade={idade} />
      ) : (
        <p className="px-4 pb-4 text-xs text-neutral-text-muted">
          Os protocolos existem para ISSEC e IPM. Escolha um dos dois para montar a guia.
        </p>
      )}
    </section>
  );
}
