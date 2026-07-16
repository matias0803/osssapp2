import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  GraduationCap, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  ArrowRight,
  EyeOff
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { entrenamientos, stats, streak } = useApp();
  // Navigation is mostly link-based here, no programmatic navigation

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Map of workouts by date (YYYY-MM-DD) for quick lookup
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, typeof entrenamientos>();
    entrenamientos.forEach(w => {
      try {
        const dateStr = w.fecha.substring(0, 10);
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push(w);
      } catch (e) {
        // invalid date skip
      }
    });
    return map;
  }, [entrenamientos]);

  // Blind Spot Analysis
  const blindSpot = useMemo(() => {
    const counts: Record<string, number> = {};
    let mostFrequent = '';
    let maxCount = 0;
    
    // Consider all workouts or just last 30 days. Let's use all for now.
    entrenamientos.forEach(w => {
      if (w.posicionAtrapado) {
        counts[w.posicionAtrapado] = (counts[w.posicionAtrapado] || 0) + 1;
        if (counts[w.posicionAtrapado] > maxCount) {
          maxCount = counts[w.posicionAtrapado];
          mostFrequent = w.posicionAtrapado;
        }
      }
    });

    return mostFrequent ? { posicion: mostFrequent, count: maxCount } : null;
  }, [entrenamientos]);

  // Calendar logic
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Workouts for selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedWorkouts = workoutsByDate.get(selectedDateStr) || [];

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      
      {/* Top Stats Row (Compact) */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/entrenamientos" className="glass p-3 rounded-2xl border border-dark-border flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
          <CalendarIcon size={18} className="text-primary" />
          <span className="text-[10px] text-dark-muted font-bold uppercase">Entrenos</span>
          <span className="text-xl font-black text-white leading-none">{stats.totalWorkouts}</span>
        </Link>
        <Link to="/tecnicas" className="glass p-3 rounded-2xl border border-dark-border flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
          <GraduationCap size={18} className="text-primary" />
          <span className="text-[10px] text-dark-muted font-bold uppercase">Técnicas</span>
          <span className="text-xl font-black text-white leading-none">{stats.totalTechniques}</span>
        </Link>
        <div className="glass p-3 rounded-2xl border border-dark-border flex flex-col items-center justify-center gap-1">
          <Flame size={18} className={streak.currentStreak > 0 ? "text-orange-500 animate-pulse" : "text-dark-muted"} />
          <span className="text-[10px] text-dark-muted font-bold uppercase">Racha</span>
          <span className="text-xl font-black text-white leading-none">{streak.currentStreak} d</span>
        </div>
      </div>

      {/* Blind Spot Analysis Card */}
      {blindSpot && (
        <div className="glass rounded-3xl p-4 border border-red-900/30 bg-gradient-to-br from-neutral-900 to-red-950/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-red-500">
            <EyeOff size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <EyeOff size={16} className="text-red-500" />
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Punto Ciego Detectado</h3>
            </div>
            <p className="text-sm font-medium text-white mb-2">
              Te has sentido atrapado en <span className="font-black text-red-400">"{blindSpot.posicion}"</span> {blindSpot.count} {blindSpot.count === 1 ? 'vez' : 'veces'} recientemente.
            </p>
            <p className="text-xs text-dark-muted font-bold">
              💡 Sugerencia: Dedica tus próximos rounds de sparring a empezar desde esta posición.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Calendar */}
      <div className="glass rounded-3xl p-4 border border-dark-border">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-neutral-900 active:bg-neutral-800 transition-colors">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h3 className="text-lg font-black text-white uppercase tracking-widest">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-neutral-900 active:bg-neutral-800 transition-colors">
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-black text-dark-muted uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayWorkouts = workoutsByDate.get(dayStr) || [];
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isSameDay(day, new Date());
            
            // Determine dot colors
            const hasGi = dayWorkouts.some(w => w.gi);
            const hasNoGi = dayWorkouts.some(w => !w.gi);

            return (
              <div 
                key={dayStr} 
                onClick={() => onDateClick(day)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer
                  transition-all duration-200 border
                  ${isSelected ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 
                    isTodayDate ? 'bg-neutral-900 border-dark-muted text-white' : 
                    'border-transparent hover:border-dark-border'}
                  ${!isCurrentMonth && !isSelected ? 'text-dark-muted/40' : 'text-dark-text'}
                `}
              >
                <span className={`text-sm font-bold ${isSelected || isTodayDate ? 'text-white' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {/* Dots indicator for workouts */}
                {dayWorkouts.length > 0 && (
                  <div className="absolute bottom-1.5 flex gap-0.5">
                    {hasGi && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.6)]" />}
                    {hasNoGi && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(234,88,12,0.6)]" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h4>
        </div>
        
        {selectedWorkouts.length === 0 ? (
          <div className="glass rounded-3xl p-6 border border-dark-border border-dashed flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-900/50 flex items-center justify-center mb-3 text-dark-muted">
              <CalendarIcon size={24} />
            </div>
            <p className="text-xs text-dark-muted font-medium mb-4">Ningún entrenamiento registrado para esta fecha.</p>
            <Link 
              to="/entrenamientos"
              state={{ prefillDate: selectedDateStr }}
              className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors flex items-center gap-2"
            >
              <Plus size={14} /> Registrar Entreno
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedWorkouts.map(workout => (
              <div key={workout.id} className="glass rounded-2xl p-4 border border-dark-border flex flex-col gap-2 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${workout.gi ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <div className="flex justify-between items-start pl-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    workout.gi 
                      ? 'bg-blue-600/10 text-blue-500 border border-blue-500/10' 
                      : 'bg-orange-600/10 text-orange-500 border border-orange-500/10'
                  }`}>
                    {workout.gi ? 'Gi (Kimono)' : 'No-Gi (Grappling)'}
                  </span>
                  <Link to="/entrenamientos" className="text-dark-muted hover:text-white">
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <p className="text-sm font-bold text-white pl-2">
                  {workout.objetivo}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
