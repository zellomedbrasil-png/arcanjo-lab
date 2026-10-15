import type { ReactNode } from 'react';

/**
 * A4 com duas vias iguais em meia folha (A5 cada), para cortar ao meio.
 * Linha de corte só tracejada e fina: nada de fundo cinza ou texto colorido
 * saindo na impressão.
 */
export default function FolhaDuasVias({
  rotulos,
  renderVia,
}: {
  rotulos: [string, string];
  renderVia: (rotulo: string, indice: 0 | 1) => ReactNode;
}) {
  return (
    <div
      className="bg-white text-black"
      style={{ width: '210mm', height: '297mm', boxSizing: 'border-box', overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <div style={{ height: '148.5mm', boxSizing: 'border-box', overflow: 'hidden' }}>{renderVia(rotulos[0], 0)}</div>
      <div style={{ borderTop: '0.5pt dashed #000', height: 0 }} />
      <div style={{ height: '148.5mm', boxSizing: 'border-box', overflow: 'hidden' }}>{renderVia(rotulos[1], 1)}</div>
    </div>
  );
}
