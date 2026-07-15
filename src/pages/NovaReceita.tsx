import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useReceitaStore } from '../store/useReceitaStore';
import GuiaPrescricaoRapida from '../components/receita/GuiaPrescricaoRapida';
import type { MedicamentoPreset } from '../data/medicamentosGuia';
import { gerarPosologia, processarListaMedicamentos } from '../services/groqReceita';
import { getErrorMessage } from '../lib/errors';
import { toast } from '../lib/toast';
import MedicamentoPastePanel from '../components/receita/MedicamentoPastePanel';
import MedicamentoAutocomplete from '../components/receita/MedicamentoAutocomplete';
import ReceitaBranca from '../components/print/templates/ReceitaBranca';
import ReceitaControleEspecial from '../components/print/templates/ReceitaControleEspecial';
import {
  Sparkles, Plus, Trash2, Printer, RotateCcw, FileText, AlertTriangle,
  ChevronDown, ChevronUp, User, Calendar, MapPin, Pill, Loader2,
  CheckCircle2, Eye, ShieldAlert, Info, History, LayoutGrid, PenLine
} from 'lucide-react';
import { useRecentPatientsStore, type PacienteRecente } from '../store/useRecentPatientsStore';
import { savePatientToHistory } from '../store/patientSync';
import { useAppStore } from '../store/useAppStore';
import { getDefaultModelId, AI_MODELS } from '../config/gemini';

// Formatação de CPF, CEP e Telefone para UX fluida
const formatCpf = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatCep = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatTelefone = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// Dados do guia (presets geriátricos/gastro/SUS) vivem em src/data/medicamentosGuia.ts;
// o painel visual é o componente GuiaPrescricaoRapida.

