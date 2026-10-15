import type { ReactNode } from 'react';
import { useReceitaStore, type MedicamentoReceita } from '../../../store/useReceitaStore';
import { REGRAS_MODELO, type InfoClasse } from '../../../data/regrasReceita';
import { quantidadeComExtenso } from '../../../utils/porExtenso';
import { renderMarkdown } from '../../../utils/markdown';

/**
 * Listas A, B, B2, C2 e C3 só podem ser prescritas no talonário numerado
 * pela Vigilância Sanitária (SNCR). O sistema NÃO imprime esses itens como
 * receita: gera esta guia com os campos já montados para o médico transcrever
 * à mão na notificação. Marcada "NÃO É RECEITA" para nunca ser aceita no balcão.
 */
export default function GuiaTranscricaoNotificacao({ med, info }: { med: MedicamentoReceita; info: InfoClasse }) {
  const pacienteNome = useReceitaStore((s) => s.pacienteNome);
  const pacienteCpf = useReceitaStore((s) => s.pacienteCpf);
  const pacienteSemCpf = useReceitaStore((s) => s.pacienteSemCpf);
  const pacienteEndereco = useReceitaStore((s) => s.pacienteEndereco);
  const pacienteCidade = useReceitaStore((s) => s.pacienteCidade);
  const pacienteUf = useReceitaStore((s) => s.pacienteUf);
  const pacienteCep = useReceitaStore((s) => s.pacienteCep);
  const data = useReceitaStore((s) => s.data);
  const regra = REGRAS_MODELO[info.modelo];

  const endereco = [pacienteEndereco, [pacienteCidade, pacienteUf].filter(Boolean).join('/'), pacienteCep ? `CEP ${pacienteCep}` : '']
    .filter((s) => s && s.trim())
    .join(' - ');

  const campo = (rotulo: string, valor: ReactNode) => (
    <div style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: '0.5pt solid #000' }}>
      <div style={{ width: '48mm', fontWeight: 700, flexShrink: 0 }}>{rotulo}</div>
      <div style={{ flex: 1 }}>{valor || '—'}</div>
    </div>
  );

  return (
    <div
      className="bg-white text-black"
      style={{ width: '210mm', height: '297mm', boxSizing: 'border-box', padding: '14mm 16mm', position: 'relative', overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontSize: '86px', fontWeight: 900, color: 'rgba(0,0,0,0.07)', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}
      >
        NÃO É RECEITA
      </div>

      <div style={{ border: '2px solid #000', padding: '8px 12px', marginBottom: '14px' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.04em' }}>NÃO É RECEITA — GUIA DE TRANSCRIÇÃO</div>
        <div style={{ marginTop: '4px' }}>
          Transcreva à mão na <strong>{regra.talonario}</strong>, talonário numerado pela Vigilância Sanitária (SNCR).
          Esta folha não tem validade na farmácia.
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Substância lista {info.lista}</div>
      {campo('Paciente', pacienteNome)}
      {campo('CPF', pacienteSemCpf && !pacienteCpf ? 'Não possui' : pacienteCpf)}
      {campo('Endereço', endereco)}
      {campo('Medicamento (DCB)', <strong style={{ textTransform: 'uppercase' }}>{med.principioAtivo || med.nomeDigitado}</strong>)}
      {campo('Forma farmacêutica', med.formaFarmaceutica)}
      {campo('Quantidade', med.quantidade ? quantidadeComExtenso(med.quantidade) : '')}
      {campo('Posologia', <span dangerouslySetInnerHTML={{ __html: renderMarkdown(med.posologia) }} />)}
      {campo('Duração', med.duracao)}
      {campo('Data', data)}

      <div style={{ marginTop: '16px', fontSize: '12px', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 700, marginBottom: '2px' }}>Antes de entregar ao paciente</div>
        <div>• Uma substância por notificação. Sem rasura; quantidade em número e por extenso.</div>
        <div>• Validade: {regra.validadeDias} dias a partir da emissão, em todo o país.</div>
        <div>• Limite por notificação: até {regra.limiteDias} dias de tratamento (ou 5 ampolas). Acima disso, justificativa com CID.</div>
        <div>• Não imprima a notificação em impressora comum nem acrescente caracteres à numeração.</div>
      </div>
    </div>
  );
}
