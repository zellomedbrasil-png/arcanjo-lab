import { useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, AlertTriangle, FileWarning } from 'lucide-react';
import DocumentoReceitaView from '../components/print/templates/DocumentoReceitaView';
import { useDocumentosReceita } from '../hooks/useDocumentosReceita';
import { nomeDocumento } from '../utils/agruparReceita';
import { REGRAS_MODELO } from '../data/regrasReceita';
import { useReceitaStore } from '../store/useReceitaStore';
import { useAtalhosReceitaStore } from '../store/useAtalhosReceitaStore';

export default function ImprimirReceita() {
  const navigate = useNavigate();
  const { documentos, pendencias, bloqueios } = useDocumentosReceita();
  const guias = documentos.filter((d) => !REGRAS_MODELO[d.modelo].imprimeReceita);
  const avisos = pendencias.filter((p) => p.nivel === 'aviso');
  const modoEmissao = useReceitaStore((s) => s.modoEmissao);
  const setModoEmissao = useReceitaStore((s) => s.setModoEmissao);

  // Guarda a receita no histórico do paciente ("Repetir última receita") e imprime.
  const imprimir = () => {
    const s = useReceitaStore.getState();
    if (s.modoEntrada === 'ESTRUTURADO') {
      useAtalhosReceitaStore.getState().registrarReceita(
        { nome: s.pacienteNome, cpf: s.pacienteCpf, data: s.data },
        s.medicamentos
      );
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white p-4 print:p-0">
      {/* Barra — oculta na impressão */}
      <div className="max-w-4xl mx-auto no-print mb-6 bg-white p-4 rounded-lg shadow-sm space-y-3">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/receita')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para edição
          </button>
          <button
            onClick={imprimir}
            disabled={bloqueios.length > 0}
            className={`flex items-center px-6 py-2 font-medium rounded-lg transition-colors ${
              bloqueios.length > 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir {documentos.length} {documentos.length === 1 ? 'folha' : 'folhas'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Assinatura</span>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            {([
              ['FISICO', 'À caneta (impressa)'],
              ['DIGITAL', 'Digital ICP-Brasil (PDF)'],
            ] as const).map(([modo, rotulo]) => (
              <button
                key={modo}
                type="button"
                onClick={() => setModoEmissao(modo)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  modoEmissao === modo ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
        {modoEmissao === 'DIGITAL' && (
          <p className="text-xs text-indigo-900 bg-indigo-50 border border-indigo-100 rounded-lg p-2.5">
            Salve como PDF ("Imprimir" → "Salvar como PDF") e assine com seu certificado ICP-Brasil (VIDaaS, BirdID ou
            assinador.iti.gov.br), posicionando o selo no quadro tracejado. Receita de controle especial e de antimicrobiano
            em PDF só valem com assinatura ICP-Brasil qualificada; sem ela, a farmácia recusa.
            {guias.length > 0 && ' Notificações de receita (A, B, C2, C3) continuam só no talonário de papel.'}
          </p>
        )}

        <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-0.5">
          {documentos.map((d) => (
            <li key={d.chave}>{nomeDocumento(d)}</li>
          ))}
        </ol>

        {bloqueios.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
            <p className="font-bold flex items-center gap-1.5 mb-1"><AlertTriangle size={15} /> A farmácia vai devolver — corrija antes de imprimir:</p>
            <ul className="list-disc pl-5 space-y-0.5">{bloqueios.map((p) => <li key={p.texto}>{p.texto}</li>)}</ul>
          </div>
        )}
        {guias.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm p-3 rounded-lg flex gap-2">
            <FileWarning size={16} className="shrink-0 mt-0.5" />
            <span>
              {guias.length} {guias.length === 1 ? 'item exige' : 'itens exigem'} notificação em talonário numerado. As folhas marcadas
              "NÃO É RECEITA" são só para você transcrever no talonário.
            </span>
          </div>
        )}
        {avisos.length > 0 && (
          <ul className="text-xs text-gray-600 list-disc pl-5 space-y-0.5">{avisos.map((p) => <li key={p.texto}>{p.texto}</li>)}</ul>
        )}
        <p className="text-xs text-gray-500">Papel A4, sem margens, escala 100%. As receitas de 2 vias saem numa folha só: corte na linha tracejada.</p>
      </div>

      {/* Folhas A4 */}
      <div className="flex flex-col gap-8 print:gap-0 max-w-[210mm] mx-auto print:w-[210mm] print:m-0">
        {bloqueios.length === 0 &&
          documentos.map((doc, i) => (
            <div
              key={doc.chave}
              className="bg-white shadow-xl print:shadow-none overflow-hidden relative"
              style={{
                width: '210mm',
                height: '297mm',
                ...(i < documentos.length - 1 ? { breakAfter: 'page' as const, pageBreakAfter: 'always' as const } : {}),
              }}
            >
              <DocumentoReceitaView doc={doc} />
            </div>
          ))}
      </div>
    </div>
  );
}
