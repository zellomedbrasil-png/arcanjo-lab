-- Tabela de Consultas Gravadas (Histórico sincronizado)
CREATE TABLE IF NOT EXISTS consultas_gravadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_key TEXT NOT NULL,
  nome TEXT NOT NULL,
  queixa TEXT NOT NULL,
  data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE consultas_gravadas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para acesso público (anônimo) usando a chave de sincronização
CREATE POLICY "Permitir leitura pública" 
  ON consultas_gravadas FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" 
  ON consultas_gravadas FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir deleção pública" 
  ON consultas_gravadas FOR DELETE USING (true);

-- Criar índice para otimização de consultas por sync_key
CREATE INDEX IF NOT EXISTS idx_consultas_gravadas_sync_key ON consultas_gravadas(sync_key);
