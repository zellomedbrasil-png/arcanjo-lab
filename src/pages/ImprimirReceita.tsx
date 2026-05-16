import { useNavigate } from 'react-router-dom';
import { useReceitaStore } from '../store/useReceitaStore';
import { Printer, ArrowLeft } from 'lucide-react';
import ReceitaBranca from '../components/print/templates/ReceitaBranca';
import ReceitaControleEspecial from '../components/print/templates/ReceitaControleEspecial';

export default function ImprimirReceita() {
  const navigate = useNavigate();
  const { tipoReceita, pacienteNome } = useReceitaStore();

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white p-4 print:p-0">
      {/* Toolbar — oculta na impressão */}
      <div className="max-w-4xl mx-auto no-print mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={() => navigate('/receita')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar para Edição
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {tipoReceita === 'SIMPLES' ? '📋 Receita Branca Simples' : '⚠️ Receita Controle Especial (2 Vias)'}
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir Agora
          </button>
        </div>
      </div>

      {/* Container A4 */}
      <div className="max-w-[21cm] mx-auto bg-white min-h-[29.7cm] shadow-xl print:shadow-none print:w-[21cm] print:m-0 overflow-hidden relative">
        {tipoReceita === 'SIMPLES' ? <ReceitaBranca /> : <ReceitaControleEspecial />}
      </div>

      {/* Dica de impressão */}
      <div className="max-w-4xl mx-auto no-print mt-4 text-center text-xs text-gray-500">
        {tipoReceita === 'ESPECIAL'
          ? '⚠️ Imprima em papel branco padrão A4. A receita será dividida em 2 vias para recorte.'
          : '💡 Configure a impressora para papel A4, sem margens.'}
      </div>

      {!pacienteNome && (
        <div className="no-print max-w-4xl mx-auto mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-lg text-center">
          ⚠️ Nenhum dado de paciente encontrado. <button className="underline font-medium" onClick={() => navigate('/receita')}>Voltar à receita</button>
        </div>
      )}
    </div>
  );
}
