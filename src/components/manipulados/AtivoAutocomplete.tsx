import { useState, useEffect, useRef, useMemo } from 'react';
import { FlaskConical, ShieldAlert } from 'lucide-react';
import {
  ATIVOS, CLASSE_INFO, REGULACAO_INFO, normalizarAtivo,
  type AtivoManipulado,
} from '../../data/ativosManipulados';

/**
 * Busca de ativo no acervo da La Saluté. Só permite escolher o que a farmácia
 * realmente tem — evita prescrever um ativo que voltará da manipulação.
 */
export default function AtivoAutocomplete({
  onSelect,
  placeholder = 'Buscar ativo no acervo (ex: magnésio, P5P, psyllium)...',
}: {
  onSelect: (ativo: AtivoManipulado) => void;
  placeholder?: string;
}) {
  const [valor, setValor] = useState('');
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const sugestoes = useMemo(() => {
    if (!valor.trim() || !aberto) return [];
    const q = normalizarAtivo(valor);
    return ATIVOS.filter((a) =>
      normalizarAtivo(`${a.nome} ${a.sinonimos.join(' ')} ${a.descricao}`).includes(q)
    ).slice(0, 7);
  }, [valor, aberto]);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  const escolher = (ativo: AtivoManipulado) => {
    onSelect(ativo);
    setValor('');
    setAberto(false);
    setIndiceAtivo(-1);
  };

  const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (sugestoes.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceAtivo((p) => (p < sugestoes.length - 1 ? p + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceAtivo((p) => (p > 0 ? p - 1 : sugestoes.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceAtivo >= 0) escolher(sugestoes[indiceAtivo]);
    } else if (e.key === 'Escape') {
      setAberto(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <FlaskConical className="absolute left-3 text-gray-400 pointer-events-none" size={14} />
        <input
          type="text"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setAberto(true);
            setIndiceAtivo(-1);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={aoTeclar}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
        />
      </div>

      {aberto && sugestoes.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 max-h-72 overflow-y-auto">
          {sugestoes.map((a, i) => {
            const reg = REGULACAO_INFO[a.regulacao];
            const ativo = i === indiceAtivo;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => escolher(a)}
                onMouseEnter={() => setIndiceAtivo(i)}
                className={`w-full flex items-start justify-between gap-2 px-3 py-2.5 text-left transition-colors ${
                  ativo ? 'bg-indigo-50/70' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-gray-800 text-xs">{a.nome}</span>
                    <span className="text-[8px] bg-slate-100 border border-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded font-medium uppercase">
                      {CLASSE_INFO[a.classe]}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{a.descricao}</p>
                  {a.doseUsualMin !== undefined && (
                    <p className="text-[9px] text-indigo-500 font-semibold mt-0.5">
                      Faixa usual: {a.doseUsualMin}–{a.doseUsualMax} {a.unidadePadrao}
                    </p>
                  )}
                </div>
                {reg.rotulo && (
                  <span
                    title={a.alertaLegal}
                    className={`shrink-0 flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                      reg.exige2Vias
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : a.regulacao === 'RESTRICAO_CFM'
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-sky-100 border-sky-200 text-sky-800'
                    }`}
                  >
                    {(reg.exige2Vias || a.regulacao === 'RESTRICAO_CFM') && <ShieldAlert size={8} />}
                    {reg.rotulo}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
