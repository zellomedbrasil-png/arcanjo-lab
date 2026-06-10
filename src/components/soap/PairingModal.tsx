import { useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { toast } from '../../lib/toast';

export default function PairingModal() {
  const {
    syncRoomCode,
    syncStatus,
    isPairingModalOpen,
    setIsPairingModalOpen,
    setSyncRoomCode,
    setSyncStatus,
  } = useAppStore();

  // Generates a room code when the modal opens if it doesn't exist
  useEffect(() => {
    if (isPairingModalOpen && !syncRoomCode) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSyncRoomCode(code);
      setSyncStatus('waiting');
    }
  }, [isPairingModalOpen, syncRoomCode, setSyncRoomCode, setSyncStatus]);

  if (!isPairingModalOpen || !syncRoomCode) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/gravador?room=${syncRoomCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Link de pareamento copiado!');
  };

  const handleClose = () => {
    setIsPairingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-md w-full mx-4 space-y-6 animate-scale-in relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2">
          <div className="mx-auto bg-indigo-50 text-indigo-600 p-3 rounded-2xl w-fit">
            <Smartphone size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-display">Gravar com Celular</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Transforme seu celular em um microfone inteligente. Grave a consulta à distância e os dados serão preenchidos no computador em tempo real.
          </p>
        </div>

        {/* Status box */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${
              syncStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              syncStatus === 'recording' ? 'bg-red-500 animate-pulse' :
              syncStatus === 'transcribing' ? 'bg-indigo-500 animate-spin border border-t-transparent' :
              'bg-amber-500 animate-pulse'
            }`} />
            <span className="text-xs font-semibold text-gray-700">
              {syncStatus === 'waiting' && 'Aguardando celular se conectar...'}
              {syncStatus === 'connected' && 'Celular conectado e pronto!'}
              {syncStatus === 'recording' && 'Celular Gravando consulta...'}
              {syncStatus === 'transcribing' && 'Celular processando áudio...'}
            </span>
          </div>
          {syncStatus !== 'waiting' && (
            <span className="text-[10px] bg-green-100 text-green-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Sincronizado
            </span>
          )}
        </div>

        {/* QR Code and Code box */}
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-3 shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                `${window.location.origin}/gravador?room=${syncRoomCode}`
              )}`}
              alt="QR Code de pareamento"
              className="w-40 h-40 object-contain rounded-lg"
            />
          </div>

          <div className="text-center space-y-1 w-full">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Código da Sala</span>
            <div className="bg-indigo-50 text-indigo-700 rounded-xl py-2 px-4 text-xl font-black font-mono tracking-widest inline-block select-all shadow-sm border border-indigo-100">
              {syncRoomCode.slice(0, 3)} {syncRoomCode.slice(3)}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            Copiar Link de Pareamento
          </button>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">
              Abra a câmera do seu celular, escaneie o código acima e comece a falar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
