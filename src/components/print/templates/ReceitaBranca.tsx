import { useReceitaStore } from '../../../store/useReceitaStore';

const MEDICO = {
  nome: 'Dr. Roberto Arcanjo',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  cidade: 'Fortaleza/Ceará',
};

export default function ReceitaBranca() {
  const { pacienteNome, pacienteCpf, medicamentos, local, data } = useReceitaStore();
  const dataFormatada = data || new Date().toLocaleDateString('pt-BR');

  return (
    <div className="p-10 text-black bg-white font-sans text-[11px] leading-relaxed relative min-h-[29.7cm]">
      {/* === CABEÇALHO === */}
      <div className="border-b-2 border-gray-900 pb-3 mb-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[15px] font-bold uppercase tracking-wider text-gray-900">
              {MEDICO.nome}
            </p>
            <p className="text-[9px] text-gray-600 mt-0.5">{MEDICO.crm}</p>
            <p className="text-[9px] text-gray-600">{MEDICO.endereco} — {MEDICO.cidade}</p>
          </div>
          <div className="text-right">
            <p
              className="font-black uppercase text-gray-900 border-2 border-gray-900 px-3 py-1.5"
              style={{ fontSize: '16px', letterSpacing: '0.1em' }}
            >
              Receita Médica
            </p>
          </div>
        </div>
      </div>

      {/* === PACIENTE === */}
      <div className="mb-5 pb-3 border-b border-gray-300">
        <div className="flex gap-6">
          <div className="flex-[3]">
            <span className="text-[8px] font-bold uppercase text-gray-600 tracking-wide">Paciente</span>
            <p className="text-[12px] font-semibold text-gray-900 mt-0.5 border-b border-dotted border-gray-500 pb-0.5">
              {pacienteNome || '________________________________________________'}
            </p>
          </div>
          {pacienteCpf && (
            <div className="flex-1">
              <span className="text-[8px] font-bold uppercase text-gray-600 tracking-wide">CPF</span>
              <p className="text-[10px] font-medium text-gray-800 mt-0.5 border-b border-dotted border-gray-500 pb-0.5">
                {pacienteCpf}
              </p>
            </div>
          )}
          <div className="flex-1 text-right">
            <span className="text-[8px] font-bold uppercase text-gray-600 tracking-wide">Data</span>
            <p className="text-[10px] font-medium text-gray-800 mt-0.5">{dataFormatada}</p>
          </div>
        </div>
      </div>

      {/* === MEDICAMENTOS === */}
      <div className="mb-10">
        {medicamentos
          .filter((m) => m.principioAtivo || m.nomeDigitado)
          .map((med, idx) => (
            <div key={med.id} className="mb-4 flex gap-2">
              <div className="font-bold text-[12px] text-gray-400 w-4 pt-0.5 shrink-0">
                {idx + 1}.
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 justify-between mb-0.5">
                  <div>
                    <p className="font-bold text-[12px] text-gray-900 uppercase">
                      {med.principioAtivo || med.nomeDigitado}
                    </p>
                    {med.formaFarmaceutica && (
                      <p className="text-[9px] text-gray-500 italic ml-0.5">{med.formaFarmaceutica}</p>
                    )}
                  </div>
                  {med.quantidade && (
                    <p className="text-[9px] text-gray-700 shrink-0 font-semibold">
                      Qtd.: {med.quantidade}
                    </p>
                  )}
                </div>
                {med.uso && <p className="text-[9px] text-gray-500 italic ml-0.5 mb-0.5">{med.uso}</p>}
                <p className="text-[10px] text-gray-800">
                  <span className="font-semibold">Posologia:</span>{' '}
                  {med.posologia || '___________________________________________'}
                </p>
                {med.duracao && (
                  <p className="text-[9px] text-gray-600 mt-0.5">
                    <span className="font-semibold">Duração:</span> {med.duracao}
                  </p>
                )}
              </div>
            </div>
          ))}

        {/* Linhas em branco */}
        {Array.from({
          length: Math.max(0, 5 - medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado).length),
        }).map((_, i) => (
          <div key={`blank-${i}`} className="mb-4 border-b border-dotted border-gray-300 h-6" />
        ))}
      </div>

      {/* === RODAPÉ / ASSINATURA === */}
      <div className="absolute bottom-10 left-10 right-10">
        <div className="flex justify-between items-end">
          <div className="text-[10px] text-gray-500">
            <p>{local || 'Fortaleza-CE'}, {dataFormatada}</p>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-800 pt-2 w-64">
              <p className="text-[11px] font-bold text-gray-900">{MEDICO.nome}</p>
              <p className="text-[9px] text-gray-500">{MEDICO.crm}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
