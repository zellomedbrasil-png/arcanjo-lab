import { enderecoCompleto, registroConselho, usePrescritorStore } from '../../../config/prescritor';

/** Identificação do emitente: nome, conselho/UF, endereço completo e telefone. */
export default function BlocoEmitente({ titulo = 'Identificação do emitente' }: { titulo?: string }) {
  const p = usePrescritorStore((s) => s.prescritor);
  return (
    <div style={{ border: '1px solid #000', padding: '4px 7px', fontSize: '11px', lineHeight: 1.35 }}>
      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #000', marginBottom: '3px', paddingBottom: '2px' }}>
        {titulo}
      </div>
      <div style={{ fontWeight: 700, fontSize: '12.5px' }}>{p.nome}</div>
      <div>{registroConselho(p)}</div>
      <div>{enderecoCompleto(p) || '________________________________'}</div>
      <div>Telefone: {p.telefone || '______________'}</div>
    </div>
  );
}
