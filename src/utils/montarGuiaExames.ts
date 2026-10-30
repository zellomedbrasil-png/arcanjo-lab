import { CATEGORIAS_EXAMES } from '../data/exames';
import { PRECOS_EXAMES } from '../data/precosExames';
import {
  BLOCOS_PROTOCOLO_EXAMES,
  CODIGOS_A_CONFERIR,
  CRITERIOS_EXAMES,
  EQUIVALENCIAS_CONVENIO,
  GRUPO_DO_EXAME,
  ORDEM_GRUPOS,
  type ConvenioProtocolo,
  type Especialidade,
  type QuandoProtocolo,
  type SexoProtocolo,
  type TipoConsulta,
} from '../data/protocolosExames';

export interface ContextoGuia {
  area: Especialidade;
  consulta: TipoConsulta;
  sexo: SexoProtocolo;
  convenio: ConvenioProtocolo;
}

export interface ItemGuia {
  exame: string;
  grupo: string;
  /** Código do exame no convênio do contexto; vazio = fora da tabela. */
  codigo: string;
  valor?: number;
  /** false só quando o exame não consta na tabela do convênio (não seria pago). */
  marcado: boolean;
  condicional?: string;
  nota?: string;
  /** Idade do paciente fora da faixa do critério (o exame continua marcado). */
  foraDaFaixa?: string;
  /** Pedido original trocado pelo equivalente da tabela do convênio. */
  substituiu?: { exame: string; nota: string };
  alertas: string[];
}

export interface GuiaMontada {
  itens: ItemGuia[];
  total: number;
  semValor: number;
}

const CATALOGO = new Map(CATEGORIAS_EXAMES.flatMap((c) => c.exames.map((e) => [e.nome, e] as const)));

const codigoNo = (exame: string, convenio: ConvenioProtocolo) => {
  const e = CATALOGO.get(exame);
  if (!e) return '';
  return convenio === 'ISSEC' ? e.codIssec : e.codIpm;
};

const vale = (q: QuandoProtocolo | undefined, ctx: ContextoGuia) =>
  !q ||
  ((!q.area || q.area.includes(ctx.area)) &&
    (!q.consulta || q.consulta.includes(ctx.consulta)) &&
    (!q.sexo || q.sexo.includes(ctx.sexo)) &&
    (!q.convenio || q.convenio.includes(ctx.convenio)));

const ordemGrupo = (grupo: string) => {
  const i = ORDEM_GRUPOS.indexOf(grupo);
  return i === -1 ? ORDEM_GRUPOS.length : i;
};

/** Idade em anos a partir do texto livre do cadastro ("67", "67 anos"). */
export function lerIdade(texto: string): number | undefined {
  const n = parseInt(texto, 10);
  return Number.isFinite(n) && n > 0 && n < 130 ? n : undefined;
}

/**
 * Monta a guia do atendimento a partir dos blocos de protocolo.
 * Ordem das regras: blocos que valem → equivalência do convênio → sem duplicata
 * → critérios e alertas → ordem dos grupos.
 */
export function montarGuiaExames(ctx: ContextoGuia, idade?: number): GuiaMontada {
  const pedidos: string[] = [];
  for (const bloco of BLOCOS_PROTOCOLO_EXAMES) {
    if (!vale(bloco.quando, ctx)) continue;
    for (const item of bloco.itens) if (vale(item.quando, ctx)) pedidos.push(item.exame);
  }

  const itens: ItemGuia[] = [];
  const vistos = new Set<string>();
  const incluir = (exame: string, substituiu?: ItemGuia['substituiu']) => {
    if (vistos.has(exame)) return;
    vistos.add(exame);
    const codigo = codigoNo(exame, ctx.convenio);
    const criterio = CRITERIOS_EXAMES.find(
      (c) => c.exame === exame && (!c.area || c.area.includes(ctx.area)) && (!c.sexo || c.sexo.includes(ctx.sexo))
    );
    const alertas: string[] = [];
    for (const c of CODIGOS_A_CONFERIR) {
      if (c.exames.includes(exame) && (!c.convenio || c.convenio === ctx.convenio)) alertas.push(c.mensagem);
    }
    if (!codigo) alertas.push(`Fora da tabela ${ctx.convenio}.`);

    let foraDaFaixa: string | undefined;
    if (criterio?.idade && idade !== undefined) {
      const { min, max } = criterio.idade;
      if (min !== undefined && idade < min) foraDaFaixa = `Paciente com ${idade} anos; indicado a partir de ${min}.`;
      else if (max !== undefined && idade > max) foraDaFaixa = `Paciente com ${idade} anos; indicado até ${max}.`;
    }

    itens.push({
      exame,
      grupo: GRUPO_DO_EXAME[exame] ?? 'Outros',
      codigo,
      valor: PRECOS_EXAMES[exame]?.[ctx.convenio],
      marcado: !!codigo,
      condicional: criterio?.condicional,
      nota: criterio?.nota,
      foraDaFaixa,
      substituiu,
      alertas,
    });
  };

  for (const exame of pedidos) {
    if (codigoNo(exame, ctx.convenio)) {
      incluir(exame);
      continue;
    }
    const eq = EQUIVALENCIAS_CONVENIO.find((e) => e.exame === exame && e.convenio === ctx.convenio);
    if (eq && eq.usar.length) eq.usar.forEach((u) => incluir(u, { exame, nota: eq.nota }));
    else incluir(exame, eq ? { exame, nota: eq.nota } : undefined);
  }

  // Dois exames diferentes com o mesmo código na mesma guia = cobrança dupla ou glosa.
  const porCodigo = new Map<string, ItemGuia[]>();
  for (const i of itens) if (i.codigo) porCodigo.set(i.codigo, [...(porCodigo.get(i.codigo) ?? []), i]);
  for (const [cod, grupo] of porCodigo) {
    if (grupo.length < 2) continue;
    for (const i of grupo) {
      i.alertas.push(`Mesmo código ${cod} de ${grupo.filter((g) => g !== i).map((g) => g.exame).join(', ')} nesta guia: peça só um.`);
    }
  }

  const ordenados = itens
    .map((item, i) => ({ item, i }))
    .sort((a, b) => ordemGrupo(a.item.grupo) - ordemGrupo(b.item.grupo) || a.i - b.i)
    .map(({ item }) => item);

  const marcados = ordenados.filter((i) => i.marcado);
  const total = Math.round(marcados.reduce((s, i) => s + (i.valor ?? 0), 0) * 100) / 100;
  const semValor = marcados.filter((i) => i.valor === undefined).length;
  return { itens: ordenados, total, semValor };
}
