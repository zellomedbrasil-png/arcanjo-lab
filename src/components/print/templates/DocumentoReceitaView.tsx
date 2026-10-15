import type { DocumentoReceita } from '../../../utils/agruparReceita';
import ReceitaBranca from './ReceitaBranca';
import ReceitaRetencao from './ReceitaRetencao';
import ReceitaControleEspecial from './ReceitaControleEspecial';
import GuiaTranscricaoNotificacao from './GuiaTranscricaoNotificacao';

/** Desenha uma folha A4 do documento — mesmo componente na prévia e na impressão. */
export default function DocumentoReceitaView({ doc }: { doc: DocumentoReceita }) {
  switch (doc.modelo) {
    case 'SIMPLES':
      return doc.textoLivre !== undefined
        ? <ReceitaBranca textoLivre={doc.textoLivre} />
        : <ReceitaBranca medicamentosOverride={doc.medicamentos} />;
    case 'RETENCAO':
      return <ReceitaRetencao medicamentos={doc.medicamentos} textoLivre={doc.textoLivre} soGlp1={doc.soGlp1} />;
    case 'RCE':
      return <ReceitaControleEspecial medicamentos={doc.medicamentos} textoLivre={doc.textoLivre} />;
    default:
      return <GuiaTranscricaoNotificacao med={doc.medicamentos[0]} info={doc.infos[0]} />;
  }
}
