import { useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useManipuladosStore, viasNecessarias } from '../store/useManipuladosStore';
import ReceitaManipulado from '../components/print/templates/ReceitaManipulado';

export default function ImprimirManipulado() {
  const navigate = useNavigate();
  const pacienteNome = useManipuladosStore((s) => s.pacienteNome);
  const formulas = useManipuladosStore((s) => s.formulas);

  const vias = viasNecessarias(formulas);

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white p-4 print:p-0">
      {/* Toolbar — oculta na impressão */}
      <div className="max-w-4xl mx-auto no-print mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={() => navigate('/manipulados')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar para Edição
        </button>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
            {vias === 2 && <ShieldAlert size={15} className="text-amber-600" />}
            {vias === 2 ? 'Receita de Manipulação — 2 vias' : 'Receita de Manipulação'}
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir Agora
          </button>
        </div>
      </div>

      {/* Container A4 */}
      <div
        className="mx-auto bg-white shadow-xl print:shadow-none overflow-hidden relative"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <ReceitaManipulado vias={vias} />
      </div>

      <div className="max-w-4xl mx-auto no-print mt-4 text-center text-xs text-gray-500">
        {vias === 2
          ? 'Imprima em papel branco A4. A receita sai em 2 vias para recorte — a 1ª via fica retida na farmácia.'
          : 'Configure a impressora para papel A4, sem margens.'}
      </div>

      {!pacienteNome && (
        <div className="no-print max-w-4xl mx-auto mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-lg text-center">
          Nenhum dado de paciente encontrado.{' '}
          <button
            className="underline font-medium"
            onClick={() => navigate('/manipulados')}
          >
            Voltar aos manipulados
          </button>
        </div>
      )}
    </div>
  );
}
