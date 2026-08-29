import { memo } from 'react';
import { Trash2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useManipuladosStore, UNIDADES } from '../../store/useManipuladosStore';
import { getAtivo, REGULACAO_INFO, type UnidadeDose } from '../../data/ativosManipulados';
import { FORMA_INFO, type FormaFarmaceutica } from '../../data/formulasManipuladas';
import AtivoAutocomplete from './AtivoAutocomplete';

const FORMAS: FormaFarmaceutica[] = ['CAPSULA', 'SACHE', 'SOLUCAO_ORAL', 'CREME', 'GEL'];

/**
 * Editor de uma fórmula da receita: nome, forma, componentes com dose,
 * quantidade a aviar e posologia.
 *
 * memo + seletor por fórmula: digitar numa fórmula não re-renderiza as outras
 * (mesmo padrão aplicado ao receituário no commit 41ae3d7).
 */
const MontadorFormula = memo(function MontadorFormula({
  formulaId,
  indice,
}: {
  formulaId: string;
  indice: number;
}) {
  const formula = useManipuladosStore((s) => s.formulas.find((f) => f.id === formulaId));
  const updateFormula = useManipuladosStore((s) => s.updateFormula);
  const removeFormula = useManipuladosStore((s) => s.removeFormula);
  const addComponente = useManipuladosStore((s) => s.addComponente);
  const updateComponente = useManipuladosStore((s) => s.updateComponente);
  const removeComponente = useManipuladosStore((s) => s.removeComponente);

  if (!formula) return null;

  const inputCls =
    'border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all bg-white';

  return (
    <div className="border border-gray-200 rounded-xl bg-white p-3 mb-3">
      {/* Cabeçalho da fórmula */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="h-6 w-6 shrink-0 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
          {indice + 1}
        </span>
        <input
          type="text"
          value={formula.nome}
          onChange={(e) => updateFormula(formulaId, { nome: e.target.value })}
          placeholder="Nome da fórmula (ex: Suporte para sono)"
          className={`${inputCls} flex-1 font-semibold`}
        />
        <select
          value={formula.forma}
          onChange={(e) => updateFormula(formulaId, { forma: e.target.value as FormaFarmaceutica })}
          className={inputCls}
        >
          {FORMAS.map((f) => (
            <option key={f} value={f}>
              {FORMA_INFO[f].rotulo}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => removeFormula(formulaId)}
          aria-label="Remover fórmula"
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Componentes */}
      <div className="pl-8">
        {formula.componentes.length === 0 && (
          <p className="text-[10px] text-gray-400 italic mb-2">
            Nenhum ativo ainda — busque no acervo abaixo.
          </p>
        )}

        {formula.componentes.map((c, i) => {
          const ativo = getAtivo(c.ativoId);
          const reg = ativo ? REGULACAO_INFO[ativo.regulacao] : null;
          // Aviso, não trava: quem decide a dose é o médico.
          const foraDaFaixa =
            ativo?.doseUsualMin !== undefined &&
            ativo?.doseUsualMax !== undefined &&
            c.unidade === ativo.unidadePadrao &&
            (c.dose < ativo.doseUsualMin || c.dose > ativo.doseUsualMax);

          return (
            <div key={`${c.ativoId}-${i}`} className="mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex-1 text-[11px] text-gray-800 truncate">
                  {ativo?.nome ?? c.ativoId}
                </span>
                {reg?.rotulo && (
                  <span
                    title={ativo?.alertaLegal}
                    className={`shrink-0 flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1 py-0.5 rounded border ${
                      reg.exige2Vias
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : ativo?.regulacao === 'RESTRICAO_CFM'
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-sky-100 border-sky-200 text-sky-800'
                    }`}
                  >
                    {(reg.exige2Vias || ativo?.regulacao === 'RESTRICAO_CFM') && <ShieldAlert size={8} />}
                    {reg.rotulo}
                  </span>
                )}
                <input
                  type="number"
                  value={c.dose}
                  min={0}
                  step="any"
                  onChange={(e) =>
                    updateComponente(formulaId, i, { dose: Number(e.target.value) })
                  }
                  className={`${inputCls} w-20 text-right`}
                />
                <select
                  value={c.unidade}
                  onChange={(e) =>
                    updateComponente(formulaId, i, { unidade: e.target.value as UnidadeDose })
                  }
                  className={`${inputCls} w-20`}
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeComponente(formulaId, i)}
                  aria-label="Remover ativo"
                  className="p-1 text-gray-300 hover:text-red-600 rounded transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {foraDaFaixa && (
                <p className="flex items-center gap-1 text-[9px] text-amber-700 mt-0.5 ml-1">
                  <AlertTriangle size={9} className="shrink-0" />
                  Fora da faixa usual ({ativo!.doseUsualMin}–{ativo!.doseUsualMax}{' '}
                  {ativo!.unidadePadrao}) — confira se é intencional.
                </p>
              )}

              {ativo?.alertaLegal && (
                <p className="text-[9px] text-amber-800 bg-amber-50 border border-amber-100 rounded px-1.5 py-1 mt-0.5 ml-1 leading-snug">
                  {ativo.alertaLegal}
                </p>
              )}
            </div>
          );
        })}

        <div className="mt-2">
          <AtivoAutocomplete
            onSelect={(ativo) =>
              addComponente(formulaId, {
                ativoId: ativo.id,
                dose: ativo.doseUsualMin ?? 0,
                unidade: ativo.unidadePadrao,
              })
            }
          />
        </div>

        {/* Quantidade e posologia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          <div>
            <label className="block text-[9px] font-bold uppercase text-gray-500 tracking-wide mb-1">
              Quantidade a aviar
            </label>
            <input
              type="text"
              value={formula.quantidade}
              onChange={(e) => updateFormula(formulaId, { quantidade: e.target.value })}
              placeholder="30 doses"
              className={`${inputCls} w-full`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[9px] font-bold uppercase text-gray-500 tracking-wide mb-1">
              Posologia
            </label>
            <input
              type="text"
              value={formula.posologia}
              onChange={(e) => updateFormula(formulaId, { posologia: e.target.value })}
              placeholder="Tomar 1 cápsula à noite, 30 min antes de deitar."
              className={`${inputCls} w-full`}
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="block text-[9px] font-bold uppercase text-gray-500 tracking-wide mb-1">
            Observações (opcional)
          </label>
          <input
            type="text"
            value={formula.observacoes}
            onChange={(e) => updateFormula(formulaId, { observacoes: e.target.value })}
            placeholder="Ex: tomar com bastante água"
            className={`${inputCls} w-full`}
          />
        </div>
      </div>
    </div>
  );
});

export default MontadorFormula;
