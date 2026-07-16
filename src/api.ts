import axios from 'axios';
import { API_BASE_URL } from './config';
import type {
  Tecnica,
  CreateTecnicaDto,
  UpdateTecnicaDto,
  Entrenamiento,
  CreateEntrenamientoDto,
  UpdateEntrenamientoDto,
  Objetivo,
  CreateObjetivoDto,
  UpdateObjetivoDto,
  GamePlan,
  CreateGamePlanDto,
  UpdateGamePlanDto,
} from './types';

import { auth } from './config/firebase';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiTecnicas = {
  getAll: async (filtros?: { nombre?: string; gi?: boolean; tag?: string }) => {
    const response = await api.get<Tecnica[]>('/tecnicas', { params: filtros });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Tecnica>(`/tecnicas/${id}`);
    return response.data;
  },
  create: async (data: CreateTecnicaDto) => {
    const response = await api.post<Tecnica>('/tecnicas', data);
    return response.data;
  },
  update: async (id: string, data: UpdateTecnicaDto) => {
    const response = await api.patch<Tecnica>(`/tecnicas/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<boolean>(`/tecnicas/${id}`);
    return response.data;
  },
};

export const apiEntrenamientos = {
  getAll: async (filtros?: { fecha?: string; gi?: boolean; objetivo?: string }) => {
    const response = await api.get<Entrenamiento[]>('/entrenamientos', { params: filtros });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Entrenamiento>(`/entrenamientos/${id}`);
    return response.data;
  },
  create: async (data: CreateEntrenamientoDto) => {
    const response = await api.post<Entrenamiento>('/entrenamientos', {
      ...data,
      // If backend expects Date type, passing ISO string or date-only string is fine.
    });
    return response.data;
  },
  update: async (id: string, data: UpdateEntrenamientoDto) => {
    const response = await api.patch<Entrenamiento>(`/entrenamientos/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<boolean>(`/entrenamientos/${id}`);
    return response.data;
  },
};

export const apiObjetivos = {
  getAll: async () => {
    const response = await api.get<Objetivo[]>('/objetivos');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Objetivo>(`/objetivos/${id}`);
    return response.data;
  },
  create: async (data: CreateObjetivoDto) => {
    const response = await api.post<Objetivo>('/objetivos', data);
    return response.data;
  },
  update: async (id: string, data: UpdateObjetivoDto) => {
    const response = await api.patch<Objetivo>(`/objetivos/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<boolean>(`/objetivos/${id}`);
    return response.data;
  },
};

export const apiGamePlans = {
  getAll: async () => {
    const response = await api.get<GamePlan[]>('/gameplans');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<GamePlan>(`/gameplans/${id}`);
    return response.data;
  },
  create: async (data: CreateGamePlanDto) => {
    const response = await api.post<GamePlan>('/gameplans', data);
    return response.data;
  },
  update: async (id: string, data: UpdateGamePlanDto) => {
    const response = await api.patch<GamePlan>(`/gameplans/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<boolean>(`/gameplans/${id}`);
    return response.data;
  },
};
