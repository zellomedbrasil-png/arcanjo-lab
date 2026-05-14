import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES, PAINEIS_MARKDOWN } from '../../types';
import { Activity, Stethoscope, Beaker, HeartPulse, ScanFace, FileHeart, Search, Scan, Bone, Disc, X, CheckCircle2 } from 'lucide-react';

type ProcDef = {
  id: string;
  nome: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
  activeBg: string;
};

const PROCEDIMENTOS: ProcDef[] = [
  // Cardiologia
  { id: 'ECOCARDIOGRAMA',      nome: 'Ecocardiograma Transtorácico',        icon: HeartPulse, color: 'text-red-400',     activeColor: 'text-white', activeBg: 'bg-red-500' },
  { id: 'ECODOPPLER',          nome: 'Ecodopplercardiograma',               icon: Activity,   color: 'text-orange-400',  activeColor: 'text-white', activeBg: 'bg-orange-500' },
  { id: 'MAPA',                nome: 'MAPA 24h',                             icon: FileHeart,  color: 'text-rose-400',    activeColor: 'text-white', activeBg: 'bg-rose-500' },
  { id: 'HOLTER',              nome: 'Holter 24h',                           icon: FileHeart,  color: 'text-pink-400',    activeColor: 'text-white', activeBg: 'bg-pink-500' },
  { id: 'ECG',                 nome: 'Eletrocardiograma (ECG)',              icon: Activity,   color: 'text-rose-400',    activeColor: 'text-white', activeBg: 'bg-rose-600' },
  // Ultrassonografia
  { id: 'US_ABD_TOTAL',        nome: 'US Abdome Total',                      icon: ScanFace,   color: 'text-blue-400',    activeColor: 'text-white', activeBg: 'bg-blue-500' },
  { id: 'US_PELVICO',          nome: 'US Pélvico',                           icon: ScanFace,   color: 'text-purple-400',  activeColor: 'text-white', activeBg: 'bg-purple-500' },
  { id: 'US_TRANSVAGINAL',     nome: 'US Transvaginal',                      icon: ScanFace,   color: 'text-pink-400',    activeColor: 'text-white', activeBg: 'bg-pink-600' },
  { id: 'US_PROSTATA',         nome: 'US Próstata e Vias Urinárias',         icon: ScanFace,   color: 'text-blue-400',    activeColor: 'text-white', activeBg: 'bg-blue-600' },
  { id: 'US_TIREOIDE',         nome: 'US Tireoide',                          icon: ScanFace,   color: 'text-teal-400',    activeColor: 'text-white', activeBg: 'bg-teal-500' },
  { id: 'US_VIAS_BILIARES',    nome: 'US Vias Biliares e Fígado',            icon: ScanFace,   color: 'text-amber-400',   activeColor: 'text-white', activeBg: 'bg-amber-500' },
  // Endoscopia
  { id: 'EDA',                 nome: 'Esofagogastroduodenoscopia (EDA)',     icon: Search,     color: 'text-amber-400',   activeColor: 'text-white', activeBg: 'bg-amber-600' },
  { id: 'COLONOSCOPIA',        nome: 'Colonoscopia',                         icon: Search,     color: 'text-stone-400',   activeColor: 'text-white', activeBg: 'bg-stone-500' },
  { id: 'RETOSSIGMOIDOSCOPIA', nome: 'Retossigmoidoscopia',                  icon: Search,     color: 'text-stone-400',   activeColor: 'text-white', activeBg: 'bg-stone-600' },
  // Imagem
  { id: 'RX_TORAX',            nome: 'Radiografia de Tórax PA+Perfil',       icon: Bone,       color: 'text-slate-400',   activeColor: 'text-white', activeBg: 'bg-slate-500' },
  { id: 'RX_COLUNA',           nome: 'Radiografia de Coluna',                icon: Bone,       color: 'text-slate-400',   activeColor: 'text-white', activeBg: 'bg-slate-600' },
  { id: 'TC_ABD',              nome: 'TC Abdome e Pelve c/ contraste',       icon: Scan,       color: 'text-indigo-400',  activeColor: 'text-white', activeBg: 'bg-indigo-500' },
  { id: 'TC_CRANIO',           nome: 'TC Crânio',                             icon: Scan,       color: 'text-indigo-400',  activeColor: 'text-white', activeBg: 'bg-indigo-600' },
  { id: 'RM_ABD',              nome: 'RM Abdome e Pelve',                    icon: Disc,       color: 'text-violet-400',  activeColor: 'text-white', activeBg: 'bg-violet-500' },
  { id: 'RM_CRANIO',           nome: 'RM Crânio',                             icon: Disc,       color: 'text-violet-400',  activeColor: 'text-white', activeBg: 'bg-violet-600' },
  { id: 'DENSITOMETRIA',       nome: 'Densitometria Óssea (DXA)',            icon: Bone,       color: 'text-emerald-400', activeColor: 'text-white', activeBg: 'bg-emerald-500' },
];

