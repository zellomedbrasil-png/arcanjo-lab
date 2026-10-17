import { useReceitaStore } from '../../../store/useReceitaStore';

/**
 * Bloco de assinatura das receitas.
 * - FISICO: linha limpa para assinar à caneta e carimbar.
 * - DIGITAL: espaço reservado para o selo/QR que o assinador ICP-Brasil carimba
 *   no PDF (CFM 2.299/2021). O app não assina: o médico salva o PDF e assina
 *   no VIDaaS, BirdID ou assinador.iti.gov.br.
 */
export default function RodapeAssinatura({ rotulo }: { rotulo: string }) {
  const modo = useReceitaStore((s) => s.modoEmissao);

  if (modo === 'DIGITAL') {
    return (
      <div style={{ width: '62mm', textAlign: 'center', fontSize: '8px', lineHeight: 1.2 }}>
        <div
          style={{
            height: '12mm',
            border: '0.5pt dashed #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: '#000',
          }}
        >
          Espaço do selo e QR Code da assinatura digital
        </div>
        <div style={{ paddingTop: '1px', whiteSpace: 'nowrap' }}>ICP-Brasil · conferir em validar.iti.gov.br</div>
      </div>
    );
  }

  return (
    <div style={{ borderTop: '1px solid #000', width: '62mm', paddingTop: '2px', fontSize: '10px', textAlign: 'center' }}>
      {rotulo}
    </div>
  );
}
