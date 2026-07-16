import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Entrenamiento } from '../types';
import { Search, Plus, Edit, Trash2, X, AlertTriangle, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation, useNavigate } from 'react-router-dom';

export const Workouts: React.FC = () => {
  const { entrenamientos, tecnicas, addEntrenamiento, editEntrenamiento, removeEntrenamiento } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Filters State
  const [search, setSearch] = useState('');
  const [giFilter, setGiFilter] = useState<'all' | 'gi' | 'nogi'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Entrenamiento | null>(null);

  // Form State
  const [formFecha, setFormFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formObjetivo, setFormObjetivo] = useState('');
  const [formGi, setFormGi] = useState(true);
  
  // Feedback fields
  const [formTecnicaFoco, setFormTecnicaFoco] = useState<string | ''>('');
  const [formRepeticiones, setFormRepeticiones] = useState<number | ''>('');
  const [formPosicionAtrapado, setFormPosicionAtrapado] = useState('');
  const [formTemaClase, setFormTemaClase] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Handle auto-open modal from Dashboard
  useEffect(() => {
    const state = location.state as { prefillDate?: string } | null;
    if (state?.prefillDate) {
      handleOpenCreate(state.prefillDate);
      // Clear the state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Helper to format date
  const formatDateFull = (dateStr: string) => {
    try {
      const cleanDateStr = dateStr.substring(0, 10);
      const parsed = parseISO(cleanDateStr);
      return format(parsed, "EEEE, d 'de' MMMM", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const handleOpenCreate = (date?: string) => {
    setEditingWorkout(null);
    setFormFecha(date || format(new Date(), 'yyyy-MM-dd'));
    setFormObjetivo('');
    setFormGi(true);
    setFormTecnicaFoco('');
    setFormRepeticiones('');
    setFormPosicionAtrapado('');
    setFormTemaClase('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (workout: Entrenamiento) => {
    setEditingWorkout(workout);
    setFormFecha(workout.fecha.substring(0, 10));
    setFormObjetivo(workout.objetivo);
    setFormGi(workout.gi);
    setFormTecnicaFoco(workout.tecnicaFocoId || '');
    setFormRepeticiones(workout.repeticionesEfectivas || '');
    setFormPosicionAtrapado(workout.posicionAtrapado || '');
    setFormTemaClase(workout.temaClase || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formFecha) return setFormError('La fecha es obligatoria.');
    if (!formObjetivo.trim()) return setFormError('El objetivo es obligatorio.');

    const payload = {
      fecha: formFecha,
      objetivo: formObjetivo.trim(),
      gi: formGi,
      tecnicaFocoId: formTecnicaFoco === '' ? undefined : formTecnicaFoco,
      repeticionesEfectivas: formRepeticiones === '' ? undefined : Number(formRepeticiones),
      posicionAtrapado: formPosicionAtrapado === '' ? undefined : formPosicionAtrapado,
      temaClase: formTemaClase === '' ? undefined : formTemaClase
    };

    try {
      if (editingWorkout) await editEntrenamiento(editingWorkout.id, payload);
      else await addEntrenamiento(payload);
      setIsModalOpen(false);
    } catch (err) {
      setFormError('Error al guardar el entrenamiento.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeEntrenamiento(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete workout');
    }
  };

  const sortedAndFilteredWorkouts = useMemo(() => {
    return [...entrenamientos]
      .filter(w => {
        const matchesSearch = w.objetivo.toLowerCase().includes(search.toLowerCase());
        const matchesGi = giFilter === 'all' ? true : giFilter === 'gi' ? w.gi : !w.gi;
        return matchesSearch && matchesGi;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [entrenamientos, search, giFilter]);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] pb-20 animate-in fade-in duration-300">
      
      {/* Sticky Header / Filters for Mobile */}
      <div className="sticky top-0 z-10 bg-dark-bg/95 backdrop-blur-md pt-2 pb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
          <input
            type="text"
            placeholder="Buscar sesiones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-900 border border-dark-border focus:border-primary/50 outline-none text-sm text-white"
          />
        </div>

        {/* Modality Tabs */}
        <div className="flex bg-neutral-900 p-1 rounded-xl border border-dark-border">
          <button onClick={() => setGiFilter('all')} className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors ${giFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-dark-muted'}`}>Todos</button>
          <button onClick={() => setGiFilter('gi')} className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors ${giFilter === 'gi' ? 'bg-blue-600 text-white shadow-sm' : 'text-dark-muted'}`}>Gi</button>
          <button onClick={() => setGiFilter('nogi')} className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors ${giFilter === 'nogi' ? 'bg-orange-600 text-white shadow-sm' : 'text-dark-muted'}`}>No-Gi</button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3 mt-2">
        {sortedAndFilteredWorkouts.length === 0 ? (
          <div className="py-12 text-center text-dark-muted">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-semibold">No se encontraron entrenamientos.</p>
          </div>
        ) : (
          sortedAndFilteredWorkouts.map((workout) => (
            <div key={workout.id} className="glass rounded-2xl p-3.5 border border-dark-border flex flex-col gap-2 relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${workout.gi ? 'bg-blue-500' : 'bg-orange-500'}`} />
              
              <div className="flex justify-between items-start pl-2">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  workout.gi ? 'bg-blue-600/10 text-blue-500 border border-blue-500/10' : 'bg-orange-600/10 text-orange-500 border border-orange-500/10'
                }`}>
                  {formatDateFull(workout.fecha)}
                </span>
                
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(workout)} className="text-dark-muted hover:text-white p-1.5 bg-neutral-900 rounded-lg">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => setDeleteConfirmId(workout.id)} className="text-dark-muted hover:text-red-500 p-1.5 bg-neutral-900 rounded-lg">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm font-bold text-white pl-2 pr-2 leading-tight">
                {workout.objetivo}
              </p>
              
              {workout.temaClase && (
                <p className="text-xs text-dark-muted pl-2 pr-2 mt-1 italic">
                  {workout.temaClase}
                </p>
              )}

              {/* Feedback Pills */}
              {(workout.tecnicaFocoId || workout.repeticionesEfectivas || workout.posicionAtrapado) && (
                <div className="flex flex-wrap gap-1.5 pl-2 mt-1">
                  {workout.repeticionesEfectivas !== undefined && workout.repeticionesEfectivas > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold border border-primary/20">
                      🔥 {workout.repeticionesEfectivas} reps
                    </span>
                  )}
                  {workout.posicionAtrapado && (
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-dark-muted text-[9px] font-bold border border-dark-border">
                      Atrapado: {workout.posicionAtrapado}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => handleOpenCreate()}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-primary text-white shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-dark-bg/95 backdrop-blur-sm flex flex-col p-4 animate-in fade-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between mb-6 pt-2">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{editingWorkout ? 'Editar' : 'Nuevo'} Entreno</h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-neutral-900 rounded-full text-dark-muted"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
            {formError && <div className="p-3 bg-red-950/40 text-red-400 text-xs rounded-xl flex items-center gap-2"><AlertTriangle size={14} />{formError}</div>}
            
            <input 
              type="date" 
              value={formFecha} 
              onChange={(e) => setFormFecha(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50" 
            />
            
            <textarea 
              placeholder="Objetivo / Foco (ej. Sparring, pases de guardia)" 
              value={formObjetivo} 
              onChange={(e) => setFormObjetivo(e.target.value)} 
              rows={4} 
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50 resize-none" 
            />

            <div className="flex gap-2 p-1 bg-neutral-900 rounded-2xl border border-dark-border">
              <button type="button" onClick={() => setFormGi(true)} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-colors ${formGi ? 'bg-blue-600 text-white' : 'text-dark-muted'}`}>Gi (Kimono)</button>
              <button type="button" onClick={() => setFormGi(false)} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-colors ${!formGi ? 'bg-orange-600 text-white' : 'text-dark-muted'}`}>No-Gi</button>
            </div>

            <div className="mt-2 pt-4 border-t border-dark-border/50">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Análisis Post-Entreno (Opcional)</h4>
              
              <div className="space-y-3">
                <textarea 
                  placeholder="¿De qué trató la clase? (Opcional)" 
                  value={formTemaClase} 
                  onChange={(e) => setFormTemaClase(e.target.value)} 
                  rows={2} 
                  className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50 resize-none" 
                />

                <select 
                  value={formTecnicaFoco} 
                  onChange={(e) => setFormTecnicaFoco(e.target.value || '')}
                  className="w-full p-3 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50"
                >
                  <option value="">-- Técnica en Foco --</option>
                  {tecnicas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="Reps Efectivas" 
                    value={formRepeticiones} 
                    onChange={(e) => setFormRepeticiones(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 p-3 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50"
                  />
                  <select 
                    value={formPosicionAtrapado} 
                    onChange={(e) => setFormPosicionAtrapado(e.target.value)}
                    className="flex-1 p-3 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50"
                  >
                    <option value="">-- Atrapado en --</option>
                    <option value="Side Control">Side Control</option>
                    <option value="Montada">Montada</option>
                    <option value="Espalda">Espalda</option>
                    <option value="Media Guardia">Media Guardia</option>
                    <option value="Norte-Sur">Norte-Sur</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-3">
              <button type="submit" className="w-full p-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(225,29,72,0.3)]">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-dark-card border border-red-900/50 rounded-3xl p-6 w-full max-w-sm text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-black text-white mb-2">¿Eliminar?</h4>
            <p className="text-xs text-dark-muted mb-6">No podrás deshacer esta acción.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-neutral-900 rounded-xl text-xs font-bold text-white">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-3 bg-red-600 rounded-xl text-xs font-bold text-white">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
