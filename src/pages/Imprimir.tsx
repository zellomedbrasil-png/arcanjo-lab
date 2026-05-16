import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Printer, ArrowLeft } from 'lucide-react';

import GuiaIPM from '../components/print/templates/GuiaIPM';
import GuiaISSEC from '../components/print/templates/GuiaISSEC';
import GuiaParticular from '../components/print/templates/GuiaParticular';

export default function Imprimir() {
  const navigate = useNavigate();
  const { pacienteNome, convenio } = useAppStore();

  // Se recarregar a página e não tiver dados, volta
  useEffect(() => {
    if (!pacienteNome) {
      navigate('/novo');
    }
  }, [pacienteNome, navigate]);

  if (!pacienteNome) return null;

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white p-4 print:p-0">
      <div className="max-w-4xl mx-auto no-print mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar para Edição
        </button>
        
        <button
          onClick={() => window.print()}
          className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Printer className="mr-2 h-5 w-5" />
          Imprimir Agora
        </button>
      </div>

      {/* A4 Container */}
      <div className="max-w-[21cm] mx-auto bg-white min-h-[29.7cm] shadow-xl print:shadow-none print:w-[21cm] print:h-[29.7cm] print:m-0 overflow-hidden relative font-sans text-black">
        {convenio === 'IPM' ? <GuiaIPM /> : convenio === 'ISSEC' ? <GuiaISSEC /> : <GuiaParticular />}
      </div>
    </div>
  );
}
