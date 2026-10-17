/** "1ª via — Retenção da farmácia" no canto da via: negrito forte e moldura, para sair nítido em qualquer impressora. */
export default function SeloVia({ rotulo }: { rotulo: string }) {
  return (
    <div
      style={{
        fontSize: '11px',
        fontWeight: 800,
        textTransform: 'uppercase',
        border: '1px solid #000',
        padding: '1px 5px',
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      {rotulo}
    </div>
  );
}
