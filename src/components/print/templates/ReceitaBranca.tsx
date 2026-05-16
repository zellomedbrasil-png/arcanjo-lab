import { useReceitaStore } from '../../../store/useReceitaStore';

const MEDICO = {
  nome: 'Dr. Roberto Arcanjo',
  especialidade: 'Geriatra / Gastroenterologista',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  cidade: 'Fortaleza/Ceará',
  fone: '(85) _____-_____',
};

export default function ReceitaBranca() {
  const { pacienteNome, pacienteCpf, medicamentos, local, data } = useReceitaStore();
  const dataFormatada = data || new Date().toLocaleDateString('pt-BR');

  return (
    <div className="p-10 text-black bg-white font-sans text-[11px] leading-relaxed relative min-h-[29.7cm]">
      {/* === CABEÇALHO === */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[16px] font-bold uppercase tracking-wide text-gray-900">
              {MEDICO.nome}
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">{MEDICO.especialidade}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{MEDICO.crm}</p>
            <p className="text-[10px] text-gray-500">{MEDICO.endereco} — {MEDICO.cidade}</p>
            <p className="text-[10px] text-gray-500">Tel.: {MEDICO.fone}</p>
          </div>
          <div className="text-right">
            <p
              className="font-black uppercase text-gray-800 border border-gray-300 px-4 py-2 rounded"
              style={{ fontSize: '17px', letterSpacing: '0.08em' }}
            >
              Receita Médica
            </p>
          </div>
        </div>
      </div>

      {/* === PACIENTE === */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex gap-8">
          <div className="flex-[3]">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wide">Paciente</span>
            <p className="text-[13px] font-semibold text-gray-900 mt-0.5 border-b border-dotted border-gray-400 pb-0.5">
              {pacienteNome || '________________________________________________'}
            </p>
          </div>
          {pacienteCpf && (
            <div className="flex-1">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wide">CPF</span>
              <p className="text-[11px] font-medium text-gray-800 mt-0.5 border-b border-dotted border-gray-400 pb-0.5">
                {pacienteCpf}
              </p>
            </div>
          )}
          <div className="flex-1 text-right">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wide">Data</span>
            <p className="text-[11px] font-medium text-gray-800 mt-0.5">{dataFormatada}</p>
          </div>
        </div>
      </div>

      {/* === MEDICAMENTOS === */}
      <div className="mb-12 space-y-5">
        {medicamentos
          .filter((m) => m.principioAtivo || m.nomeDigitado)
          .map((med, idx) => (
            <div key={med.id} className="flex gap-3">
              <div className="font-bold text-[13px] text-gray-400 w-5 pt-0.5 shrink-0">
                {idx + 1}.
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-4 justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-gray-900 uppercase">
                      {med.principioAtivo || med.nomeDigitado}
                    </p>
                    {med.formaFarmaceutica && (
                      <p className="text-[10px] text-gray-500 italic">{med.formaFarmaceutica}</p>
                    )}
                    {med.uso && <p className="text-[10px] text-gray-500">{med.uso}</p>}
                  </div>
                  {med.quantidade && (
                    <p className="text-[10px] text-gray-600 shrink-0">
                      <span className="font-semibold">Qtd.:</span> {med.quantidade}
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-gray-800 mt-1">
                  <span className="font-semibold">Posologia:</span>{' '}
                  {med.posologia || '___________________________________________'}
                </p>
                {med.duracao && (
                  <p className="text-[10px] text-gray-600 mt-0.5">
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
          <div key={`blank-${i}`} className="border-b border-dotted border-gray-200 h-8" />
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
              <p className="text-[9px] text-gray-500">{MEDICO.crm} — {MEDICO.especialidade}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
