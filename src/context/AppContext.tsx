import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Tecnica, 
  CreateTecnicaDto, 
  UpdateTecnicaDto, 
  Entrenamiento, 
  CreateEntrenamientoDto, 
  UpdateEntrenamientoDto,
  StreakInfo,
  Objetivo,
  CreateObjetivoDto,
  UpdateObjetivoDto,
  GamePlan,
  CreateGamePlanDto,
  UpdateGamePlanDto
} from '../types';
import { apiTecnicas, apiEntrenamientos, apiObjetivos, apiGamePlans } from '../api';
import { parseISO, format, differenceInCalendarDays, subDays } from 'date-fns';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

interface AppContextType {
  tecnicas: Tecnica[];
  entrenamientos: Entrenamiento[];
  gameplans: GamePlan[];
  loading: boolean;
  error: string | null;
  user: User | null;
  authLoading: boolean;
  
  // Techniques CRUD
  getTecnicas: (filtros?: { nombre?: string; gi?: boolean; tag?: string }) => Promise<void>;
  addTecnica: (dto: CreateTecnicaDto) => Promise<Tecnica>;
  editTecnica: (id: string, dto: UpdateTecnicaDto) => Promise<Tecnica>;
  removeTecnica: (id: string) => Promise<void>;

  // Workouts CRUD
  getEntrenamientos: (filtros?: { fecha?: string; gi?: boolean; objetivo?: string }) => Promise<void>;
  addEntrenamiento: (dto: CreateEntrenamientoDto) => Promise<Entrenamiento>;
  editEntrenamiento: (id: string, dto: UpdateEntrenamientoDto) => Promise<Entrenamiento>;
  removeEntrenamiento: (id: string) => Promise<void>;

  // Objetivos CRUD
  objetivos: Objetivo[];
  getObjetivos: () => Promise<void>;
  addObjetivo: (dto: CreateObjetivoDto) => Promise<Objetivo>;
  editObjetivo: (id: string, dto: UpdateObjetivoDto) => Promise<Objetivo>;
  removeObjetivo: (id: string) => Promise<void>;

  // GamePlans CRUD
  getGamePlans: () => Promise<void>;
  addGamePlan: (dto: CreateGamePlanDto) => Promise<GamePlan>;
  editGamePlan: (id: string, dto: UpdateGamePlanDto) => Promise<GamePlan>;
  removeGamePlan: (id: string) => Promise<void>;

