import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useReceitaStore } from '../store/useReceitaStore';
import { usePrescritorStore } from '../config/prescritor';
import { agruparEmDocumentos, documentoTextoLivre, type DocumentoReceita } from '../utils/agruparReceita';
import { validarReceita, type Pendencia } from '../utils/validarReceita';

/**
 * Documentos que a receita atual vai gerar + pendências que fazem a farmácia
 * devolver. Prévia e impressão leem daqui, então mostram sempre o mesmo papel.
 */
export function useDocumentosReceita(): {
  documentos: DocumentoReceita[];
  pendencias: Pendencia[];
  bloqueios: Pendencia[];
  modoTexto: boolean;
} {
  const s = useReceitaStore(
    useShallow((st) => ({
      medicamentos: st.medicamentos,
      modoEntrada: st.modoEntrada,
      textoLivre: st.textoLivre,
      prescricaoManual: st.prescricaoManual,
      tipoReceita: st.tipoReceita,
      pacienteNome: st.pacienteNome,
      pacienteCpf: st.pacienteCpf,
      pacienteSemCpf: st.pacienteSemCpf,
      pacienteIdade: st.pacienteIdade,
      pacienteSexo: st.pacienteSexo,
      pacienteEndereco: st.pacienteEndereco,
    }))
  );
  const prescritor = usePrescritorStore((st) => st.prescritor);

  return useMemo(() => {
    const texto = s.modoEntrada === 'MANUAL' ? s.prescricaoManual : s.modoEntrada === 'TEXTO_LIVRE' ? s.textoLivre : '';
    const modoTexto = s.modoEntrada !== 'ESTRUTURADO';
    const documentos = modoTexto
      ? texto.trim()
        ? [documentoTextoLivre(texto, s.tipoReceita)]
        : []
      : agruparEmDocumentos(s.medicamentos);
    const pendencias = validarReceita(
      documentos,
      s,
      prescritor,
      modoTexto && texto.trim() ? { texto, tipo: s.tipoReceita } : undefined
    );
    if (documentos.length === 0) {
      pendencias.push({ nivel: 'bloqueio', texto: modoTexto ? 'Escreva a prescrição.' : 'Adicione pelo menos um medicamento.' });
    }
    return { documentos, pendencias, bloqueios: pendencias.filter((p) => p.nivel === 'bloqueio'), modoTexto };
  }, [s, prescritor]);
}
