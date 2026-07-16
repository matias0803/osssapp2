import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está en uso. Por favor, inicia sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error al crear la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass rounded-3xl p-8 border border-dark-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <UserPlus size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">REGISTRARSE</h2>
          <p className="text-xs text-dark-muted mt-2 font-medium">Crea una cuenta para rastrear tu progreso</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 text-red-400 text-xs rounded-xl flex items-center gap-2 border border-red-900/50">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider pl-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50 transition-colors"
              placeholder="oss@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider pl-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 p-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-dark-border"></div>
          <span className="text-[10px] uppercase font-bold text-dark-muted tracking-widest">o</span>
          <div className="h-px flex-1 bg-dark-border"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-6 p-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          Continuar con Google
        </button>

        <div className="mt-8 text-center">
          <p className="text-xs text-dark-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