  // Computed Stats
  stats: {
    totalWorkouts: number;
    totalTechniques: number;
    giWorkouts: number;
    nogiWorkouts: number;
    giTechniques: number;
    nogiTechniques: number;
    allTags: string[];
  };
  streak: StreakInfo;
  calendarData: { date: string; count: number; level: number }[];
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [gameplans, setGamePlans] = useState<GamePlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Techniques
  const getTecnicas = useCallback(async (filtros?: { nombre?: string; gi?: boolean; tag?: string }) => {
    try {
      setLoading(true);
      const data = await apiTecnicas.getAll(filtros);
      setTecnicas(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar las técnicas. Revisa la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Workouts
  const getEntrenamientos = useCallback(async (filtros?: { fecha?: string; gi?: boolean; objetivo?: string }) => {
    try {
      setLoading(true);
      const data = await apiEntrenamientos.getAll(filtros);
      setEntrenamientos(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar los entrenamientos. Revisa la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Objetivos
  const getObjetivos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiObjetivos.getAll();
      setObjetivos(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar los objetivos.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch GamePlans
  const getGamePlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGamePlans.getAll();
      setGamePlans(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar los game plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      const [tData, eData, oData, gData] = await Promise.all([
        apiTecnicas.getAll(),
        apiEntrenamientos.getAll(),
        apiObjetivos.getAll(),
        apiGamePlans.getAll()
      ]);
      setTecnicas(tData);
      setEntrenamientos(eData);
      setObjetivos(oData);
      setGamePlans(gData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Error al sincronizar con el servidor de osssApp.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data ONLY if user is authenticated
  useEffect(() => {
    if (user) {
      refreshAll();
    } else if (!authLoading) {
      // Clear data when logged out
      setTecnicas([]);
      setEntrenamientos([]);
      setObjetivos([]);
      setGamePlans([]);
      setLoading(false);
    }
  }, [user, authLoading, refreshAll]);

  // Techniques CRUD Operations
  const addTecnica = async (dto: CreateTecnicaDto) => {
    try {
      const newTecnica = await apiTecnicas.create(dto);
      setTecnicas(prev => [newTecnica, ...prev]);
      return newTecnica;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo guardar la técnica.');
      throw err;
    }
  };

  const editTecnica = async (id: string, dto: UpdateTecnicaDto) => {
    try {
      const updated = await apiTecnicas.update(id, dto);
      setTecnicas(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo actualizar la técnica.');
      throw err;
    }
  };

  const removeTecnica = async (id: string) => {
    try {
      await apiTecnicas.delete(id);
      setTecnicas(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error(err);
      setError('No se pudo eliminar la técnica.');
      throw err;
    }
  };

  // Workouts CRUD Operations
  const addEntrenamiento = async (dto: CreateEntrenamientoDto) => {
    try {
      const newWorkout = await apiEntrenamientos.create(dto);
      setEntrenamientos(prev => [newWorkout, ...prev]);
      return newWorkout;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo guardar el entrenamiento.');
      throw err;
    }
  };

  const editEntrenamiento = async (id: string, dto: UpdateEntrenamientoDto) => {
    try {
      const updated = await apiEntrenamientos.update(id, dto);
      setEntrenamientos(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo actualizar el entrenamiento.');
      throw err;
    }
  };

  const removeEntrenamiento = async (id: string) => {
    try {
      await apiEntrenamientos.delete(id);
      setEntrenamientos(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.error(err);
      setError('No se pudo eliminar el entrenamiento.');
      throw err;
    }
  };

  // Objetivos CRUD Operations
  const addObjetivo = async (dto: CreateObjetivoDto) => {
    try {
      const newObj = await apiObjetivos.create(dto);
      setObjetivos(prev => [newObj, ...prev]);
      return newObj;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo guardar el objetivo.');
      throw err;
    }
  };

  const editObjetivo = async (id: string, dto: UpdateObjetivoDto) => {
    try {
      const updated = await apiObjetivos.update(id, dto);
      setObjetivos(prev => prev.map(o => o.id === id ? updated : o));
      return updated;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo actualizar el objetivo.');
      throw err;
    }
  };

  const removeObjetivo = async (id: string) => {
    try {
      await apiObjetivos.delete(id);
      setObjetivos(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      console.error(err);
      setError('No se pudo eliminar el objetivo.');
      throw err;
    }
  };

  // GamePlans CRUD Operations
  const addGamePlan = async (dto: CreateGamePlanDto) => {
    try {
      const newGp = await apiGamePlans.create(dto);
      setGamePlans(prev => [newGp, ...prev]);
      return newGp;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo guardar el game plan.');
      throw err;
    }
  };

  const editGamePlan = async (id: string, dto: UpdateGamePlanDto) => {
    try {
      const updated = await apiGamePlans.update(id, dto);
      setGamePlans(prev => prev.map(g => g.id === id ? updated : g));
      return updated;
    } catch (err: any) {
      console.error(err);
      setError('No se pudo actualizar el game plan.');
      throw err;
    }
  };

  const removeGamePlan = async (id: string) => {
    try {
      await apiGamePlans.delete(id);
      setGamePlans(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      console.error(err);
      setError('No se pudo eliminar el game plan.');
      throw err;
    }
  };

  // Computed Stats
  const stats = useMemo(() => {
    const giWorkouts = entrenamientos.filter(e => e.gi).length;
    const nogiWorkouts = entrenamientos.length - giWorkouts;
    const giTechniques = tecnicas.filter(t => t.gi).length;
    const nogiTechniques = tecnicas.length - giTechniques;

    // Unique tags
    const tagsSet = new Set<string>();
    tecnicas.forEach(t => {
      if (t.tag) {
        t.tag.forEach(tag => tagsSet.add(tag.trim().toLowerCase()));
      }
    });

    return {
      totalWorkouts: entrenamientos.length,
      totalTechniques: tecnicas.length,
      giWorkouts,
      nogiWorkouts,
      giTechniques,
      nogiTechniques,
      allTags: Array.from(tagsSet),
    };
  }, [tecnicas, entrenamientos]);

  // Streak calculations (Gamified: Only counts Quality Workouts)
  const streak = useMemo<StreakInfo>(() => {
    // Quality workouts have effective reps logged
    const qualityWorkouts = entrenamientos.filter(e => e.repeticionesEfectivas && e.repeticionesEfectivas > 0);

    if (qualityWorkouts.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalDaysTrained: 0, lastTrainingDate: null };
    }

    // Get unique dates (normalized)
    const datesMap = new Map<string, Date>();
    qualityWorkouts.forEach(e => {
      try {
        const parsed = typeof e.fecha === 'string' ? parseISO(e.fecha) : new Date(e.fecha);
        const key = format(parsed, 'yyyy-MM-dd');
        datesMap.set(key, parsed);
      } catch (err) {
        console.error('Invalid date', e.fecha, err);
      }
    });

    const uniqueDates = Array.from(datesMap.values()).sort((a, b) => b.getTime() - a.getTime()); // Descending (Newest first)
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalDaysTrained: 0, lastTrainingDate: null };
    }

    const lastTrainingDate = format(uniqueDates[0], 'yyyy-MM-dd');
    const totalDaysTrained = uniqueDates.length;

    // Current Streak
    // Set "today" according to our metadata: 2026-07-15
    const today = new Date('2026-07-15T00:00:00'); 
    const yesterday = subDays(today, 1);
    
    const trainedToday = datesMap.has(format(today, 'yyyy-MM-dd'));
    const trainedYesterday = datesMap.has(format(yesterday, 'yyyy-MM-dd'));

    let currentStreak = 0;
    if (trainedToday || trainedYesterday) {
      currentStreak = 1;
      let checkDate = trainedToday ? today : yesterday;
      while (true) {
        checkDate = subDays(checkDate, 1);
        const checkKey = format(checkDate, 'yyyy-MM-dd');
        if (datesMap.has(checkKey)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Longest Streak
    const sortedDatesAsc = [...uniqueDates].reverse(); // Oldest first
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    sortedDatesAsc.forEach(currDate => {
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diff = differenceInCalendarDays(currDate, prevDate);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      prevDate = currDate;
    });

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return {
      currentStreak,
      longestStreak,
      totalDaysTrained,
      lastTrainingDate
    };
  }, [entrenamientos]);

  // Calendar contribution data formatted for `react-activity-calendar`
  const calendarData = useMemo(() => {
    // Counts per date
    const dateCounts: { [key: string]: number } = {};
    entrenamientos.forEach(e => {
      try {
        const parsed = typeof e.fecha === 'string' ? parseISO(e.fecha) : new Date(e.fecha);
        const key = format(parsed, 'yyyy-MM-dd');
        dateCounts[key] = (dateCounts[key] || 0) + 1;
      } catch (err) {
        console.error(err);
      }
    });

    // Return format: { date: 'YYYY-MM-DD', count: N, level: 0-4 }
    // react-activity-calendar levels are typically: 0 (no activity) to 4 (high activity)
    return Object.keys(dateCounts).map(dateStr => {
      const count = dateCounts[dateStr];
      let level = 1;
      if (count > 2) level = 4;
      else if (count === 2) level = 3;
      else level = 2; // single workout in a day is level 2 (solid visual representation)
      return {
        date: dateStr,
        count,
        level
      };
    });
  }, [entrenamientos]);

  return (
    <AppContext.Provider value={{
      tecnicas,
      entrenamientos,
      loading,
      error,
      user,
      authLoading,
      getTecnicas,
      addTecnica,
      editTecnica,
      removeTecnica,
      getEntrenamientos,
      addEntrenamiento,
      editEntrenamiento,
      removeEntrenamiento,
      objetivos,
      getObjetivos,
      addObjetivo,
      editObjetivo,
      removeObjetivo,
      gameplans,
      getGamePlans,
      addGamePlan,
      editGamePlan,
      removeGamePlan,
      stats,
      streak,
      calendarData,
      refreshAll
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppContextProvider');
  }
  return context;
};
