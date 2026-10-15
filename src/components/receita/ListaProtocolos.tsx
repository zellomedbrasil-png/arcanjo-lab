import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { normalizar, getMedicamento } from '../../data/medicamentos';
import {
  PROTOCOLOS, AREA_PROTOCOLO_INFO, nomesDosMedicamentos, versaoExige2Vias,
  type AreaProtocolo, type ProtocoloQueixa, type VersaoProtocolo,
} from '../../data/protocolos';

type FiltroArea = AreaProtocolo | 'TODAS';

/** Biblioteca de protocolos por queixa. "Aplicar" põe todos os remédios da versão na receita. */
export default function ListaProtocolos({ onAplicar }: { onAplicar: (p: ProtocoloQueixa, versao: VersaoProtocolo) => void }) {
  const [busca, setBusca] = useState('');
  const [area, setArea] = useState<FiltroArea>('TODAS');
  const [aberto, setAberto] = useState<string | null>(null);

  const lista = useMemo(() => {
    const q = normalizar(busca);
    return PROTOCOLOS.filter((p) => {
      if (area !== 'TODAS' && p.area !== area) return false;
      if (!q) return true;
      return normalizar(`${p.queixa} ${p.sinonimos.join(' ')} ${p.cid10} ${nomesDosMedicamentos(p.padraoOuro.medicamentos)}`).includes(q);
    });
  }, [busca, area]);

  const areas: FiltroArea[] = ['TODAS', 'GERIATRIA', 'GASTRO', 'CLINICA_GERAL'];

  const versao = (p: ProtocoloQueixa, v: VersaoProtocolo, rotulo: string) => (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">
            {rotulo}
            {versaoExige2Vias(v.medicamentos) && <span className="ml-1.5 text-amber-700">· tem controlado/antimicrobiano</span>}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">{v.nota}</p>
        </div>
        <button
          type="button"
          onClick={() => onAplicar(p, v)}
          className="shrink-0 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
        >
          Aplicar
        </button>
      </div>
      <ul className="mt-2 space-y-1">
        {v.medicamentos.map((i) => (
          <li key={i.medicamentoId + i.posologia} className="text-sm text-gray-800">
            <strong>{getMedicamento(i.medicamentoId)?.nome ?? i.medicamentoId}</strong>
            <span className="text-gray-500"> — {i.posologia} · {i.quantidade} · {i.duracao}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Queixa, CID ou remédio (ex.: azia, I10, losartana)"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {areas.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setArea(a)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                area === a ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              {a === 'TODAS' ? 'Todas' : AREA_PROTOCOLO_INFO[a]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">{lista.length} protocolos · revise sempre antes de aplicar ao paciente.</p>

      <div className="space-y-2">
        {lista.map((p) => {
          const expandido = aberto === p.id;
          return (
            <div key={p.id} className="rounded-xl border border-gray-200 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setAberto(expandido ? null : p.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
              >
                <span className="font-semibold text-sm text-gray-900">{p.queixa}</span>
                <span className="text-[11px] text-gray-500">{AREA_PROTOCOLO_INFO[p.area]} · {p.cid10}</span>
                {p.revisar && <span className="text-[10px] font-bold uppercase text-orange-700 bg-orange-50 border border-orange-200 rounded px-1.5">Revisar</span>}
                <span className="ml-auto text-gray-400">{expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
              </button>
              {expandido && (
                <div className="px-3 pb-3 space-y-2">
                  <p className="text-sm text-gray-700">{p.resumo}</p>
                  {versao(p, p.padraoOuro, 'Padrão-ouro')}
                  {p.acessivel && versao(p, p.acessivel, 'Acessível (SUS / custo)')}
                  {p.orientacoes.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500">Orientações ao paciente</p>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-0.5">{p.orientacoes.map((o) => <li key={o}>{o}</li>)}</ul>
                    </div>
                  )}
                  {p.alertas && p.alertas.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase text-red-600">Alertas</p>
                      <ul className="list-disc pl-5 text-sm text-red-800 space-y-0.5">{p.alertas.map((o) => <li key={o}>{o}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
