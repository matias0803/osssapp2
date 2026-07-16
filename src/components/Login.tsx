import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase'; // Asegúrate de que la ruta coincida con tu archivo
import { LogIn, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Firebase valida las credenciales
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Extraemos el usuario
      const user = userCredential.user;

      // 3. ¡EL PASO CRÍTICO! Pedimos el Token JWT para nuestro backend
      const token = await user.getIdToken();
      
      console.log('✅ UID del usuario:', user.uid);
      console.log('🔑 TOKEN JWT PARA NESTJS:', token);
      
      // Navigate to home after successful login
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Credenciales incorrectas o el usuario no existe.');
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
            <LogIn size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">INICIAR SESIÓN</h2>
          <p className="text-xs text-dark-muted mt-2 font-medium">Ingresa al tatami para ver tus metas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? 'Cargando...' : 'Entrar'}
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
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};