// ─── Card de medicamento ───────────────────────────────────────
function MedicamentoCard({
  id, index, tipoAtual,
}: { id: string; index: number; tipoAtual: string }) {
  const { medicamentos, updateMedicamento, removeMedicamento, setTipoReceita } = useReceitaStore();
  const med = medicamentos.find((m) => m.id === id)!;
  const [expandido, setExpandido] = useState(false);
  const [inputNome, setInputNome] = useState(med.nomeDigitado);

  const mismatch =
    med.tipoRecomendado === 'ESPECIAL' && tipoAtual === 'SIMPLES';

  const handleNomeChange = (valor: string) => {
    setInputNome(valor);
    updateMedicamento(id, { nomeDigitado: valor });
  };

  const handleGerarIA = async () => {
    const nome = inputNome.trim();
    if (!nome) return;
    updateMedicamento(id, { nomeDigitado: nome, carregando: true, erro: '' });
    try {
      const resultado = await gerarPosologia(nome);
      updateMedicamento(id, { ...resultado, nomeDigitado: nome, carregando: false });
      setExpandido(false);
    } catch {
      updateMedicamento(id, {
        carregando: false,
        erro: 'Erro ao gerar posologia com IA. Verifique a conexão ou preencha manualmente.',
      });
      setExpandido(true);
    }
  };

  const temConteudo = !!(med.nomeDigitado.trim() || med.principioAtivo || med.posologia);

  const borderClass = mismatch
    ? 'border-red-300 bg-gradient-to-br from-red-50/50 to-orange-50/30 shadow-sm shadow-red-100/50'
    : temConteudo
    ? 'border-indigo-100 bg-gradient-to-br from-indigo-50/20 via-blue-50/10 to-white shadow-sm shadow-indigo-100/30'
    : 'border-gray-200 bg-white hover:border-gray-300';

  const fields = [
    { label: 'Princípio Ativo / Nome', key: 'principioAtivo', full: true, placeholder: 'ex: Omeprazol 20mg', icon: Pill },
    { label: 'Forma Farmacêutica', key: 'formaFarmaceutica', full: false, placeholder: 'ex: Cápsulas gastrorresistentes', icon: FileText },
    { label: 'Via de Uso', key: 'uso', full: false, placeholder: 'ex: Uso oral', icon: MapPin },
    { label: 'Posologia', key: 'posologia', full: true, placeholder: 'ex: Tomar 1 cápsula em jejum, 30 min antes do café da manhã', icon: Sparkles },
    { label: 'Quantidade', key: 'quantidade', full: false, placeholder: 'ex: 30 cápsulas', icon: Plus },
    { label: 'Duração do Tratamento', key: 'duracao', full: false, placeholder: 'ex: 30 dias', icon: Calendar },
    { label: 'Indicação Clínica', key: 'indicacao', full: true, placeholder: 'ex: Tratamento de refluxo gastroesofágico (indicação clínica)', icon: Info },
    { label: 'Observações / Instruções Adicionais', key: 'observacoes', full: true, placeholder: 'ex: Tomar em jejum pela manhã / Pode causar sonolência', icon: AlertTriangle },
  ];

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${borderClass}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
          mismatch ? 'bg-gradient-to-br from-red-500 to-orange-600 text-white' : temConteudo ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {mismatch ? <ShieldAlert size={16} /> : temConteudo ? <CheckCircle2 size={16} /> : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <MedicamentoAutocomplete
            value={inputNome}
            onChange={handleNomeChange}
            onSelect={(sugestao) => {
              updateMedicamento(id, {
                ...sugestao,
                nomeDigitado: inputNome || sugestao.principioAtivo,
                erro: '',
              });
              setExpandido(false);
            }}
            onEnterPress={handleGerarIA}
            placeholder={`Medicamento ${index + 1} (ex: Clonazepam 2mg)`}
            autoFocus={index === medicamentos.length - 1 && !med.nomeDigitado}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleGerarIA}
            disabled={med.carregando || !inputNome.trim()}
            title="Gerar posologia com IA + avaliar tipo de receita"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              med.carregando || !inputNome.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/55'
                : 'bg-gradient-to-r from-violet-650 to-indigo-600 text-white hover:from-violet-750 hover:to-indigo-750 hover:shadow-md'
            }`}
          >
            {med.carregando ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {med.carregando ? 'Analisando...' : 'IA'}
          </button>

          {temConteudo && (
            <button onClick={() => setExpandido(!expandido)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
              {expandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}

          <button onClick={() => removeMedicamento(id)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all border border-transparent">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Alerta de mismatch */}
      {mismatch && med.tipoRecomendado && (
        <div className="mx-4 mb-3 flex items-start gap-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3.5 shadow-sm">
          <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold text-red-900">
              ⚠️ Este medicamento requer receita em 2 vias (Controle Especial)
            </p>
            {med.motivoEspecial && (
              <p className="mt-1 text-red-700 leading-relaxed">{med.motivoEspecial}</p>
            )}
            <p className="mt-1.5 text-[10px] text-red-500 font-semibold uppercase tracking-wide">Mude o tipo de receita para prosseguir.</p>
            <button
              type="button"
              onClick={() => setTipoReceita('ESPECIAL')}
              className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Alternar para Controle Especial
            </button>
          </div>
        </div>
      )}

      {/* Alerta de erro */}
      {med.erro && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 animate-pulse">
          <AlertTriangle size={14} className="text-amber-500" />
          {med.erro}
        </div>
      )}

      {/* Badge tipo recomendado (sem mismatch) */}
      {med.tipoRecomendado && !mismatch && (
        <div className="mx-4 mb-3 flex items-center gap-1.5 text-[10px] text-green-700 bg-green-50/50 border border-green-150 rounded-lg px-2.5 py-1 w-fit font-medium">
          <CheckCircle2 size={12} className="text-green-600" />
          <span>IA confirmou: <strong className="font-semibold">{med.tipoRecomendado === 'SIMPLES' ? 'Receita Branca Simples ✓' : 'Receita de 2 Vias (Controle Especial) ✓'}</strong></span>
        </div>
      )}

      {/* Campos expandidos */}
      {(expandido || med.erro) && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-indigo-100/50 pt-4 bg-white/50 rounded-b-2xl">
          {fields.map(({ label, key, full, placeholder, icon: IconField }) => (
            <div key={key} className={full ? 'col-span-full' : ''}>
              <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1.5 flex items-center gap-1">
                <IconField size={10} className="text-indigo-400" />
                {label}
              </label>
              <input
                type="text"
                value={(med as unknown as Record<string, string>)[key] || ''}
                onChange={(e) => updateMedicamento(id, { [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-300 transition-all shadow-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview compacto */}
      {temConteudo && !expandido && !med.erro && (
        <div className="px-4 pb-4 pl-15 text-xs text-gray-600 border-t border-dashed border-gray-150 pt-3 space-y-1">
          <p className="font-bold text-gray-800 text-sm">{med.principioAtivo}</p>
          {med.formaFarmaceutica && <p className="text-gray-500 italic">{med.formaFarmaceutica}</p>}
          {med.posologia && <p className="text-gray-700 leading-relaxed font-medium bg-gray-50/50 p-2 rounded-lg border border-gray-100">{med.posologia}</p>}
          {med.indicacao && (
            <p className="text-gray-700 leading-relaxed bg-indigo-50/30 p-2 rounded-lg border border-indigo-100/50">
              <strong className="text-indigo-700">Indicação:</strong> {med.indicacao}
            </p>
          )}
          {med.observacoes && (
            <p className="text-gray-700 leading-relaxed bg-amber-50/30 p-2 rounded-lg border border-amber-100/50">
              <strong className="text-amber-700">Observações:</strong> {med.observacoes}
            </p>
          )}
          {(med.quantidade || med.duracao) && (
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {med.quantidade && <span className="bg-indigo-50/50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">Qtd: {med.quantidade}</span>}
              {med.duracao && <span className="bg-blue-50/50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">Duração: {med.duracao}</span>}
              {med.uso && <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-[10px] font-medium">{med.uso}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────
export default function NovaReceita() {
  const navigate = useNavigate();
  const [processandoTextoLivre, setProcessandoTextoLivre] = useState(false);

  const getActiveModelLabel = () => {
    const modelId = getDefaultModelId();
    const model = AI_MODELS.find((m) => m.id === modelId || m.id.replace('google/', '') === modelId);
    return model ? model.badge : 'Gemini 3 Flash';
  };
  const {
    tipoReceita, pacienteNome, pacienteCpf,
    pacienteEndereco, pacienteCep, pacienteCidade, pacienteUf, pacienteTelefone,
    local, data, medicamentos,
    modoEntrada, textoLivre, melhorarComIA, prescricaoManual,
    setTipoReceita, setPacienteReceita, addMedicamento, resetReceita, updateMedicamento,
    setModoEntrada, setTextoLivre, setMelhorarComIA, setAlertas, setPrescricaoManual,
  } = useReceitaStore();

  const { pacientes: pacientesRecentes } = useRecentPatientsStore();

  const handleBlur = () => {
    if (pacienteNome && pacienteNome.trim().length >= 3) {
      const existing = useRecentPatientsStore.getState().pacientes.find(
        (p) => p.nome.toLowerCase() === pacienteNome.trim().toLowerCase()
      );
      const appStoreGenero = useAppStore.getState().genero;
      savePatientToHistory({
        nome: pacienteNome.trim(),
        cpf: pacienteCpf,
        genero: existing?.genero || appStoreGenero || 'M',
        endereco: pacienteEndereco,
        cep: pacienteCep,
        cidade: pacienteCidade,
        uf: pacienteUf,
        telefone: pacienteTelefone,
      });
    }
  };

  const handleSelectRecent = (p: PacienteRecente) => {
    setPacienteReceita({
      pacienteNome: p.nome,
      pacienteCpf: p.cpf || '',
      pacienteEndereco: p.endereco || '',
      pacienteCep: p.cep || '',
      pacienteCidade: p.cidade || 'Fortaleza',
      pacienteUf: p.uf || 'CE',
      pacienteTelefone: p.telefone || '',
    });
  };

  const fetchAddressByCep = async (cepValue: string) => {
    const rawCep = cepValue.replace(/\D/g, '');
    if (rawCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setPacienteReceita({
            pacienteEndereco: data.logradouro + (data.bairro ? `, ${data.bairro}` : ''),
            pacienteCidade: data.localidade || 'Fortaleza',
            pacienteUf: data.uf || 'CE',
          });
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const isTextoLivre = modoEntrada === 'TEXTO_LIVRE';
  const isManual = modoEntrada === 'MANUAL';
  const temTextoLivre = isTextoLivre && textoLivre.trim() !== '';
  const temManual = isManual && prescricaoManual.trim() !== '';

  const medsComConteudo = medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado);
  const medsSimples = medsComConteudo.filter((m) => m.tipoRecomendado !== 'ESPECIAL');
  const medsEspeciais = medsComConteudo.filter((m) => m.tipoRecomendado === 'ESPECIAL');
  const temAmbos = !isTextoLivre && !isManual && medsSimples.length > 0 && medsEspeciais.length > 0;
  const temMedicamentos = medsComConteudo.length > 0;
  const podeImprimir = pacienteNome.trim() !== '' && (isManual ? temManual : isTextoLivre ? temTextoLivre : temMedicamentos);

  // Processa o texto livre com a IA e converte em cards estruturados para revisão
  const handleProcessarTextoLivre = async () => {
    if (!textoLivre.trim()) return;
    setProcessandoTextoLivre(true);
    try {
      const resultado = await processarListaMedicamentos(textoLivre);
      // Remove cards vazios e preenche com o resultado da IA
      const vazios = useReceitaStore.getState().medicamentos.filter((m) => !m.nomeDigitado.trim() && !m.principioAtivo);
      let temEspecial = false;
      resultado.medicamentos.forEach((med) => {
        addMedicamento();
        const meds = useReceitaStore.getState().medicamentos;
        const ultimoId = meds[meds.length - 1].id;
        updateMedicamento(ultimoId, {
          nomeDigitado: med.nomeOriginal || med.principioAtivo,
          principioAtivo: med.principioAtivo,
          formaFarmaceutica: med.formaFarmaceutica,
          uso: med.uso,
          posologia: med.posologia,
          quantidade: med.quantidade,
          duracao: med.duracao,
          indicacao: med.indicacao,
          observacoes: med.observacoes,
          tipoRecomendado: med.tipoRecomendado,
          motivoEspecial: med.motivoEspecial,
        });
        if (med.tipoRecomendado === 'ESPECIAL') temEspecial = true;
      });
      vazios.forEach((m) => useReceitaStore.getState().removeMedicamento(m.id));
      setAlertas(resultado.alertas || []);
      if (temEspecial) setTipoReceita('ESPECIAL');
      // Volta ao modo estruturado para o médico revisar os cards gerados
      setModoEntrada('ESTRUTURADO');
      const n = resultado.medicamentos.length;
      toast.success(`${n} medicamento${n !== 1 ? 's' : ''} estruturado${n !== 1 ? 's' : ''} pela IA · revise antes de imprimir${temEspecial ? ' (Controle Especial detectado)' : ''}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao processar a prescrição com IA. Tente novamente.'));
    } finally {
      setProcessandoTextoLivre(false);
    }
  };

  // Auditoria: algum med requer ESPECIAL mas tipo está SIMPLES?
  const alertaMismatch = tipoReceita === 'SIMPLES' &&
    medicamentos.some((m) => m.tipoRecomendado === 'ESPECIAL');

  // Auditoria: algum med é SIMPLES mas tipo está ESPECIAL?
  const alertaSimples = tipoReceita === 'ESPECIAL' &&
    medicamentos.every((m) => m.tipoRecomendado === 'SIMPLES');

  const handleAddPreset = (preset: MedicamentoPreset) => {
    const cardVazio = medicamentos.find((m) => !m.nomeDigitado.trim() && !m.principioAtivo);
    
    let targetId: string;
    if (cardVazio) {
      targetId = cardVazio.id;
    } else {
      addMedicamento();
      const updatedMeds = useReceitaStore.getState().medicamentos;
      targetId = updatedMeds[updatedMeds.length - 1].id;
    }

    updateMedicamento(targetId, {
      nomeDigitado: preset.nome,
      principioAtivo: preset.principioAtivo,
      formaFarmaceutica: preset.formaFarmaceutica,
      uso: preset.uso,
      posologia: preset.posologia,
      quantidade: preset.quantidade,
      duracao: preset.duracao,
      tipoRecomendado: preset.tipoRecomendado,
    });

    if (preset.tipoRecomendado === 'ESPECIAL') {
      setTipoReceita('ESPECIAL');
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm placeholder-gray-300 bg-white";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-28 max-lg:pb-36">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receituário Médico</h1>
            <p className="mt-1 text-sm text-gray-500">
              Dr. Roberto Arcanjo · CRM/CE 26.155 · Digite o medicamento ou selecione um modelo rápido
            </p>
          </div>
          <button
            onClick={() => { if (confirm('Limpar todos os dados da receita?')) resetReceita(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-red-650 hover:bg-red-50 rounded-xl transition-colors border border-gray-200 bg-white shadow-sm font-medium"
          >
            <RotateCcw size={13} />
            Limpar tudo
          </button>
        </div>

        {/* Global warnings / banners */}
        {alertaMismatch && (
          <div className="mb-5 flex items-start gap-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl px-5 py-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
            <Sparkles size={22} className="text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-indigo-800">💡 Receitas divididas automaticamente</p>
              <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                Esta lista possui tanto medicamentos comuns quanto controlados. O sistema irá gerar **automaticamente duas receitas separadas**: uma Receita Branca (Simples) para os comuns e uma Receita de Controle Especial (2 vias) para os controlados na hora de imprimir.
              </p>
            </div>
          </div>
        )}

        {alertaSimples && (
          <div className="mb-5 flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl px-5 py-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
            <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-indigo-800">Aviso: Tipo Recomendado Diferente</p>
              <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                A IA identificou que todos os medicamentos na lista são de venda livre ou exigem apenas <strong>Receita Branca Simples</strong>.
                Você pode alternar o tipo de receita abaixo caso queira evitar vias extras desnecessárias.
              </p>
              <button
                type="button"
                onClick={() => setTipoReceita('SIMPLES')}
                className="mt-2 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
              >
                Alternar para Receita Simples
              </button>
            </div>
          </div>
        )}

        {/* Split Screen Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Coluna Esquerda: Edição */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Tipo de Receita */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Tipo de Receita</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setTipoReceita('SIMPLES')}
                  className={`relative flex flex-col items-start gap-2.5 p-4 rounded-xl border-2 transition-all text-left shadow-sm ${
                    tipoReceita === 'SIMPLES' 
                      ? 'border-indigo-600 bg-indigo-50/20' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {tipoReceita === 'SIMPLES' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-655 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`p-2 rounded-lg ${tipoReceita === 'SIMPLES' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${tipoReceita === 'SIMPLES' ? 'text-indigo-900' : 'text-gray-700'}`}>Receita Branca Simples</p>
                    <p className="text-xs text-gray-400 mt-0.5">Medicamentos comuns, não controlados · 1 via</p>
                  </div>
                </button>

                <button
                  onClick={() => setTipoReceita('ESPECIAL')}
                  className={`relative flex flex-col items-start gap-2.5 p-4 rounded-xl border-2 transition-all text-left shadow-sm ${
                    tipoReceita === 'ESPECIAL' 
                      ? 'border-amber-500 bg-amber-50/20' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {tipoReceita === 'ESPECIAL' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`p-2 rounded-lg ${tipoReceita === 'ESPECIAL' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${tipoReceita === 'ESPECIAL' ? 'text-amber-900' : 'text-gray-700'}`}>Receita Controle Especial</p>
                    <p className="text-xs text-gray-400 mt-0.5">Psicotrópicos, controlados e antibióticos · 2 vias (ANVISA)</p>
                  </div>
                </button>
              </div>

              {tipoReceita === 'ESPECIAL' && (
                <div className="mt-4 flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm animate-in fade-in duration-350">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <span className="leading-relaxed"><strong>ANVISA Exige:</strong> CPF, RG, endereço com CEP, cidade, UF e telefone do paciente são necessários para validar a receita de controle especial.</span>
                </div>
              )}
            </div>

            {/* Dados do Paciente */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-50">
                <User size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dados do Paciente</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className={tipoReceita === 'SIMPLES' ? '' : 'md:col-span-2'}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nome Completo <span className="text-red-400">*</span></label>
                  <input type="text" value={pacienteNome} onChange={(e) => setPacienteReceita({ pacienteNome: e.target.value })} onBlur={handleBlur} placeholder="Nome completo do paciente" className={inputCls} />
                  {pacientesRecentes.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mr-1">
                        <History size={12} className="text-gray-400" />
                        Recentes:
                      </span>
                      {pacientesRecentes.map((p) => (
                        <button
                          key={p.nome}
                          type="button"
                          onClick={() => handleSelectRecent(p)}
                          title={`CPF: ${p.cpf || 'Não informado'} | Endereço: ${p.endereco || 'Não informado'}`}
                          className="px-2.5 py-1 bg-gray-50/70 hover:bg-indigo-50 border border-gray-200/80 hover:border-indigo-200 rounded-full text-xs font-semibold text-gray-600 hover:text-indigo-655 hover:shadow-sm transition-all"
                        >
                          {p.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {tipoReceita === 'SIMPLES' ? (
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
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        CPF <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={pacienteCpf} onChange={(e) => setPacienteReceita({ pacienteCpf: formatCpf(e.target.value) })} onBlur={handleBlur} placeholder="000.000.000-00" className={inputCls} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Endereço (Rua, Nº, Bairro) <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={pacienteEndereco} onChange={(e) => setPacienteReceita({ pacienteEndereco: e.target.value })} onBlur={handleBlur} placeholder="Rua, número, bairro" className={inputCls} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        CEP <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={pacienteCep}
                        onChange={(e) => {
                          const formatted = formatCep(e.target.value);
                          setPacienteReceita({ pacienteCep: formatted });
                          fetchAddressByCep(formatted);
                        }}
                        onBlur={handleBlur}
                        placeholder="00000-000"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Cidade</label>
                        <input type="text" value={pacienteCidade} onChange={(e) => setPacienteReceita({ pacienteCidade: e.target.value })} onBlur={handleBlur} placeholder="Fortaleza" className={inputCls} />
                      </div>
                      <div style={{ width: '80px' }}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">UF</label>
                        <input type="text" value={pacienteUf} onChange={(e) => setPacienteReceita({ pacienteUf: e.target.value })} onBlur={handleBlur} placeholder="CE" maxLength={2} className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Telefone <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={pacienteTelefone} onChange={(e) => setPacienteReceita({ pacienteTelefone: formatTelefone(e.target.value) })} onBlur={handleBlur} placeholder="(85) 00000-0000" className={inputCls} />
                    </div>

                    <div className="flex gap-3 md:col-span-2">
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
                  </>
                )}
              </div>
            </div>

            {/* Medicamentos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-50 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Pill size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Medicamentos</h2>
                </div>
                {/* Toggle de modo de entrada */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => setModoEntrada('ESTRUTURADO')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      modoEntrada === 'ESTRUTURADO' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    Estruturado
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoEntrada('TEXTO_LIVRE')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isTextoLivre ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <PenLine size={13} />
                    Texto Livre
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoEntrada('MANUAL')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isManual ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <FileText size={13} />
                    Manual
                  </button>
                </div>
              </div>

              {isManual ? (
                /* ───── MODO MANUAL (sem IA) ───── */
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 text-xs text-emerald-800 bg-emerald-50/60 border border-emerald-150 rounded-xl p-3.5">
                    <FileText size={15} className="shrink-0 mt-0.5 text-emerald-500" />
                    <span className="leading-relaxed">
                      Prescrição manual, sem intervenção de IA. O texto sera impresso <strong>exatamente como digitado</strong> na receita {tipoReceita === 'ESPECIAL' ? 'de Controle Especial' : 'Branca Simples'} selecionada acima.
                    </span>
                  </div>

                  <textarea
                    value={prescricaoManual}
                    onChange={(e) => setPrescricaoManual(e.target.value)}
                    rows={16}
                    placeholder={`Digite a prescrição completa aqui...\n\nExemplo:\n1) Losartana 50mg ............ 1 comprimido pela manhã\n2) Metformina 850mg ......... 1 comprimido após o jantar\n\nUso contínuo. Retornar em 30 dias.`}
                    className="w-full border border-gray-200 rounded-xl text-sm py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 resize-y placeholder:text-gray-300 font-mono leading-relaxed"
                  />
                </div>
              ) : isTextoLivre ? (
                /* ───── MODO TEXTO LIVRE ───── */
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 text-xs text-indigo-800 bg-indigo-50/60 border border-indigo-150 rounded-xl p-3.5">
                    <PenLine size={15} className="shrink-0 mt-0.5 text-indigo-500" />
                    <span className="leading-relaxed">
                      Escreva a prescrição livremente, do seu jeito. Ela será impressa <strong>exatamente como digitada</strong> na receita {tipoReceita === 'ESPECIAL' ? 'de Controle Especial' : 'Branca Simples'} selecionada acima. Ative o botão abaixo se quiser que a IA organize e melhore o texto antes.
                    </span>
                  </div>

                  <textarea
                    value={textoLivre}
                    onChange={(e) => setTextoLivre(e.target.value)}
                    rows={12}
                    placeholder={`Digite a prescrição completa aqui...\n\nExemplo:\nLosartana 50mg ............ 1 comprimido pela manhã\nMetformina 850mg ......... 1 comprimido após o jantar\n\nUso contínuo. Retornar em 30 dias.`}
                    className="w-full border border-gray-200 rounded-xl text-sm py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-y placeholder:text-gray-300 font-mono leading-relaxed"
                  />

                  {/* Toggle "Melhorar com IA" */}
                  <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={melhorarComIA}
                        onClick={() => setMelhorarComIA(!melhorarComIA)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                          melhorarComIA ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${melhorarComIA ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-sm">
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-violet-500" />
                          Melhorar com IA
                        </span>
                        <span className="text-xs text-gray-400">
                          {melhorarComIA ? (
                            <span>
                              A IA vai expandir e organizar a prescrição. IA ativa: <strong className="text-indigo-650 font-bold">{getActiveModelLabel()}</strong>
                            </span>
                          ) : 'Desligado — o texto vai impresso igual ao digitado.'}
                        </span>
                      </span>
                    </label>

                    {melhorarComIA && (
                      <button
                        type="button"
                        onClick={handleProcessarTextoLivre}
                        disabled={processandoTextoLivre || !textoLivre.trim()}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shrink-0 ${
                          processandoTextoLivre || !textoLivre.trim()
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 hover:shadow-md'
                        }`}
                      >
                        {processandoTextoLivre ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                        {processandoTextoLivre ? 'Processando...' : 'Processar com IA'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
              <>
              {/* Guia Clínico de Prescrição Rápida (Geriátricos / Gastro / SUS Gratuitos) */}
              <GuiaPrescricaoRapida onPrescrever={handleAddPreset} />

              <MedicamentoPastePanel />

              <div className="space-y-4">
                {medicamentos.map((med, idx) => (
                  <MedicamentoCard key={med.id} id={med.id} index={idx} tipoAtual={tipoReceita} />
                ))}
              </div>

              <button
                onClick={addMedicamento}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/40 hover:shadow-sm transition-all"
              >
                <Plus size={16} />
                Adicionar Medicamento
              </button>
              </>
              )}
            </div>

            {/* Card pronto para Impressão */}
            {podeImprimir && !alertaMismatch && (
              <div className="bg-gradient-to-br from-green-50/60 to-emerald-50/30 border border-green-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm shadow-green-150/30 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow text-white shrink-0">
                  <Eye size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-900">Receituário validado e pronto!</p>
                  <p className="text-xs text-green-700 mt-1 leading-relaxed">
                    {isManual
                      ? `Prescrição manual · ${tipoReceita === 'SIMPLES' ? 'Receita Branca Simples' : 'Controle Especial (2 vias)'}`
                      : isTextoLivre
                      ? `Prescrição em texto livre · ${tipoReceita === 'SIMPLES' ? 'Receita Branca Simples' : 'Controle Especial (2 vias)'}`
                      : `${medsComConteudo.length} medicamento(s) configurado(s) · ${temAmbos ? 'Dividido automaticamente em 2 receitas' : tipoReceita === 'SIMPLES' ? 'Receita Branca Simples' : 'Controle Especial (2 vias)'}`}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/receita/imprimir')} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-md shadow-green-200 hover:scale-[1.01]"
                >
                  <Eye size={15} />
                  Visualizar Impressão
                </button>
              </div>
            )}
          </div>

          {/* Coluna Direita: Live Preview A4 */}
          <div className="sticky top-6 hidden lg:block w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visualização A4</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  temAmbos
                    ? 'bg-teal-100 text-teal-800 border border-teal-200'
                    : tipoReceita === 'ESPECIAL'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                }`}>
                  {temManual ? 'Manual' : temTextoLivre ? 'Texto Livre' : temAmbos ? 'Receitas Divididas' : tipoReceita === 'SIMPLES' ? '1 Via Simples' : '2 Vias C344'}
                </span>
              </div>

              <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center gap-4 overflow-y-auto h-[540px] border border-gray-200/50 shadow-inner relative scrollbar-thin">
                {(isManual || isTextoLivre) ? (
                  <div style={{ width: '301.6px', height: '426.5px', overflow: 'hidden' }} className="relative rounded shadow-md border border-gray-300 shrink-0">
                    <div className="origin-top-left" style={{ transform: 'scale(0.38)', width: '21cm', height: '29.7cm', backgroundColor: '#fff' }}>
                      {tipoReceita === 'SIMPLES'
                        ? <ReceitaBranca textoLivre={isManual ? prescricaoManual : textoLivre} />
                        : <ReceitaControleEspecial textoLivre={isManual ? prescricaoManual : textoLivre} />}
                    </div>
                  </div>
                ) : temAmbos ? (
                  <>
                    <div className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded shadow-sm">1. RECEITA SIMPLES</div>
                    <div style={{ width: '301.6px', height: '426.5px', overflow: 'hidden' }} className="relative rounded shadow-md border border-gray-300 shrink-0">
                      <div className="origin-top-left" style={{ transform: 'scale(0.38)', width: '21cm', height: '29.7cm', backgroundColor: '#fff' }}>
                        <ReceitaBranca medicamentosOverride={medsSimples} />
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded shadow-sm mt-2">2. RECEITA ESPECIAL</div>
                    <div style={{ width: '301.6px', height: '426.5px', overflow: 'hidden' }} className="relative rounded shadow-md border border-gray-300 shrink-0">
                      <div className="origin-top-left" style={{ transform: 'scale(0.38)', width: '21cm', height: '29.7cm', backgroundColor: '#fff' }}>
                        <ReceitaControleEspecial medicamentosOverride={medsEspeciais} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ width: '301.6px', height: '426.5px', overflow: 'hidden' }} className="relative rounded shadow-md border border-gray-300 shrink-0">
                    <div className="origin-top-left" style={{ transform: 'scale(0.38)', width: '21cm', height: '29.7cm', backgroundColor: '#fff' }}>
                      {tipoReceita === 'SIMPLES' ? <ReceitaBranca medicamentosOverride={medsSimples} /> : <ReceitaControleEspecial medicamentosOverride={medsEspeciais} />}
                    </div>
                  </div>
                )}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-2 text-center text-[10px] text-gray-500 font-semibold shadow-sm w-full mt-2">
                  Atualizado em tempo real
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 lg:left-64 left-0 right-0 z-30 lg:z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl px-4 py-4 no-print max-lg:bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center gap-1.5 ${pacienteNome ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 size={15} />
              <span className="font-semibold">{pacienteNome || 'Sem paciente identificado'}</span>
            </div>
            {isManual ? (
              temManual && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="font-bold text-xs text-emerald-600">Prescrição manual</span>
                </>
              )
            ) : isTextoLivre ? (
              temTextoLivre && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="font-bold text-xs text-indigo-600">Texto livre {melhorarComIA ? '(com IA)' : ''}</span>
                </>
              )
            ) : temMedicamentos && (
              <>
                <span className="text-gray-300">·</span>
                <span className="font-bold text-xs text-indigo-600">
                  {temAmbos ? `Dividido: ${medsComConteudo.length} medicamento(s)` : `${medsComConteudo.length} medicamento(s)`}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/receita/imprimir')}
            disabled={!podeImprimir}
            className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              !podeImprimir
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50 shadow-none'
                : temAmbos
                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white hover:from-teal-700 hover:to-indigo-700 hover:shadow-lg shadow-indigo-200'
                : tipoReceita === 'ESPECIAL'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 hover:shadow-lg shadow-amber-200'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg shadow-indigo-200'
            }`}
          >
            <Printer size={16} />
            {temAmbos ? 'Imprimir Receitas (Split)' : tipoReceita === 'ESPECIAL' ? 'Imprimir Controle Especial' : 'Imprimir Receita'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
