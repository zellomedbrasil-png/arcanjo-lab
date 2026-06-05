import { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Eye, EyeOff, ExternalLink, Settings } from 'lucide-react';
import { toast } from '../../lib/toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [groqKey, setGroqKey] = useState('');

  const [showGemini, setShowGemini] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [showGroq, setShowGroq] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(localStorage.getItem('arcanjo_gemini_key') || '');
      setOpenRouterKey(localStorage.getItem('arcanjo_openrouter_key') || '');
      setGroqKey(localStorage.getItem('arcanjo_groq_key') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      if (geminiKey.trim()) {
        localStorage.setItem('arcanjo_gemini_key', geminiKey.trim());
      } else {
        localStorage.removeItem('arcanjo_gemini_key');
      }

      if (openRouterKey.trim()) {
        localStorage.setItem('arcanjo_openrouter_key', openRouterKey.trim());
      } else {
        localStorage.removeItem('arcanjo_openrouter_key');
      }

      if (groqKey.trim()) {
        localStorage.setItem('arcanjo_groq_key', groqKey.trim());
      } else {
        localStorage.removeItem('arcanjo_groq_key');
      }

      toast.success('Configurações de API salvas com sucesso!');
      onClose();
      // Recarrega a página rapidamente para reiniciar instâncias dos clientes de IA
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      toast.error('Erro ao salvar as configurações.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-text/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-neutral-border shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-border bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            <span className="text-sm font-bold text-neutral-text font-display">Configurações de API</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-border text-neutral-text-muted hover:text-neutral-text transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-3 text-xs text-indigo-800 leading-relaxed">
            <ShieldCheck size={18} className="text-indigo-650 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Segurança de Dados local</p>
              <p className="text-indigo-700/90">
                Suas chaves são salvas exclusivamente no seu navegador atual (localStorage). Elas nunca são enviadas para nossos servidores externos.
              </p>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-text flex items-center gap-1.5">
                <Key size={13} className="text-neutral-text-muted" />
                Google Gemini API Key
              </label>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-semibold"
              >
                Obter Chave <ExternalLink size={8} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Ex: AIzaSy..."
                className="w-full pl-3 pr-10 py-2.5 bg-neutral-bg border border-neutral-border rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-2.5 text-neutral-text-muted hover:text-neutral-text"
              >
                {showGemini ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[9px] text-neutral-text-muted">
              Necessário para rodar a Gemini diretamente na API do Google (2x mais rápida).
            </p>
          </div>

          {/* OpenRouter API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-text flex items-center gap-1.5">
                <Key size={13} className="text-neutral-text-muted" />
                OpenRouter API Key
              </label>
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-semibold"
              >
                Obter Chave <ExternalLink size={8} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenRouter ? 'text' : 'password'}
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="Ex: sk-or-v1-..."
                className="w-full pl-3 pr-10 py-2.5 bg-neutral-bg border border-neutral-border rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenRouter(!showOpenRouter)}
                className="absolute right-3 top-2.5 text-neutral-text-muted hover:text-neutral-text"
              >
                {showOpenRouter ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[9px] text-neutral-text-muted">
              Usado para rodar os modelos Claude 3.5 Sonnet, Claude 3.5 Haiku, GPT-4o Mini e DeepSeek V3.
            </p>
          </div>

          {/* Groq API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-text flex items-center gap-1.5">
                <Key size={13} className="text-neutral-text-muted" />
                Groq API Key
              </label>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-semibold"
              >
                Obter Chave <ExternalLink size={8} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showGroq ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="Ex: gsk_..."
                className="w-full pl-3 pr-10 py-2.5 bg-neutral-bg border border-neutral-border rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-2.5 text-neutral-text-muted hover:text-neutral-text"
              >
                {showGroq ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[9px] text-neutral-text-muted">
              Necessário para rodar os modelos ultrarrápidos Llama 3.3 70B e Llama 3.1 8B.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-border bg-gray-50/50 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-neutral-bg border border-neutral-border text-neutral-text text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}
