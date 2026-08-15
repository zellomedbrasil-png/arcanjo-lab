import { useState, useEffect, useRef, useMemo } from 'react';
import { Pill, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MEDICAMENTOS, normalizar, type MedicamentoDef } from '../../data/medicamentos';
import type { MedicamentoReceita } from '../../store/useReceitaStore';

/**
 * Dados devolvidos ao selecionar uma sugestão. São espalhados direto no
 * updateMedicamento do store, por isso o formato tem que casar com MedicamentoReceita.
 */
type SelecaoMedicamento = Pick<
  MedicamentoReceita,
  | 'principioAtivo'
  | 'formaFarmaceutica'
  | 'uso'
  | 'posologia'
  | 'quantidade'
  | 'duracao'
  | 'tipoRecomendado'
  | 'indicacao'
  | 'observacoes'
  | 'motivoEspecial'
>;

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (med: SelecaoMedicamento) => void;
  onEnterPress: () => void;
  placeholder: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function MedicamentoAutocomplete({
  value,
  onChange,
  onSelect,
  onEnterPress,
  placeholder,
  disabled = false,
  autoFocus = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const sugestoes = useMemo(() => {
    if (!value.trim() || !isOpen) return [];
    const query = normalizar(value);
    // Busca tolerante a acento e também pela marca — "cozaar" acha losartana.
    return MEDICAMENTOS.filter((m) =>
      normalizar(`${m.nome} ${m.principioAtivo} ${m.marcaReferencia} ${m.indicacao}`).includes(query)
    ).slice(0, 6);
  }, [value, isOpen]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (sugestoes.length === 0) {
      if (e.key === 'Enter') {
        onEnterPress();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < sugestoes.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : sugestoes.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < sugestoes.length) {
        selectItem(sugestoes[activeIndex]);
      } else {
        onEnterPress();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectItem = (med: MedicamentoDef) => {
    onSelect({
      principioAtivo: med.principioAtivo,
      formaFarmaceutica: med.formaFarmaceutica,
      uso: med.uso,
      posologia: med.posologiaPadrao,
      quantidade: med.quantidadePadrao,
      duracao: med.duracaoPadrao,
      tipoRecomendado: med.tipoRecomendado,
      indicacao: med.indicacao,
      observacoes: med.observacoes ?? '',
      motivoEspecial: med.motivoEspecial ?? '',
    });
    onChange(med.nome);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="relative flex items-center">
        <Pill className="absolute left-3 text-gray-400 pointer-events-none" size={14} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full text-sm bg-transparent border-none outline-none pl-9 pr-3 py-2 text-gray-800 placeholder-gray-400 font-medium"
        />
      </div>

      {isOpen && sugestoes.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          {sugestoes.map((med, index) => {
            const isEspecial = med.tipoRecomendado === 'ESPECIAL';
            const isActive = index === activeIndex;
            return (
              <button
                key={med.id}
                type="button"
                onClick={() => selectItem(med)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                  isActive ? 'bg-indigo-50/70 text-indigo-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-gray-800 truncate">{med.nome}</p>
                    <span className="text-[9px] text-indigo-400 font-semibold whitespace-nowrap">
                      ref.: {med.marcaReferencia}
                    </span>
                    {med.indicacao && (
                      <span className="text-[9px] bg-slate-100 border border-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                        {med.indicacao}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-1">{med.posologiaPadrao}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {isEspecial ? (
                    <span
                      title={med.motivoEspecial}
                      className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-1 py-0.5 uppercase tracking-wide"
                    >
                      <ShieldAlert size={8} />
                      Controle
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 rounded px-1 py-0.5 uppercase tracking-wide">
                      <CheckCircle2 size={8} />
                      Simples
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
