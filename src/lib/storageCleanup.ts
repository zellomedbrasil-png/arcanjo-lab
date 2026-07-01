// Limpeza one-time de estado legado no localStorage.
// Roda na inicialização do app (antes do render) e é idempotente:
// só executa quando a versão gravada difere de STORAGE_VERSION.
//
// NUNCA tocar aqui em dados clínicos ou chaves do usuário:
// arcanjo_gemini_key, arcanjo_openrouter_key, arcanjo_groq_key,
// arcanjo-lab-recent-patients, arcanjo-lab-receita-draft,
// arcanjo-lab-documento-draft e os campos clínicos do pedido.

const STORAGE_VERSION_KEY = 'arcanjo_storage_version';
const STORAGE_VERSION = '3'; // incrementar a cada nova limpeza

export function runStorageCleanup(): void {
  try {
    if (localStorage.getItem(STORAGE_VERSION_KEY) === STORAGE_VERSION) return;

    // 1. Chave Anthropic antiga (comprometida) gravada por versões antigas do app.
    //    A chave atual vive somente no servidor (/api/claude).
    localStorage.removeItem('arcanjo_anthropic_key');

    // 2. Reset one-time do modelo selecionado — volta ao padrão claude-sonnet-5.
    localStorage.removeItem('arcanjo_selected_model');

    // 3. Badge de modelo antigo dentro do draft persistido do useAppStore.
    //    Zera apenas state.iaModel, preservando todos os dados clínicos do rascunho.
    try {
      const raw = localStorage.getItem('arcanjo-lab-pedido-draft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.state && typeof draft.state === 'object' && draft.state.iaModel) {
          draft.state.iaModel = '';
          localStorage.setItem('arcanjo-lab-pedido-draft', JSON.stringify(draft));
        }
      }
    } catch {
      // JSON inválido ou inesperado — não tocar no rascunho.
    }

    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
  } catch {
    // localStorage indisponível (ex.: modo privativo restrito) — segue sem limpeza.
  }
}
