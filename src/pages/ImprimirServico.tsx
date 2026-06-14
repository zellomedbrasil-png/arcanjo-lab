import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Printer, ArrowLeft } from 'lucide-react';
import GuiaIPM from '../components/print/templates/GuiaIPM';
import GuiaServicoISSEC from '../components/print/templates/GuiaServicoISSEC';
import { getServicoNome } from '../data/servicos';

export default function ImprimirServico() {
  const navigate = useNavigate();
  const { pacienteNome, convenio, servicosSelecionados, justificativaServicos } = useAppStore();

  useEffect(() => {
    if (!pacienteNome) navigate('/servicos');
  }, [pacienteNome, navigate]);

  if (!pacienteNome) return null;

  const terapias = servicosSelecionados.map(getServicoNome);

  // ISSEC usa a nova Guia de Serviço II. Demais (IPM e afins) usam a Guia IPM já utilizada,
  // que já contempla TERAPIA como serviço assistencial.
  const guia =
    convenio === 'ISSEC'
      ? <GuiaServicoISSEC />
      : <GuiaIPM itemsOverride={terapias} justificativaOverride={justificativaServicos} />;

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white p-4 print:p-0">
      <div className="max-w-4xl mx-auto no-print mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900">
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

      <div className="max-w-[21cm] mx-auto bg-white min-h-[29.7cm] shadow-xl print:shadow-none print:w-[21cm] print:h-[29.7cm] print:m-0 overflow-hidden relative font-sans text-black">
        {guia}
      </div>
    </div>
  );
}
