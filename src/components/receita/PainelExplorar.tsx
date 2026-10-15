import { useRef, useState } from 'react';
import { Star, BookmarkCheck, ClipboardList, LayoutGrid, Trash2, Download, Upload, Save } from 'lucide-react';
import { getMedicamento, type MedicamentoDef } from '../../data/medicamentos';
import { dosesDe } from '../../data/buscaPrescricao';
import type { ProtocoloQueixa, VersaoProtocolo } from '../../data/protocolos';
import { useAtalhosReceitaStore, type ModeloReceita } from '../../store/useAtalhosReceitaStore';
import { useReceitaStore } from '../../store/useReceitaStore';
import { usePrescritorStore } from '../../config/prescritor';
import { toast } from '../../lib/toast';
import GuiaPrescricaoRapida from './GuiaPrescricaoRapida';
import ListaProtocolos from './ListaProtocolos';

export type AbaExplorar = 'FAVORITOS' | 'MODELOS' | 'PROTOCOLOS' | 'CATALOGO';

const ABAS: Array<{ id: AbaExplorar; rotulo: string; icone: typeof Star }> = [
  { id: 'FAVORITOS', rotulo: 'Favoritos', icone: Star },
  { id: 'MODELOS', rotulo: 'Meus modelos', icone: BookmarkCheck },
  { id: 'PROTOCOLOS', rotulo: 'Protocolos', icone: ClipboardList },
  { id: 'CATALOGO', rotulo: 'Catálogo', icone: LayoutGrid },
];

interface Props {
  aba: AbaExplorar;
  onAba: (aba: AbaExplorar) => void;
  onPrescrever: (med: MedicamentoDef, dose: number) => void;
  onAplicarProtocolo: (p: ProtocoloQueixa, v: VersaoProtocolo) => void;
  onAplicarModelo: (m: ModeloReceita) => void;
}

export default function PainelExplorar({ aba, onAba, onPrescrever, onAplicarProtocolo, onAplicarModelo }: Props) {
  const favoritos = useAtalhosReceitaStore((s) => s.favoritos);
  const modelos = useAtalhosReceitaStore((s) => s.modelos);
  const salvarModelo = useAtalhosReceitaStore((s) => s.salvarModelo);
  const removerModelo = useAtalhosReceitaStore((s) => s.removerModelo);
  const importar = useAtalhosReceitaStore((s) => s.importar);
  const medicamentos = useReceitaStore((s) => s.medicamentos);
  const [nomeModelo, setNomeModelo] = useState('');
  const arquivoRef = useRef<HTMLInputElement>(null);

  const itensNaReceita = medicamentos.filter((m) => m.principioAtivo.trim() || m.nomeDigitado.trim()).length;

  const favoritosResolvidos = favoritos.flatMap((chave) => {
    const [id, dose] = chave.split('|');
    const med = getMedicamento(id);
    return med ? [{ chave, med, dose: Number(dose) || 0 }] : [];
  });

  const exportar = () => {
    const { favoritos: f, usos, modelos: m, historico } = useAtalhosReceitaStore.getState();
    const dados = { versao: 1, exportadoEm: new Date().toISOString(), atalhos: { favoritos: f, usos, modelos: m, historico }, prescritor: usePrescritorStore.getState().prescritor };
    const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `receituario-atalhos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lerArquivo = async (arquivo: File) => {
    try {
      const dados = JSON.parse(await arquivo.text());
      if (dados?.versao !== 1 || !dados.atalhos) throw new Error('formato');
      importar(dados.atalhos);
      if (dados.prescritor) usePrescritorStore.getState().setPrescritor(dados.prescritor);
      toast.success('Atalhos importados: favoritos, modelos e histórico somados aos deste aparelho.');
    } catch {
      toast.error('Arquivo inválido. Use um arquivo exportado por este receituário.');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex gap-1 p-1.5 border-b border-gray-100 overflow-x-auto">
        {ABAS.map(({ id, rotulo, icone: Icone }) => (
          <button
            key={id}
            type="button"
            onClick={() => onAba(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
              aba === id ? 'bg-indigo-50 text-indigo-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icone size={15} /> {rotulo}
            {id === 'FAVORITOS' && favoritos.length > 0 && <span className="text-xs text-gray-400">{favoritos.length}</span>}
            {id === 'MODELOS' && modelos.length > 0 && <span className="text-xs text-gray-400">{modelos.length}</span>}
          </button>
        ))}
      </div>

      <div className="p-4">
        {aba === 'FAVORITOS' &&
          (favoritosResolvidos.length === 0 ? (
            <p className="text-sm text-gray-500">
              Toque na ⭐ de um item da receita para fixar aquela dose aqui. Favoritos também sobem para o topo da busca.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favoritosResolvidos.map(({ chave, med, dose }) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => onPrescrever(med, dose)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm font-semibold text-gray-800 hover:border-amber-400"
                >
                  <Star size={13} className="fill-amber-400 text-amber-500" />
                  {med.nome.replace(/\s+\d.*$/, '')} {dosesDe(med)[dose]?.rotulo}
                </button>
              ))}
            </div>
          ))}

        {aba === 'MODELOS' && (
          <div className="space-y-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!nomeModelo.trim() || !itensNaReceita) return;
                salvarModelo(nomeModelo, medicamentos);
                toast.success(`Modelo "${nomeModelo.trim()}" salvo com ${itensNaReceita} item(ns).`);
                setNomeModelo('');
              }}
            >
              <input
                value={nomeModelo}
                onChange={(e) => setNomeModelo(e.target.value)}
                placeholder={itensNaReceita ? `Nome do modelo (ex.: ITU mulher) — salva os ${itensNaReceita} itens atuais` : 'Adicione itens à receita para salvar como modelo'}
                disabled={!itensNaReceita}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!nomeModelo.trim() || !itensNaReceita}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Save size={15} /> Salvar
              </button>
            </form>

            {modelos.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum modelo ainda. Monte uma receita que você repete muito e salve aqui; depois ela aparece também na busca pelo nome.</p>
            ) : (
              <ul className="space-y-2">
                {modelos.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                    <button type="button" onClick={() => onAplicarModelo(m)} className="flex-1 text-left">
                      <span className="block font-semibold text-sm text-gray-900">{m.nome}</span>
                      <span className="block text-xs text-gray-500 truncate">{m.itens.map((i) => i.principioAtivo || i.nomeDigitado).join(' · ')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm(`Apagar o modelo "${m.nome}"?`)) removerModelo(m.id); }}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      aria-label={`Apagar ${m.nome}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Favoritos, modelos e histórico ficam neste aparelho.</span>
              <button type="button" onClick={exportar} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <Download size={13} /> Exportar
              </button>
              <button type="button" onClick={() => arquivoRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <Upload size={13} /> Importar
              </button>
              <input
                ref={arquivoRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) lerArquivo(f);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        )}

        {aba === 'PROTOCOLOS' && <ListaProtocolos onAplicar={onAplicarProtocolo} />}

        {aba === 'CATALOGO' && <GuiaPrescricaoRapida onPrescrever={onPrescrever} />}
      </div>
    </div>
  );
}
