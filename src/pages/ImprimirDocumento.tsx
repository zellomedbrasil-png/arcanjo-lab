import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/useDocumentStore';
import { Printer, ArrowLeft } from 'lucide-react';
import DocumentoTemplate from '../components/print/templates/DocumentoTemplate';

export default function ImprimirDocumento() {
  const navigate = useNavigate();
  const { tipoDocumento, pacienteNome } = useDocumentStore();

  const getDocLabel = () => {
    switch (tipoDocumento) {
      case 'LAUDO': return '📄 Laudo Médico';
      case 'ATESTADO': return '📋 Atestado Médico';
      case 'COMPARECIMENTO': return '🕒 Atestado de Comparecimento';
      case 'APTIDAO': return '💪 Atestado de Aptidão Física';
      case 'ASO': return '🛡️ ASO - Saúde Ocupacional';
      default: return '📄 Documento Médico';
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white p-4 print:p-0">
      {/* Toolbar — oculta na impressão */}
      <div className="max-w-4xl mx-auto no-print mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={() => navigate('/documentos')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar para Edição
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-semibold">
            {getDocLabel()}
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir Agora
          </button>
        </div>
      </div>

      {/* Container A4 */}
      <div className="max-w-[21cm] mx-auto bg-white min-h-[29.7cm] shadow-xl print:shadow-none print:w-[21cm] print:m-0 overflow-hidden relative">
        <DocumentoTemplate />
      </div>

      {/* Dica de impressão */}
      <div className="max-w-4xl mx-auto no-print mt-4 text-center text-xs text-gray-500">
        💡 Configure a impressora para papel A4, sem margens.
      </div>

      {!pacienteNome && (
        <div className="no-print max-w-4xl mx-auto mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-lg text-center">
          ⚠️ Nenhum dado de paciente encontrado. <button className="underline font-medium" onClick={() => navigate('/documentos')}>Voltar aos documentos</button>
        </div>
      )}
    </div>
  );
}
