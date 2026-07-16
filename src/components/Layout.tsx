import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, GraduationCap, List, Target, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading } = useApp();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const navigation = [
    { name: 'Calendario', href: '/', icon: CalendarDays },
    { name: 'Técnicas', href: '/tecnicas', icon: GraduationCap },
    { name: 'Entrenos', href: '/entrenamientos', icon: List },
    { name: 'Objetivos', href: '/objetivos', icon: Target },
  ];

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-dark-bg text-dark-text overflow-hidden">
      {/* Mobile Top Header */}
      <header className="flex-none h-14 px-4 border-b border-dark-border bg-dark-card/95 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-sm text-sm">
            🥋
          </span>
          <span className="text-base font-black tracking-widest text-white uppercase">osssApp</span>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
          )}
          <button 
            onClick={handleLogout}
            className="p-2 text-dark-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-3xl mx-auto w-full p-4 pb-24 md:pb-6 space-y-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="flex-none fixed bottom-0 left-0 right-0 h-16 border-t border-dark-border bg-dark-card/95 backdrop-blur-xl flex items-center justify-around px-2 z-30 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-primary scale-105' : 'text-dark-muted hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-full mb-0.5 ${isActive ? 'bg-primary/15 shadow-[0_0_15px_rgba(225,29,72,0.2)]' : ''}`}>
                 <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-dark-muted'}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-primary' : 'text-dark-muted'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
