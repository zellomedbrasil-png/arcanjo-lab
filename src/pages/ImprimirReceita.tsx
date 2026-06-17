import { useNavigate } from 'react-router-dom';
import { useReceitaStore } from '../store/useReceitaStore';
import { Printer, ArrowLeft } from 'lucide-react';
import ReceitaBranca from '../components/print/templates/ReceitaBranca';
import ReceitaControleEspecial from '../components/print/templates/ReceitaControleEspecial';

export default function ImprimirReceita() {
  const navigate = useNavigate();
  const { medicamentos, pacienteNome, modoEntrada, textoLivre, prescricaoManual, tipoReceita } = useReceitaStore();

  const isManual = modoEntrada === 'MANUAL' && prescricaoManual.trim() !== '';
  const isTextoLivre = modoEntrada === 'TEXTO_LIVRE' && textoLivre.trim() !== '';

  const medsValidos = medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado);
  const medsSimples = medsValidos.filter((m) => m.tipoRecomendado !== 'ESPECIAL');
  const medsEspeciais = medsValidos.filter((m) => m.tipoRecomendado === 'ESPECIAL');

  const temAmbos = !isTextoLivre && !isManual && medsSimples.length > 0 && medsEspeciais.length > 0;
  const apenasEspecial = (isTextoLivre || isManual)
    ? tipoReceita === 'ESPECIAL'
    : medsEspeciais.length > 0 && medsSimples.length === 0;

  const descTipo = temAmbos
    ? '📋 Receitas Divididas (Simples + Especial)'
    : apenasEspecial
    ? '⚠️ Receita Controle Especial (2 Vias)'
    : '📋 Receita Branca Simples';

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
          <span className="text-sm text-gray-500 font-semibold">
            {descTipo}
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
      <div className="flex flex-col gap-8 print:gap-0 max-w-[210mm] mx-auto print:w-[210mm] print:m-0">
        {(isManual || isTextoLivre) ? (
          <div
            className="bg-white shadow-xl print:shadow-none overflow-hidden relative"
            style={{ width: '210mm', height: '297mm' }}
          >
            {tipoReceita === 'ESPECIAL'
              ? <ReceitaControleEspecial textoLivre={isManual ? prescricaoManual : textoLivre} />
              : <ReceitaBranca textoLivre={isManual ? prescricaoManual : textoLivre} />}
          </div>
        ) : temAmbos ? (
          <>
            {/* Receita Simples */}
            <div 
              className="bg-white shadow-xl print:shadow-none overflow-hidden relative"
              style={{ width: '210mm', height: '297mm', breakAfter: 'page', pageBreakAfter: 'always' }}
            >
              <ReceitaBranca medicamentosOverride={medsSimples} />
            </div>

            {/* Divisor Visual na Tela */}
            <div className="no-print h-8 bg-gray-300 flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-wider rounded-lg shadow-inner">
              ✂️ Fim da Receita Simples · Próxima página: Receita Controle Especial C344
            </div>

            {/* Receita Especial */}
            <div 
              className="bg-white shadow-xl print:shadow-none overflow-hidden relative"
              style={{ width: '210mm', height: '297mm' }}
            >
              <ReceitaControleEspecial medicamentosOverride={medsEspeciais} />
            </div>
          </>
        ) : apenasEspecial ? (
          <div 
            className="bg-white shadow-xl print:shadow-none overflow-hidden relative"
            style={{ width: '210mm', height: '297mm' }}
          >
            <ReceitaControleEspecial medicamentosOverride={medsEspeciais} />
          </div>
        ) : (
          <div 
            className="bg-white shadow-xl print:shadow-none overflow-hidden relative"
            style={{ width: '210mm', height: '297mm' }}
          >
            <ReceitaBranca medicamentosOverride={medsSimples} />
          </div>
        )}
      </div>

      {/* Dica de impressão */}
      <div className="max-w-4xl mx-auto no-print mt-4 text-center text-xs text-gray-500">
        {apenasEspecial || temAmbos
          ? '⚠️ Imprima em papel branco padrão A4. O controle especial será dividido em 2 vias para recorte.'
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