export default function ExamSelector() {
  const {
    tipoGuia, convenio, examesSelecionados, procedimentosSelecionados,
    setExamesSelecionados, setJustificativa, setPaciente, toggleProcedimento
  } = useAppStore();

  const isLab = tipoGuia === 'LABORATORIO';

  const toggleExame = (exameNome: string) => {
    if (examesSelecionados.includes(exameNome)) {
      setExamesSelecionados(examesSelecionados.filter((e) => e !== exameNome));
    } else {
      setExamesSelecionados([...examesSelecionados, exameNome]);
    }
  };

  const aplicarPainel = (chave: string) => {
    const painel = PAINEIS_MARKDOWN[chave];
    setExamesSelecionados([...new Set(painel.exames)]);
    setJustificativa(painel.justificativa || ''); // Justificativa, não SOAP
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setPaciente({ tipoGuia: 'LABORATORIO' })}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
            isLab
              ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Beaker size={16} />
          Exames Laboratoriais
        </button>
        <button
          onClick={() => {
            if (isLab) setPaciente({ tipoGuia: 'ECOCARDIOGRAMA' });
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
            !isLab
              ? 'text-emerald-700 bg-emerald-50 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Stethoscope size={16} />
          Procedimentos Eletivos
          {!isLab && procedimentosSelecionados.length > 0 && (
            <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {procedimentosSelecionados.length}
            </span>
          )}
        </button>
      </div>

      <div className="p-6">
        {!isLab ? (
          <div>
            {/* Counter & info */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm text-gray-600">
                  Selecione até <strong>3 procedimentos</strong> por guia.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-8 h-2 rounded-full transition-all ${
                      i < procedimentosSelecionados.length ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1 font-medium">
                  {procedimentosSelecionados.length}/3
                </span>
              </div>
            </div>

            {/* Selected chips */}
            {procedimentosSelecionados.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                {procedimentosSelecionados.map(id => {
                  const proc = PROCEDIMENTOS.find(p => p.id === id);
                  if (!proc) return null;
                  const Icon = proc.icon;
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-full"
                    >
                      <Icon size={11} />
                      {proc.nome}
                      <button
                        onClick={() => toggleProcedimento(id)}
                        className="ml-1 hover:text-emerald-200 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Procedure grid — compact chip pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PROCEDIMENTOS.map((proc) => {
                const isSelected = procedimentosSelecionados.includes(proc.id);
                const isFull = procedimentosSelecionados.length >= 3 && !isSelected;
                const Icon = proc.icon;
                return (
                  <button
                    key={proc.id}
                    onClick={() => toggleProcedimento(proc.id)}
                    disabled={isFull}
                    title={isFull ? 'Limite de 3 procedimentos atingido' : proc.nome}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all text-xs font-medium
                      ${isSelected
                        ? `${proc.activeBg} ${proc.activeColor} border-transparent shadow-md scale-[1.02]`
                        : isFull
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : `border-gray-200 bg-white ${proc.color} hover:border-gray-300 hover:shadow-sm hover:scale-[1.01]`
                      }`}
                  >
                    {isSelected && (
                      <CheckCircle2
                        size={13}
                        className="absolute top-1.5 right-1.5 text-white opacity-90"
                      />
                    )}
                    <Icon size={20} className={isFull && !isSelected ? 'opacity-30' : ''} />
                    <span className="leading-tight">{proc.nome}</span>
                  </button>
                );
              })}
            </div>

            {procedimentosSelecionados.length > 0 && (
              <button
                onClick={() => procedimentosSelecionados.forEach(p => toggleProcedimento(p))}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                Limpar seleção
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Quick panels */}
            <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">
                Painéis Rápidos Clínicos
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PAINEIS_MARKDOWN).map(([key, painel]) => (
                  <button
                    key={key}
                    onClick={() => aplicarPainel(key)}
                    className="px-3 py-1.5 bg-white text-blue-600 text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-colors border border-blue-200"
                  >
                    {painel.nome}
                  </button>
                ))}
                <button
                  onClick={() => { setExamesSelecionados([]); setJustificativa(''); }}
                  className="px-3 py-1.5 bg-white text-gray-500 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-colors border border-gray-200 ml-auto"
                >
                  Limpar Tudo
                </button>
              </div>
            </div>

            {/* Exam categories */}
            <div className="space-y-4">
              {CATEGORIAS_EXAMES.map((categoria) => {
                const examesVisiveis = categoria.exames.filter((exame) => {
                  if (convenio === 'ISSEC' && exame.marca === '**') return false;
                  if (convenio === 'IPM' && exame.marca === '*') return false;
                  return true;
                });
                if (examesVisiveis.length === 0) return null;

                const selectedCount = examesVisiveis.filter(e => examesSelecionados.includes(e.nome)).length;

                return (
                  <div key={categoria.nome} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">{categoria.nome}</h3>
                      {selectedCount > 0 && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 bg-white">
                      {examesVisiveis.map((exame) => {
                        const isChecked = examesSelecionados.includes(exame.nome);
                        return (
                          <label
                            key={exame.nome}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                              isChecked
                                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/40'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
                              checked={isChecked}
                              onChange={() => toggleExame(exame.nome)}
                            />
                            <span className="leading-tight">{exame.nome}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
