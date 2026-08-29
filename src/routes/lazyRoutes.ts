// src/routes/lazyRoutes.ts
// Fonte única dos imports dinâmicos de cada rota.
//
// As rotas são code-split (cada página vira um chunk próprio), o que deixa o
// primeiro carregamento leve — mas cobra o preço no primeiro clique de cada
// menu: o chunk só começa a baixar depois do clique, e o usuário vê a tela de
// transição. Como o mesmo import é usado pelo React.lazy() e pelo prefetch,
// passar o mouse no menu já baixa o chunk e o clique fica instantâneo.
//
// O import() do Vite é idempotente e cacheado: chamar de novo devolve o módulo
// já carregado, sem nova requisição — então prefetch repetido é inofensivo.

export const routeImports = {
  '/prontuario': () => import('../pages/Prontuario'),
  '/exames': () => import('../pages/ExamesLaboratoriais'),
  '/procedimentos': () => import('../pages/ProcedimentosEletivos'),
  '/servicos': () => import('../pages/Servicos'),
  '/receita': () => import('../pages/NovaReceita'),
  '/manipulados': () => import('../pages/Manipulados'),
  '/documentos': () => import('../pages/Documentos'),
} as const;

export type RotaPrefetchavel = keyof typeof routeImports;

/**
 * Dispara o download do chunk da rota, se houver. Silencioso de propósito:
 * prefetch que falha (offline, chunk trocado por um deploy novo) não pode
 * quebrar a navegação — o clique real refaz o import e trata o erro lá.
 */
export function prefetchRota(path: string): void {
  const importar = routeImports[path as RotaPrefetchavel];
  if (importar) void importar().catch(() => {});
}
