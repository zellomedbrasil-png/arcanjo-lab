import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Search, Sparkles, ClipboardList, BookmarkCheck, CornerDownLeft } from 'lucide-react';
import { CANAL_INFO } from '../../data/medicamentos';
import { REGRAS_MODELO, seloCurto } from '../../data/regrasReceita';
import { AREA_PROTOCOLO_INFO } from '../../data/protocolos';
import { buscarPrescricao, dosesDe, type ResultadoBusca } from '../../data/buscaPrescricao';
import { useAtalhosReceitaStore } from '../../store/useAtalhosReceitaStore';

export interface BarraPrescricaoHandle {
  focar: () => void;
}

interface Props {
  /** Resultado escolhido. `dose` vale para remédio; `versao` para protocolo. */
  onEscolher: (r: ResultadoBusca, opcoes: { dose: number; versao: 'padraoOuro' | 'acessivel' }) => void;
  /** Nome fora do catálogo: gera com IA. */
  onGerarIA: (nome: string) => void;
  /** Colou várias linhas: leva para a aba Texto/IA. */
  onColarLista: (texto: string) => void;
}

/**
 * Barra única de prescrição. Digita, Enter, e o item entra; o campo limpa e
 * continua focado para o próximo. ↑↓ escolhe a linha, ←→ troca a dose (ou a
 * versão do protocolo). Sem resultado no catálogo, Enter gera com IA.
 */
