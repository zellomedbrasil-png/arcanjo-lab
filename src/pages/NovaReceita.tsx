import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useReceitaStore } from '../store/useReceitaStore';
import { gerarPosologia } from '../services/groqReceita';
import {
  Sparkles, Plus, Trash2, Printer, RotateCcw, FileText, AlertTriangle,
  ChevronDown, ChevronUp, User, Calendar, MapPin, Pill, Loader2,
  CheckCircle2, Eye, ShieldAlert, Info
} from 'lucide-react';

// ─── Card de medicamento ───────────────────────────────────────
function MedicamentoCard({
  id, index, tipoAtual,
}: { id: string; index: number; tipoAtual: string }) {
  const { medicamentos, updateMedicamento, removeMedicamento } = useReceitaStore();
  const med = medicamentos.find((m) => m.id === id)!;
  const [expandido, setExpandido] = useState(false);
  const [inputNome, setInputNome] = useState(med.nomeDigitado);

  const mismatch =
    med.tipoRecomendado !== '' &&
    med.tipoRecomendado !== tipoAtual;

  const handleNomeChange = (valor: string) => {
    setInputNome(valor);
    // Persiste imediatamente no store para o footer e botão de imprimir
    updateMedicamento(id, { nomeDigitado: valor });
  };

  const handleGerarIA = async () => {
    const nome = inputNome.trim();
    if (!nome) return;
    updateMedicamento(id, { nomeDigitado: nome, carregando: true, erro: '' });
    try {
      const resultado = await gerarPosologia(nome);
      updateMedicamento(id, { ...resultado, nomeDigitado: nome, carregando: false });
      setExpandido(true);
    } catch {
      updateMedicamento(id, {
        carregando: false,
        erro: 'Erro ao gerar posologia. Verifique a conexão ou preencha manualmente.',
      });
      setExpandido(true);
    }
  };

  // temConteudo: true se tem nome digitado OU dados da IA
  const temConteudo = !!(med.nomeDigitado.trim() || med.principioAtivo || med.posologia);


  const borderClass = mismatch
    ? 'border-red-300 bg-red-50'
    : temConteudo
    ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'
    : 'border-gray-200 bg-white';

  const fields = [
    { label: 'Princípio Ativo / Nome', key: 'principioAtivo', full: true, placeholder: 'ex: Omeprazol 20mg' },
    { label: 'Forma Farmacêutica', key: 'formaFarmaceutica', full: false, placeholder: 'ex: Cápsulas gastrorresistentes' },
    { label: 'Via de Uso', key: 'uso', full: false, placeholder: 'ex: Uso oral' },
    { label: 'Posologia', key: 'posologia', full: true, placeholder: 'ex: Tomar 1 cápsula em jejum, 30 min antes do café da manhã' },
    { label: 'Quantidade', key: 'quantidade', full: false, placeholder: 'ex: 30 cápsulas' },
    { label: 'Duração do Tratamento', key: 'duracao', full: false, placeholder: 'ex: 30 dias' },
  ];

  return (
    <div className={`rounded-2xl border transition-all ${borderClass}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          mismatch ? 'bg-red-500 text-white' : temConteudo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {mismatch ? <ShieldAlert size={16} /> : temConteudo ? <CheckCircle2 size={16} /> : index + 1}
        </div>

        <input
          type="text"
          value={inputNome}
          onChange={(e) => handleNomeChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGerarIA()}
          placeholder={`Medicamento ${index + 1} (ex: Clonazepam 2mg)`}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-800 placeholder-gray-400"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleGerarIA}
            disabled={med.carregando || !inputNome.trim()}
            title="Gerar posologia com IA + avaliar tipo de receita"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              med.carregando || !inputNome.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm hover:shadow-md'
            }`}
          >
            {med.carregando ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {med.carregando ? 'Analisando...' : 'IA'}
          </button>

          {temConteudo && (
            <button onClick={() => setExpandido(!expandido)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-all">
              {expandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}

          <button onClick={() => removeMedicamento(id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Alerta de mismatch */}
      {mismatch && med.tipoRecomendado && (
        <div className="mx-4 mb-3 flex items-start gap-2 text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg px-3 py-2.5">
          <ShieldAlert size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              ⚠️ Este medicamento requer <strong>Receita de Controle Especial</strong>
            </p>
            {med.motivoEspecial && (
              <p className="mt-0.5 text-red-600">{med.motivoEspecial}</p>
            )}
            <p className="mt-1 text-red-500">Você selecionou "Receita Branca Simples". Altere o tipo de receita.</p>
          </div>
        </div>
      )}

      {/* Alerta de erro */}
      {med.erro && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle size={13} />
          {med.erro}
        </div>
      )}

      {/* Badge tipo recomendado (sem mismatch) */}
      {med.tipoRecomendado && !mismatch && (
        <div className="mx-4 mb-2 flex items-center gap-1.5 text-[10px] text-green-700">
          <CheckCircle2 size={11} />
          <span>IA confirmou: <strong>{med.tipoRecomendado === 'SIMPLES' ? 'Receita Branca Simples ✓' : 'Receita Controle Especial ✓'}</strong></span>
        </div>
      )}

      {/* Campos expandidos */}
      {(expandido || med.erro) && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-blue-100 pt-4">
          {fields.map(({ label, key, full, placeholder }) => (
            <div key={key} className={full ? 'col-span-full' : ''}>
              <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1">{label}</label>
              <input
                type="text"
                value={(med as unknown as Record<string, string>)[key] || ''}
                onChange={(e) => updateMedicamento(id, { [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full text-sm bg-white border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-300 transition-all"
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview compacto */}
      {temConteudo && !expandido && !med.erro && (
        <div className="px-4 pb-4 pl-12 text-xs text-gray-600 border-t border-blue-100 pt-3">
          <p className="font-semibold text-gray-800">{med.principioAtivo}</p>
          {med.formaFarmaceutica && <p className="text-gray-500 italic">{med.formaFarmaceutica}</p>}
          {med.posologia && <p className="mt-0.5">{med.posologia}</p>}
          {(med.quantidade || med.duracao) && (
            <p className="mt-0.5 text-gray-500">{[med.quantidade, med.duracao].filter(Boolean).join(' · ')}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────
export default function NovaReceita() {
  const navigate = useNavigate();
  const {
    tipoReceita, pacienteNome, pacienteCpf, pacienteRg,
    pacienteEndereco, pacienteCep, pacienteCidade, pacienteUf, pacienteTelefone,
    local, data, medicamentos,
    setTipoReceita, setPacienteReceita, addMedicamento, resetReceita,
  } = useReceitaStore();

  const medsComConteudo = medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado);
  const temMedicamentos = medsComConteudo.length > 0;
  const podeImprimir = pacienteNome.trim() !== '' && temMedicamentos;

  // Auditoria: algum med requer ESPECIAL mas tipo está SIMPLES?
  const alertaMismatch = tipoReceita === 'SIMPLES' &&
    medicamentos.some((m) => m.tipoRecomendado === 'ESPECIAL');

  // Auditoria: algum med é SIMPLES mas tipo está ESPECIAL?
  const alertaSimples = tipoReceita === 'ESPECIAL' &&
    medicamentos.every((m) => m.tipoRecomendado === 'SIMPLES');

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-28">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receituário Médico</h1>
            <p className="mt-1 text-sm text-gray-500">
              Dr. Roberto Arcanjo · CRM/CE 26.155 · Digite o medicamento e clique em <strong>IA</strong>
            </p>
          </div>
          <button
            onClick={() => { if (confirm('Limpar todos os dados da receita?')) resetReceita(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
          >
            <RotateCcw size={13} />
            Limpar
          </button>
        </div>

        {/* Banner auditoria global */}
        {alertaMismatch && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-300 rounded-2xl px-5 py-4">
            <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">⚠️ Atenção: tipo de receita incorreto</p>
              <p className="text-xs text-red-600 mt-0.5">
                Um ou mais medicamentos exigem <strong>Receita de Controle Especial</strong> (Portaria SVS/MS 344/98),
                mas você selecionou "Receita Branca Simples". Altere o tipo abaixo.
              </p>
              <button
                onClick={() => setTipoReceita('ESPECIAL')}
                className="mt-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Mudar para Controle Especial
              </button>
            </div>
          </div>
        )}

        {alertaSimples && (
          <div className="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              A IA identificou que todos os medicamentos são de <strong>venda livre / Receita Branca Simples</strong>.
              Você pode usar o tipo "Receita Simples" para este caso.
            </p>
          </div>
        )}

        {/* Tipo de Receita */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tipo de Receita</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTipoReceita('SIMPLES')}
              className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                tipoReceita === 'SIMPLES' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {tipoReceita === 'SIMPLES' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              )}
              <div className={`p-2 rounded-lg ${tipoReceita === 'SIMPLES' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <FileText size={20} className={tipoReceita === 'SIMPLES' ? 'text-blue-600' : 'text-gray-500'} />
              </div>
              <div>
                <p className={`font-bold text-sm ${tipoReceita === 'SIMPLES' ? 'text-blue-700' : 'text-gray-700'}`}>Receita Branca Simples</p>
                <p className="text-xs text-gray-500 mt-0.5">Medicamentos comuns, não controlados · 1 via</p>
              </div>
            </button>

            <button
              onClick={() => setTipoReceita('ESPECIAL')}
              className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                tipoReceita === 'ESPECIAL' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {tipoReceita === 'ESPECIAL' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              )}
              <div className={`p-2 rounded-lg ${tipoReceita === 'ESPECIAL' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                <AlertTriangle size={20} className={tipoReceita === 'ESPECIAL' ? 'text-amber-600' : 'text-gray-500'} />
              </div>
              <div>
                <p className={`font-bold text-sm ${tipoReceita === 'ESPECIAL' ? 'text-amber-700' : 'text-gray-700'}`}>Receita Controle Especial</p>
                <p className="text-xs text-gray-500 mt-0.5">Psicotrópicos, benzodiazepínicos, opioides · 2 vias ANVISA</p>
              </div>
            </button>
          </div>

          {tipoReceita === 'ESPECIAL' && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>CPF, RG, endereço completo com CEP, cidade, UF e telefone do paciente são obrigatórios (ANVISA).</span>
            </div>
          )}
        </div>

        {/* Dados do Paciente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dados do Paciente</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nome Completo <span className="text-red-400">*</span></label>
              <input type="text" value={pacienteNome} onChange={(e) => setPacienteReceita({ pacienteNome: e.target.value })} placeholder="Nome completo do paciente" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                CPF {tipoReceita === 'ESPECIAL' && <span className="text-red-400">*</span>}
              </label>
              <input type="text" value={pacienteCpf} onChange={(e) => setPacienteReceita({ pacienteCpf: e.target.value })} placeholder="000.000.000-00" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                RG / Identidade {tipoReceita === 'ESPECIAL' && <span className="text-red-400">*</span>}
              </label>
              <input type="text" value={pacienteRg} onChange={(e) => setPacienteReceita({ pacienteRg: e.target.value })} placeholder="0000000" className={inputCls} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Endereço (Rua, Nº, Bairro) {tipoReceita === 'ESPECIAL' && <span className="text-red-400">*</span>}
              </label>
              <input type="text" value={pacienteEndereco} onChange={(e) => setPacienteReceita({ pacienteEndereco: e.target.value })} placeholder="Rua, número, bairro" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                CEP {tipoReceita === 'ESPECIAL' && <span className="text-red-400">*</span>}
              </label>
              <input type="text" value={pacienteCep} onChange={(e) => setPacienteReceita({ pacienteCep: e.target.value })} placeholder="00000-000" className={inputCls} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Cidade</label>
                <input type="text" value={pacienteCidade} onChange={(e) => setPacienteReceita({ pacienteCidade: e.target.value })} placeholder="Fortaleza" className={inputCls} />
              </div>
              <div style={{ width: '80px' }}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">UF</label>
                <input type="text" value={pacienteUf} onChange={(e) => setPacienteReceita({ pacienteUf: e.target.value })} placeholder="CE" maxLength={2} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Telefone {tipoReceita === 'ESPECIAL' && <span className="text-red-400">*</span>}
              </label>
              <input type="text" value={pacienteTelefone} onChange={(e) => setPacienteReceita({ pacienteTelefone: e.target.value })} placeholder="(85) 00000-0000" className={inputCls} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  <Calendar size={11} className="inline mr-1" />Data
                </label>
                <input type="text" value={data} onChange={(e) => setPacienteReceita({ data: e.target.value })} className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  <MapPin size={11} className="inline mr-1" />Local
                </label>
                <input type="text" value={local} onChange={(e) => setPacienteReceita({ local: e.target.value })} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Medicamentos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Pill size={16} className="text-blue-500" />
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Medicamentos</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Sparkles size={12} className="text-violet-400" />
              <span>IA gera posologia <strong className="text-violet-600">e avalia o tipo de receita</strong></span>
            </div>
          </div>

          <div className="space-y-3">
            {medicamentos.map((med, idx) => (
              <MedicamentoCard key={med.id} id={med.id} index={idx} tipoAtual={tipoReceita} />
            ))}
          </div>

          <button
            onClick={addMedicamento}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
          >
            <Plus size={16} />
            Adicionar Medicamento
          </button>
        </div>

        {/* Card pronto */}
        {podeImprimir && !alertaMismatch && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-4 flex items-center gap-4">
            <div className="bg-green-100 rounded-xl p-3">
              <Eye size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">Receita pronta para imprimir!</p>
              <p className="text-xs text-green-600 mt-0.5">
                {medsComConteudo.length} medicamento(s) · {tipoReceita === 'SIMPLES' ? 'Receita Branca Simples' : 'Controle Especial (2 vias)'}
              </p>
            </div>
            <button onClick={() => navigate('/receita/imprimir')} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm">
              <Eye size={15} />
              Visualizar
            </button>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-3 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center gap-1.5 ${pacienteNome ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 size={14} />
              <span className="font-medium">{pacienteNome || 'Sem paciente'}</span>
            </div>
            {temMedicamentos && (
              <>
                <span className="text-gray-300">·</span>
                <span className={`font-semibold text-xs ${alertaMismatch ? 'text-red-500' : 'text-blue-600'}`}>
                  {alertaMismatch ? '⚠️ Tipo incorreto' : `${medsComConteudo.length} medicamento(s)`}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/receita/imprimir')}
            disabled={!podeImprimir || alertaMismatch}
            title={alertaMismatch ? 'Corrija o tipo de receita antes de imprimir' : ''}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              !podeImprimir || alertaMismatch
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : tipoReceita === 'ESPECIAL'
                ? 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
            }`}
          >
            <Printer size={16} />
            {tipoReceita === 'ESPECIAL' ? 'Imprimir Controle Especial' : 'Imprimir Receita'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
