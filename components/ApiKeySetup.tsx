import React, { useState } from 'react';
<parameter name="X, Key, ExternalLink, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ApiKeySetupProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey?: string;
  onSave: (apiKey: string) => Promise<void>;
  userName?: string;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ 
  isOpen, 
  onClose, 
  currentApiKey,
  onSave,
  userName
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Por favor ingresa tu API key');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSave(apiKey.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Key size={20} className="text-white" />
            </div>
            <h3 className="font-black text-white uppercase tracking-widest text-sm">
              Configurar API Key de Gemini
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Bienvenida personalizada */}
          {userName && (
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-xl">
              <p className="text-sm text-blue-300">
                👋 Hola <span className="font-bold">{userName}</span>, necesitas tu propia API key de Google Gemini para usar la aplicación.
              </p>
            </div>
          )}

          {/* Por qué necesitas tu propia API key */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" />
              ¿Por qué necesito mi propia API key?
            </h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Cada usuario paga solo por su propio uso (no compartes costos)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Google ofrece <span className="font-bold text-green-400">cuota gratuita generosa</span> cada mes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Tus datos y cursos son privados y seguros</span>
              </li>
            </ul>
          </div>

          {/* Instrucciones paso a paso */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">
              📋 Cómo obtener tu API key (3 pasos simples)
            </h4>

            {/* Paso 1 */}
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white mb-2">Abre Google AI Studio</p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    <span>Ir a Google AI Studio</span>
                    <ExternalLink size={16} />
                  </a>
                  <p className="text-xs text-slate-400 mt-2">
                    Se abrirá en una nueva pestaña. Inicia sesión con tu cuenta de Google.
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white mb-2">Crea tu API key</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Haz clic en <span className="font-bold text-orange-400">"Create API key"</span></li>
                    <li>• Selecciona un proyecto o crea uno nuevo</li>
                    <li>• Google generará tu clave automáticamente</li>
                  </ul>
                  <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <p className="text-xs text-yellow-300">
                      💡 <span className="font-bold">Tip:</span> La API key empieza con "AIza..." y tiene unos 39 caracteres
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white mb-2">Copia y pega tu clave aquí</p>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setError('');
                      }}
                      placeholder="AIza..."
                      className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl py-3 px-4 pr-12 text-white focus:border-orange-500 transition-all outline-none font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    >
                      {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Tu clave se guarda de forma segura y solo tú puedes verla.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información sobre costos */}
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-xl">
            <h4 className="font-bold text-green-300 mb-2 flex items-center gap-2">
              <CheckCircle size={18} />
              💰 Sobre los costos
            </h4>
            <ul className="text-sm text-green-200 space-y-1">
              <li>• <span className="font-bold">Cuota gratuita:</span> 1,500 peticiones/día (más que suficiente)</li>
              <li>• <span className="font-bold">Si excedes:</span> Costos muy bajos (~$0.001 por petición)</li>
              <li>• <span className="font-bold">Control total:</span> Puedes configurar límites en Google Cloud</li>
            </ul>
            <a 
              href="https://ai.google.dev/pricing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-green-400 hover:underline mt-2"
            >
              <span>Ver precios oficiales</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900/30 border border-green-700 rounded-xl flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              <p className="text-sm text-green-400 font-bold">¡API key guardada correctamente!</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !apiKey.trim()}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Guardar y Continuar</span>
                </>
              )}
            </button>
          </div>

          {/* Nota de seguridad */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              🔒 Tu API key se almacena de forma segura en Firebase y nunca se comparte con otros usuarios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