const BarraPrescricao = forwardRef<BarraPrescricaoHandle, Props>(function BarraPrescricao(
  { onEscolher, onGerarIA, onColarLista },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [consulta, setConsulta] = useState('');
  const [ativo, setAtivo] = useState(0);
  // Dose/versão escolhida com ←→ por linha (chave do resultado → índice).
  const [variacao, setVariacao] = useState<Record<string, number>>({});
  const usos = useAtalhosReceitaStore((s) => s.usos);
  const modelos = useAtalhosReceitaStore((s) => s.modelos);
  const favoritos = useAtalhosReceitaStore((s) => s.favoritos);

  useImperativeHandle(ref, () => ({ focar: () => inputRef.current?.focus() }));

  const resultados = useMemo(() => buscarPrescricao(consulta, { usos, favoritos, modelos }), [consulta, usos, favoritos, modelos]);
  const temConsulta = consulta.trim().length > 0;
  // A última linha é sempre "Gerar com IA".
  const totalLinhas = resultados.length + (temConsulta ? 1 : 0);
  const indiceIA = resultados.length;

  const opcoesDe = (r: ResultadoBusca): string[] => {
    if (r.tipo === 'MED') return dosesDe(r.med).map((d) => d.rotulo);
    if (r.tipo === 'PROTOCOLO') return r.protocolo.acessivel ? ['Padrão-ouro', 'Acessível'] : [];
    return [];
  };
  const variacaoDe = (r: ResultadoBusca) => variacao[r.chave] ?? (r.tipo === 'MED' ? r.dose : 0);

  const limpar = () => {
    setConsulta('');
    setAtivo(0);
    setVariacao({});
  };

  const escolher = (i: number) => {
    if (i === indiceIA) {
      if (consulta.trim()) onGerarIA(consulta.trim());
    } else {
      const r = resultados[i];
      if (!r) return;
      const v = variacaoDe(r);
      onEscolher(r, { dose: r.tipo === 'MED' ? v : 0, versao: v === 1 ? 'acessivel' : 'padraoOuro' });
    }
    limpar();
    inputRef.current?.focus();
  };

  const mudarVariacao = (r: ResultadoBusca, delta: number) => {
    const n = opcoesDe(r).length;
    if (n < 2) return;
    setVariacao((v) => ({ ...v, [r.chave]: (variacaoDe(r) + delta + n) % n }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalLinhas) setAtivo((a) => (a + 1) % totalLinhas);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalLinhas) setAtivo((a) => (a - 1 + totalLinhas) % totalLinhas);
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && resultados[ativo] && opcoesDe(resultados[ativo]).length > 1) {
      // Só rouba a seta quando há dose/versão para trocar; senão a seta move o cursor no texto.
      e.preventDefault();
      mudarVariacao(resultados[ativo], e.key === 'ArrowRight' ? 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (temConsulta) escolher(Math.min(ativo, totalLinhas - 1));
    } else if (e.key === 'Escape') {
      limpar();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const texto = e.clipboardData.getData('text');
    if (texto.split(/\n/).filter((l) => l.trim()).length > 1) {
      e.preventDefault();
      onColarLista(texto);
      limpar();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setAtivo(0);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder="Remédio, dose ou queixa — ex.: losartana 100, amox, insônia…"
          aria-label="Buscar remédio ou protocolo"
          className="w-full pl-11 pr-24 py-3.5 text-base bg-white border-2 border-indigo-200 rounded-2xl shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-gray-400"
        />
        <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 text-[11px] text-gray-400 border border-gray-200 rounded-md px-1.5 py-0.5 bg-gray-50">
          / ou Ctrl K
        </kbd>
      </div>

      {temConsulta && (
        <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto">
          {resultados.map((r, i) => {
            const opcoes = opcoesDe(r);
            const v = variacaoDe(r);
            const destaque = i === ativo;
            return (
              <div
                key={r.chave}
                onMouseMove={() => ativo !== i && setAtivo(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(i)}
                className={`px-4 py-2.5 cursor-pointer border-b border-gray-50 ${destaque ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {r.tipo === 'PROTOCOLO' && <ClipboardList size={15} className="text-teal-600 shrink-0" />}
                  {r.tipo === 'MODELO' && <BookmarkCheck size={15} className="text-violet-600 shrink-0" />}
                  <span className="font-semibold text-sm text-gray-900">
                    {r.tipo === 'MED'
                      ? opcoes.length > 1 ? r.med.nome.replace(/\s+\d.*$/, '') || r.med.nome : r.med.nome
                      : r.tipo === 'PROTOCOLO' ? r.protocolo.queixa : r.modelo.nome}
                  </span>
                  {r.tipo === 'MED' && <span className="text-xs text-gray-400">{r.med.marcaReferencia}</span>}
                  {r.tipo === 'PROTOCOLO' && (
                    <span className="text-[11px] font-bold uppercase text-teal-700 bg-teal-50 border border-teal-100 rounded px-1.5">
                      Protocolo · {AREA_PROTOCOLO_INFO[r.protocolo.area]}
                    </span>
                  )}
                  {r.tipo === 'PROTOCOLO' && r.protocolo.revisar && (
                    <span className="text-[10px] font-bold uppercase text-orange-700 bg-orange-50 border border-orange-200 rounded px-1.5">Revisar</span>
                  )}
                  {r.tipo === 'MODELO' && (
                    <span className="text-[11px] font-bold uppercase text-violet-700 bg-violet-50 border border-violet-100 rounded px-1.5">
                      Modelo · {r.modelo.itens.length} itens
                    </span>
                  )}
                  {r.tipo === 'MED' && r.med.regra && r.med.regra.modelo !== 'SIMPLES' && (
                    <span
                      className={`text-[10px] font-extrabold uppercase rounded px-1.5 border ${
                        REGRAS_MODELO[r.med.regra.modelo].imprimeReceita
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {seloCurto(r.med.regra)}
                    </span>
                  )}
                  {r.tipo === 'MED' && dosesDe(r.med)[v]?.gratuito && (
                    <span className="text-[10px] font-extrabold uppercase rounded px-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700">
                      {CANAL_INFO[dosesDe(r.med)[v].gratuito!.canal].rotulo}
                    </span>
                  )}
                  {destaque && <CornerDownLeft size={14} className="ml-auto text-indigo-400" />}
                </div>

                {opcoes.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {opcoes.map((o, oi) => (
                      <button
                        key={o + oi}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVariacao((x) => ({ ...x, [r.chave]: oi }));
                        }}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                          oi === v ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1 truncate">
                  {r.tipo === 'MED'
                    ? dosesDe(r.med)[v]?.posologia
                    : r.tipo === 'PROTOCOLO'
                    ? `${(v === 1 && r.protocolo.acessivel ? r.protocolo.acessivel : r.protocolo.padraoOuro).medicamentos.length} remédio(s) · ${r.protocolo.resumo}`
                    : r.modelo.itens.map((i) => i.principioAtivo || i.nomeDigitado).join(' · ')}
                </p>
              </div>
            );
          })}

          <div
            onMouseMove={() => ativo !== indiceIA && setAtivo(indiceIA)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => escolher(indiceIA)}
            className={`px-4 py-2.5 cursor-pointer flex items-center gap-2 text-sm ${ativo === indiceIA ? 'bg-violet-50' : 'hover:bg-gray-50'}`}
          >
            <Sparkles size={15} className="text-violet-500" />
            <span className="text-violet-800">
              Gerar com IA: <strong>“{consulta.trim()}”</strong>
            </span>
            <span className="ml-auto text-xs text-gray-400">{resultados.length ? '↓ até aqui + Enter' : 'Enter'}</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default BarraPrescricao;
