import { useDocumentStore } from '../../../store/useDocumentStore';
import { useAppStore } from '../../../store/useAppStore';

const MEDICO_FALLBACK = {
  nome: 'Dr. Roberto Arcanjo',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  cidade: 'Fortaleza/Ceará',
};

export default function DocumentoTemplate() {
  const medico = useAppStore(state => state.medico);
  const doc = useDocumentStore();

  const medicoNome = medico?.nome || MEDICO_FALLBACK.nome;
  const medicoCrm = medico?.crm || MEDICO_FALLBACK.crm;
  const medicoEndereco = MEDICO_FALLBACK.endereco;
  const medicoCidade = MEDICO_FALLBACK.cidade;

  const dataFormatada = doc.data || new Date().toLocaleDateString('pt-BR');

  // Helper to calculate age if birthdate is available
  const getIdade = () => {
    if (!doc.pacienteDataNascimento) return '';
    try {
      const birth = new Date(doc.pacienteDataNascimento);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} anos`;
    } catch {
      return '';
    }
  };
  const idade = getIdade();

  return (
    <div className="p-10 text-black bg-white font-sans text-[11px] leading-relaxed relative min-h-[29.7cm] flex flex-col justify-between">
      {/* === CABEÇALHO / TIMBRE === */}
      <div>
        <div className="border-b-2 border-gray-900 pb-3 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[14px] font-bold uppercase tracking-wider text-gray-900">
                {medicoNome}
              </p>
              <p className="text-[9px] text-gray-600 mt-0.5">{medicoCrm}</p>
              <p className="text-[9px] text-gray-600">{medicoEndereco} — {medicoCidade}</p>
            </div>
            <div className="text-right">
              <p
                className="font-black uppercase text-gray-900 border-2 border-gray-900 px-3 py-1.5"
                style={{ fontSize: '13px', letterSpacing: '0.05em' }}
              >
                {doc.tipoDocumento === 'LAUDO' && 'Laudo Médico'}
                {doc.tipoDocumento === 'ATESTADO' && 'Atestado Médico'}
                {doc.tipoDocumento === 'COMPARECIMENTO' && 'Atestado de Comparecimento'}
                {doc.tipoDocumento === 'APTIDAO' && 'Atestado de Aptidão Física'}
                {doc.tipoDocumento === 'ASO' && 'ASO - Saúde Ocupacional'}
              </p>
            </div>
          </div>
        </div>

        {/* === TEMPLATE RENDERING === */}

        {/* 1. LAUDO MÉDICO */}
        {doc.tipoDocumento === 'LAUDO' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-3">
              <div className="col-span-2">
                <span className="text-[8px] font-bold uppercase text-gray-500 block">Paciente</span>
                <span className="text-[11px] font-bold uppercase">{doc.pacienteNome || '________________________________________'}</span>
              </div>
              {doc.pacienteCpf && (
                <div>
                  <span className="text-[8px] font-bold uppercase text-gray-500 block">CPF</span>
                  <span className="text-[10px] font-semibold">{doc.pacienteCpf}</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase text-gray-700 tracking-wider mb-1">Diagnóstico / Hipótese Diagnóstica</h2>
              <p className="text-[11px] bg-gray-50 p-2.5 rounded border border-gray-200 font-semibold uppercase">
                {doc.laudoDiagnostico || 'Não informado'}
                {doc.laudoCid && ` (CID-10: ${doc.laudoCid.toUpperCase()})`}
              </p>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase text-gray-700 tracking-wider mb-1">Histórico Clínico e Evolução</h2>
              <p className="text-[10px] text-justify whitespace-pre-wrap leading-relaxed border border-gray-200 p-3 rounded min-h-[120px]">
                {doc.laudoHistorico || 'Nenhum histórico clínico descrito.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-[10px] font-bold uppercase text-gray-700 tracking-wider mb-1">Conduta Terapêutica / Recomendações</h2>
                <p className="text-[10px] text-justify whitespace-pre-wrap leading-relaxed border border-gray-200 p-3 rounded min-h-[80px]">
                  {doc.laudoConduta || 'Não informado'}
                </p>
              </div>
              <div>
                <h2 className="text-[10px] font-bold uppercase text-gray-700 tracking-wider mb-1">Prognóstico Clínico</h2>
                <p className="text-[10px] text-justify whitespace-pre-wrap leading-relaxed border border-gray-200 p-3 rounded min-h-[80px]">
                  {doc.laudoPrognostico || 'Favorável mediante adesão ao tratamento indicado.'}
                </p>
              </div>
            </div>

            {doc.laudoFinalidade && (
              <div className="pt-2">
                <span className="text-[8px] font-bold uppercase text-gray-500 block">Finalidade deste Laudo</span>
                <span className="text-[10px] italic text-gray-700">{doc.laudoFinalidade}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. ATESTADO MÉDICO GERAL */}
        {doc.tipoDocumento === 'ATESTADO' && (
          <div className="space-y-6 py-4">
            <div className="text-justify text-[12px] leading-loose space-y-4">
              <p>
                Atesto para os devidos fins de direito que o(a) Sr(a).{' '}
                <strong className="uppercase text-[13px]">{doc.pacienteNome || '________________________________________'}</strong>
                {doc.pacienteCpf && ` (CPF nº ${doc.pacienteCpf})`} esteve sob meus cuidados médicos na presente data.
              </p>

              <p>
                Necessita o(a) referido(a) paciente de um período de repouso de{' '}
                <strong className="text-[13px] bg-gray-100 px-2 py-0.5 rounded">{doc.atestadoDias || '____'} dia(s)</strong>,{' '}
                a contar desta data, para fins de recuperação de sua saúde.
              </p>

              {doc.atestadoMotivo && (
                <p>
                  <span className="text-gray-500 font-medium">Observação clínica:</span> {doc.atestadoMotivo}.
                </p>
              )}

              {doc.atestadoDeclararCid && doc.atestadoCid ? (
                <p className="bg-amber-50 border border-amber-200 p-3 rounded text-[10px] text-amber-900">
                  ⚠️ <strong>Declaração de CID-10:</strong> A codificação do diagnóstico{' '}
                  <strong>{doc.atestadoCid.toUpperCase()}</strong> foi incluída sob consentimento
                  expresso e formalizado do paciente, em conformidade com as normas do CFM.
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 italic">
                  * CID-10 não declarado de acordo com o direito de privacidade do paciente, salvo autorização expressa.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. ATESTADO DE COMPARECIMENTO */}
        {doc.tipoDocumento === 'COMPARECIMENTO' && (
          <div className="space-y-6 py-4">
            <div className="text-justify text-[12px] leading-loose space-y-4">
              <p>
                Declaro para os devidos fins de comprovação de comparecimento que{' '}
                {doc.comparecimentoAcompanhanteNome ? (
                  <>
                    o(a) Sr(a). <strong className="uppercase text-[13px]">{doc.comparecimentoAcompanhanteNome}</strong> acompanhou{' '}
                    o(a) paciente <strong className="uppercase text-[13px]">{doc.pacienteNome || '____________________'}</strong>
                  </>
                ) : (
                  <>
                    o(a) paciente <strong className="uppercase text-[13px]">{doc.pacienteNome || '____________________'}</strong>
                  </>
                )}
                {doc.pacienteCpf && ` (CPF nº ${doc.pacienteCpf})`}, compareceu a uma consulta médica na presente data, no período{' '}
                <strong className="text-[13px] bg-gray-100 px-2 py-0.5 rounded">{doc.comparecimentoPeriodo || 'das ___:___ às ___:___'}</strong>.
              </p>

              <p>
                O presente atestado destina-se unicamente a comprovar a presença na consulta/procedimento médico, não implicando incapacidade laborativa ou necessidade de afastamento de suas atividades.
              </p>
            </div>
          </div>
        )}

        {/* 4. ATESTADO DE APTIDÃO FÍSICA */}
        {doc.tipoDocumento === 'APTIDAO' && (
          <div className="space-y-6 py-4">
            <div className="text-justify text-[12px] leading-loose space-y-4">
              <p>
                Atesto que o(a) Sr(a).{' '}
                <strong className="uppercase text-[13px]">{doc.pacienteNome || '________________________________________'}</strong>
                {doc.pacienteCpf && ` (CPF nº ${doc.pacienteCpf})`}, foi submetido(a) a exame clínico rigoroso nesta data, apresentando-se em perfeitas condições de saúde física e mental.
              </p>

              <p>
                Declaro que, sob o ponto de vista cardiovascular, pulmonar e locomotor, o(a) examinado(a) encontra-se{' '}
                <strong className="text-[13px] text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded">APTO(A)</strong> para a{' '}
                <strong>{doc.aptidaoFinalidade || 'prática de exercícios físicos'}</strong>.
              </p>

              {doc.aptidaoRestricoes && (
                <p className="border-l-4 border-amber-500 bg-amber-50/50 p-3 text-[10px] leading-normal text-gray-700">
                  <span className="font-bold text-amber-800">Restrições / Observações:</span><br/>
                  {doc.aptidaoRestricoes}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. ASO (ATESTADO DE SAÚDE OCUPACIONAL) */}
        {doc.tipoDocumento === 'ASO' && (
          <div className="space-y-3.5 text-[10px]">
            {/* Bloco Empresa */}
            <div className="border border-black p-2 grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold block text-[8px] uppercase text-gray-500">Nome da Empresa / Empregador</span>
                <span className="font-semibold uppercase">{doc.asoEmpresa || '___________________________'}</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase text-gray-500">CNPJ</span>
                <span className="font-mono">{doc.asoCnpj || '___________________________'}</span>
              </div>
            </div>

            {/* Bloco Trabalhador */}
            <div className="border border-black p-2 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <span className="font-bold block text-[8px] uppercase text-gray-500">Nome do Trabalhador</span>
                <span className="font-semibold uppercase text-[11px]">{doc.pacienteNome || '___________________________'}</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase text-gray-500">CPF / Data Nasc.</span>
                <span>{doc.pacienteCpf || '___________'} {idade && ` — ${idade}`}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold block text-[8px] uppercase text-gray-500">Função do Trabalhador</span>
                <span className="font-semibold uppercase">{doc.asoFuncao || '___________________________'}</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase text-gray-500">Tipo de ASO</span>
                <span className="font-bold text-blue-700">{doc.asoTipo}</span>
              </div>
            </div>

            {/* Bloco Riscos Ocupacionais */}
            <div className="border border-black p-2">
              <span className="font-bold block text-[8px] uppercase text-gray-500 mb-1.5">Riscos Ocupacionais Específicos da Função</span>
              <div className="grid grid-cols-3 gap-2">
                {['FÍSICO', 'QUÍMICO', 'BIOLÓGICO', 'ERGONÔMICO', 'ACIDENTE', 'AUSÊNCIA DE RISCO'].map((risco) => {
                  const isChecked = doc.asoRiscos.includes(risco);
                  return (
                    <label key={risco} className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center font-bold text-[9px] ${isChecked ? 'bg-black text-white' : 'bg-white'}`}>
                        {isChecked ? 'X' : ''}
                      </span>
                      <span className="font-semibold text-[9px]">{risco}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bloco Exames */}
            <div className="border border-black p-2">
              <span className="font-bold block text-[8px] uppercase text-gray-500 mb-1">Exames Complementares Realizados e Datas</span>
              <p className="font-semibold whitespace-pre-wrap">{doc.asoExamesRealizados || 'Nenhum exame complementar indicado para a função.'}</p>
            </div>

            {/* Bloco Conclusão */}
            <div className="border border-black p-3 bg-gray-50 flex items-center justify-between">
              <div>
                <span className="font-bold block text-[8px] uppercase text-gray-500">Conclusão Médica</span>
                <span className="text-[12px] font-bold">O TRABALHADOR ESTÁ DECLARADO:</span>
              </div>
              <div className="flex gap-4">
                <span className={`px-4 py-2 border-2 text-[12px] font-black rounded ${doc.asoResultado === 'APTO' ? 'bg-green-100 border-green-600 text-green-700' : 'bg-gray-100 border-gray-400 text-gray-400'}`}>
                  APTO
                </span>
                <span className={`px-4 py-2 border-2 text-[12px] font-black rounded ${doc.asoResultado === 'INAPTO' ? 'bg-red-100 border-red-600 text-red-700' : 'bg-gray-100 border-gray-400 text-gray-400'}`}>
                  INAPTO
                </span>
              </div>
            </div>

            <p className="text-[8px] text-gray-500 leading-normal text-justify">
              O Atestado de Saúde Ocupacional (ASO) é emitido em conformidade com as diretrizes da NR-7 da Portaria 3.214/78 do MTE. O trabalhador foi informado sobre o resultado dos exames e sua aptidão funcional.
            </p>
          </div>
        )}
      </div>

      {/* === ASSINATURA E DATAS === */}
      <div className="mt-8 border-t border-gray-200 pt-5">
        <div className="flex justify-between items-end">
          <div className="text-[9px] text-gray-500">
            <p className="font-semibold text-gray-700">{doc.local || 'Fortaleza-CE'}, {dataFormatada}</p>
            <p className="mt-0.5">Assinatura digitalizada ou carimbo físico obrigatórios.</p>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1.5 w-56">
              <p className="text-[11px] font-bold text-gray-900">{medicoNome}</p>
              <p className="text-[9px] text-gray-500">{medicoCrm}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
