export interface Tecnica {
  id: string;
  nombre: string;
  nota: string;
  gi: boolean;
  tag: string[];
  videoUrl?: string;
  conexiones?: string[];
}

export interface CreateTecnicaDto {
  nombre: string;
  nota: string;
  gi: boolean;
  tag: string[];
  videoUrl?: string;
  conexiones?: string[];
}

export interface UpdateTecnicaDto {
  nombre?: string;
  nota?: string;
  gi?: boolean;
  tag?: string[];
  videoUrl?: string;
  conexiones?: string[];
}

export interface GamePlan {
  id: string;
  titulo: string;
  tecnicasIds: string[];
}

export interface CreateGamePlanDto {
  titulo: string;
  tecnicasIds: string[];
}

export interface UpdateGamePlanDto {
  titulo?: string;
  tecnicasIds?: string[];
}

export interface Entrenamiento {
  id: string;
  fecha: string; // ISO date string (YYYY-MM-DD or full ISO format)
  objetivo: string;
  gi: boolean;
  tecnicaFocoId?: string;
  repeticionesEfectivas?: number;
  posicionAtrapado?: string;
  temaClase?: string;
}

export interface CreateEntrenamientoDto {
  fecha: string; // YYYY-MM-DD
  objetivo: string;
  gi: boolean;
  tecnicaFocoId?: string;
  repeticionesEfectivas?: number;
  posicionAtrapado?: string;
  temaClase?: string;
}

export interface UpdateEntrenamientoDto {
  fecha?: string;
  objetivo?: string;
  gi?: boolean;
  tecnicaFocoId?: string;
  repeticionesEfectivas?: number;
  posicionAtrapado?: string;
  temaClase?: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDaysTrained: number;
  lastTrainingDate: string | null;
}

export interface Objetivo {
  id: string;
  titulo: string;
  tipo: 'corto' | 'mediano' | 'largo';
  completado: boolean;
  fechaCreacion?: string;
}

export interface CreateObjetivoDto {
  titulo: string;
  tipo: 'corto' | 'mediano' | 'largo';
  completado?: boolean;
}

export interface UpdateObjetivoDto {
  titulo?: string;
  tipo?: 'corto' | 'mediano' | 'largo';
  completado?: boolean;
}
