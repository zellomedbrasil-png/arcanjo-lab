import { useState, useEffect, useRef } from 'react';
import { Pill, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { TipoRecomendado } from '../../store/useReceitaStore';

interface MedicamentoSugestao {
  nome: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  tipoRecomendado: TipoRecomendado;
}

const DATABASE_MEDICAMENTOS: MedicamentoSugestao[] = [
  {
    nome: 'Dipirona Monoidratada 500mg',
    principioAtivo: 'Dipirona Monoidratada 500mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas se dor ou febre.',
    quantidade: '10 comprimidos',
    duracao: 'Em caso de dor',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Paracetamol 750mg',
    principioAtivo: 'Paracetamol 750mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas em caso de dor ou febre (máximo 4 Comprimidos/dia).',
    quantidade: '12 comprimidos',
    duracao: 'Em caso de dor',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Losartana Potássica 50mg',
    principioAtivo: 'Losartana Potássica 50mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral uma vez ao dia, preferencialmente pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Omeprazol 20mg',
    principioAtivo: 'Omeprazol 20mg',
    formaFarmaceutica: 'Cápsulas gastrorresistentes',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral em jejum, 30 minutos antes do café da manhã.',
    quantidade: '30 cápsulas',
    duracao: '30 dias',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Metformina 850mg',
    principioAtivo: 'Metformina Cloridrato 850mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral junto com o café da manhã ou jantar.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Sinvastatina 20mg',
    principioAtivo: 'Sinvastatina 20mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Rivaroxabana 20mg',
    principioAtivo: 'Rivaroxabana 20mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, com uma refeição.',
    quantidade: '28 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Clonazepam 2mg',
    principioAtivo: 'Clonazepam 2mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1/2 comprimido (1mg) por via oral à noite, antes de dormir.',
    quantidade: '30 comprimidos',
    duracao: '60 dias',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Diazepam 10mg',
    principioAtivo: 'Diazepam 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Sertralina 50mg',
    principioAtivo: 'Sertralina Cloridrato 50mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã, com ou sem alimentos.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'AAS 100mg (Ácido Acetilsalicílico)',
    principioAtivo: 'Ácido Acetilsalicílico 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, após o almoço.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Atorvastatina 20mg',
    principioAtivo: 'Atorvastatina Cálcica 20mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, a qualquer hora do dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Amoxicilina 500mg',
    principioAtivo: 'Amoxicilina 500mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas.',
    quantidade: '21 cápsulas',
    duracao: '7 dias',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Zolpidem 10mg',
    principioAtivo: 'Hemitartarato de Zolpidem 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, imediatamente antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Escitalopram 10mg',
    principioAtivo: 'Oxalato de Escitalopram 10mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Pregabalina 75mg',
    principioAtivo: 'Pregabalina 75mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral à noite, antes de deitar.',
    quantidade: '30 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Ibuprofeno 600mg',
    principioAtivo: 'Ibuprofeno 600mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas após as refeições.',
    quantidade: '10 comprimidos',
    duracao: '5 dias',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Rosuvastatina 10mg',
    principioAtivo: 'Rosuvastatina Cálcica 10mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Fluoxetina 20mg',
    principioAtivo: 'Cloridrato de Fluoxetina 20mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral pela manhã.',
    quantidade: '30 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Pantoprazol 40mg',
    principioAtivo: 'Pantoprazol Magnésico 40mg',
    formaFarmaceutica: 'Comprimidos gastrorresistentes',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã, em jejum.',
    quantidade: '28 comprimidos',
    duracao: '28 dias',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Alprazolam 0,5mg',
    principioAtivo: 'Alprazolam 0,5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Furosemida 40mg',
    principioAtivo: 'Furosemida 40mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '20 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Loratadina 10mg',
    principioAtivo: 'Loratadina 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '10 comprimidos',
    duracao: '10 dias',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Carvedilol 6,25mg',
    principioAtivo: 'Carvedilol 6,25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, junto com alimentos.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
  {
    nome: 'Quetiapina 25mg',
    principioAtivo: 'Hemifumarato de Quetiapina 25mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
  },
  {
    nome: 'Levotiroxina Sódica 50mcg',
    principioAtivo: 'Levotiroxina Sódica 50mcg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral em jejum, 30 a 60 minutos antes do café da manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
  },
];

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (med: Omit<MedicamentoSugestao, 'nome'>) => void;
  onEnterPress: () => void;
  placeholder: string;
  disabled?: boolean;
}

export default function MedicamentoAutocomplete({
  value,
  onChange,
  onSelect,
  onEnterPress,
  placeholder,
  disabled = false,
}: AutocompleteProps) {
  const [sugestoes, setSugestoes] = useState<MedicamentoSugestao[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value.trim() || !isOpen) {
      setSugestoes([]);
      return;
    }

    const filtered = DATABASE_MEDICAMENTOS.filter((m) =>
      m.nome.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5); // Limitado a 5 sugestões para ser compacto
    setSugestoes(filtered);
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

  const selectItem = (med: MedicamentoSugestao) => {
    onSelect({
      principioAtivo: med.principioAtivo,
      formaFarmaceutica: med.formaFarmaceutica,
      uso: med.uso,
      posologia: med.posologia,
      quantidade: med.quantidade,
      duracao: med.duracao,
      tipoRecomendado: med.tipoRecomendado,
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
                key={med.nome}
                type="button"
                onClick={() => selectItem(med)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                  isActive ? 'bg-indigo-50/70 text-indigo-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-semibold truncate">{med.nome}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{med.posologia}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {isEspecial ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-1 py-0.5 uppercase tracking-wide">
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
