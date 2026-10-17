import type { MedicamentoReceita } from '../../../store/useReceitaStore';
import { renderMarkdown } from '../../../utils/markdown';
import { quantidadeComExtenso } from '../../../utils/porExtenso';
import { duracaoImpressa } from '../../../utils/quantidade';

/**
 * Um item nas receitas de 2 vias: DCB + concentração, forma, quantidade em
 * número e por extenso, posologia e duração. Tudo em preto, fonte legível.
 */
export default function ItemPrescricao({ med, numero }: { med: MedicamentoReceita; numero: number }) {
  const indicacao = med.indicacao.trim()
    ? med.indicacao.toLowerCase().startsWith('para')
      ? med.indicacao
      : `Para ${med.indicacao.toLowerCase()}`
    : '';
  return (
    <div style={{ marginBottom: '5px', fontSize: '11.5px', lineHeight: 1.35, breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', borderBottom: '0.5pt solid #000', paddingBottom: '1px' }}>
        <div>
          <span style={{ fontWeight: 700 }}>{numero}. </span>
          <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '12.5px' }}>{med.principioAtivo || med.nomeDigitado}</span>
          {med.formaFarmaceutica && <span> — {med.formaFarmaceutica}</span>}
          {indicacao && <span style={{ fontSize: '10px' }}> ({indicacao})</span>}
        </div>
        <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{med.quantidade ? `Qtd.: ${quantidadeComExtenso(med.quantidade)}` : 'Qtd.: ________'}</div>
      </div>
      <div style={{ paddingTop: '1px' }}>
        <span style={{ fontWeight: 700 }}>Posologia: </span>
        <span className="receita-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(med.posologia) }} />
        {med.duracao && <span> — {duracaoImpressa(med)}</span>}
      </div>
      {/* Linha própria, recuada e em itálico: titulação futura não se confunde com a quantidade dispensada. */}
      {med.observacoes && (
        <div style={{ fontSize: '10px', fontStyle: 'italic', paddingLeft: '4mm', marginTop: '1px' }}>
          <span style={{ fontWeight: 700 }}>Orientação ao paciente: </span>
          <span className="receita-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(med.observacoes) }} />
        </div>
      )}
      {med.justificativaLimite && (
        <div style={{ fontSize: '10.5px' }}>
          <span style={{ fontWeight: 700 }}>Justificativa (quantidade acima do limite): </span>
          {med.justificativaLimite}
        </div>
      )}
    </div>
  );
}
