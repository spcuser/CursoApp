import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, displayName: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin,
  onRegister
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        await onLogin(email, password);
      } else {
        if (!displayName.trim()) {
          setError('El nombre es requerido');
          setLoading(false);
          return;
        }
        await onRegister(email, password, displayName);
      }
      // Cerrar modal al éxito
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="font-black text-white uppercase tracking-widest text-sm">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isLoginMode && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange-500 transition-all outline-none"
                  placeholder="Tu nombre"
                  required={!isLoginMode}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange-500 transition-all outline-none"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange-500 transition-all outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {!isLoginMode && (
              <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Procesando...</span>
            ) : (
              <>
                {isLoginMode ? <LogIn size={18} /> : <UserPlus size={18} />}
                <span>{isLoginMode ? 'Entrar' : 'Registrarse'}</span>
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-700 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-slate-400 hover:text-orange-500 transition-colors"
            >
              {isLoginMode ? (
                <>¿No tienes cuenta? <span className="font-bold">Regístrate</span></>
              ) : (
                <>¿Ya tienes cuenta? <span className="font-bold">Inicia sesión</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
