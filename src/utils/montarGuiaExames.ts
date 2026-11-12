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
 * Item da guia com o que vale para qualquer origem (protocolo ou painel): código
 * e valor no convênio, alertas de código a conferir e de fora da tabela. Exame
 * fora da tabela vem desmarcado, porque não seria pago.
 */
function itemDaGuia(exame: string, convenio: ConvenioProtocolo): ItemGuia {
  const codigo = codigoNo(exame, convenio);
  const alertas: string[] = [];
  for (const c of CODIGOS_A_CONFERIR) {
    if (c.exames.includes(exame) && (!c.convenio || c.convenio === convenio)) alertas.push(c.mensagem);
  }
  if (!codigo) alertas.push(`Fora da tabela ${convenio}.`);
  return {
    exame,
    grupo: GRUPO_DO_EXAME[exame] ?? 'Outros',
    codigo,
    valor: PRECOS_EXAMES[exame]?.[convenio],
    marcado: !!codigo,
    alertas,
  };
}

/** Alerta de código repetido, ordem dos grupos e totais dos itens marcados. */
function fecharGuia(itens: ItemGuia[]): GuiaMontada {
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

/**
 * Guia de um painel fixo (aba Painéis): a lista vai como está, sem critérios de
 * idade nem equivalências de convênio; só código, valor, alertas e grupos.
 *
 * `manterTodos` (painéis CR, que repetem a guia impressa do convênio): o exame
 * sem código na tabela continua marcado, porque está na guia; o aviso fica para
 * o médico conferir. Sem isso ele sairia desmarcado e a guia perderia exames.
 */
export function montarGuiaPainel(exames: string[], convenio: ConvenioProtocolo, manterTodos = false): GuiaMontada {
  return fecharGuia(
    [...new Set(exames)].map((e) => {
      const item = itemDaGuia(e, convenio);
      if (!manterTodos || item.marcado) return item;
      return {
        ...item,
        marcado: true,
        alertas: item.alertas.map((a) => (a === `Fora da tabela ${convenio}.` ? `Sem código na tabela ${convenio}; consta na guia.` : a)),
      };
    })
  );
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
    const criterio = CRITERIOS_EXAMES.find(
      (c) => c.exame === exame && (!c.area || c.area.includes(ctx.area)) && (!c.sexo || c.sexo.includes(ctx.sexo))
    );

    let foraDaFaixa: string | undefined;
    if (criterio?.idade && idade !== undefined) {
      const { min, max } = criterio.idade;
      if (min !== undefined && idade < min) foraDaFaixa = `Paciente com ${idade} anos; indicado a partir de ${min}.`;
      else if (max !== undefined && idade > max) foraDaFaixa = `Paciente com ${idade} anos; indicado até ${max}.`;
    }

    itens.push({
      ...itemDaGuia(exame, ctx.convenio),
      condicional: criterio?.condicional,
      nota: criterio?.nota,
      foraDaFaixa,
      substituiu,
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

  return fecharGuia(itens);
}
