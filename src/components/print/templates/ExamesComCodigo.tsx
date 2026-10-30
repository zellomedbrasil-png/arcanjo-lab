export interface ExameImpresso {
  nome: string;
  /** Código no convênio; vazio quando o exame não está no catálogo ou não tem código. */
  codigo: string;
}

/** Exames em linha corrida, cada nome seguido do código em negrito. */
export default function ExamesComCodigo({ itens }: { itens: ExameImpresso[] }) {
  return (
    <>
      {itens.map((item, i) => (
        <span key={i}>
          {i > 0 && ', '}
          {item.nome}
          {item.codigo && <b style={{ whiteSpace: 'nowrap' }}>{' '}{item.codigo}</b>}
        </span>
      ))}
    </>
  );
}
