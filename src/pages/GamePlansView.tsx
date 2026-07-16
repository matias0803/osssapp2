import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Edit, Trash2, AlertTriangle, Map, PlaySquare } from 'lucide-react';

export const GamePlansView: React.FC = () => {
  const { gameplans, tecnicas, addGamePlan, editGamePlan, removeGamePlan } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  const [formTitulo, setFormTitulo] = useState('');
  const [formTecnicasIds, setFormTecnicasIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Viewing mode
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingPlanId(null);
    setFormTitulo('');
    setFormTecnicasIds([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, plan: any) => {
    e.stopPropagation();
    setEditingPlanId(plan.id);
    setFormTitulo(plan.titulo);
    setFormTecnicasIds([...plan.tecnicasIds]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddTechnique = (id: string) => {
    setFormTecnicasIds([...formTecnicasIds, id]);
  };

  const handleRemoveTechnique = (index: number) => {
    setFormTecnicasIds(formTecnicasIds.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      setFormError('El título es obligatorio.');
      return;
    }
    if (formTecnicasIds.length === 0) {
      setFormError('Debes añadir al menos una técnica al plan.');
      return;
    }

    try {
      if (editingPlanId) {
        await editGamePlan(editingPlanId, { titulo: formTitulo, tecnicasIds: formTecnicasIds });
      } else {
        await addGamePlan({ titulo: formTitulo, tecnicasIds: formTecnicasIds });
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError('Error al guardar.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeGamePlan(id);
      setDeleteConfirmId(null);
      setIsModalOpen(false);
      setViewingPlanId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // The active view plan
  const activePlan = gameplans.find(g => g.id === viewingPlanId);

  return (
    <div className="relative min-h-[calc(100vh-12rem)] pb-20 animate-in fade-in duration-300">
      
      {/* List of Game Plans */}
      {!viewingPlanId && (
        <div className="space-y-3 mt-4">
          {gameplans.length === 0 ? (
            <div className="py-12 text-center text-dark-muted">
              <Map className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-semibold">No tienes planes de juego.</p>
              <p className="text-xs mt-1">Crea uno para encadenar tus técnicas.</p>
            </div>
          ) : (
            gameplans.map((plan) => (
              <div 
                key={plan.id} 
                onClick={() => setViewingPlanId(plan.id)}
                className="glass rounded-2xl p-4 border border-dark-border cursor-pointer hover:border-primary/50 transition-colors flex flex-col gap-2 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                
                <div className="flex justify-between items-start pl-2">
                  <h3 className="text-sm font-black text-white pr-2 uppercase tracking-widest">{plan.titulo}</h3>
                  <button onClick={(e) => handleOpenEdit(e, plan)} className="text-dark-muted hover:text-white p-1">
                    <Edit size={14} />
                  </button>
                </div>
                
                <p className="text-xs text-dark-muted pl-2 font-bold">{plan.tecnicasIds.length} técnicas enlazadas</p>
                
                <div className="flex gap-1 pl-2 mt-2 overflow-x-auto scrollbar-hide">
                  {plan.tecnicasIds.map((tid, idx) => {
                    const t = tecnicas.find(tec => tec.id === tid);
                    if (!t) return null;
                    return (
                      <React.Fragment key={`${tid}-${idx}`}>
                        <span className="px-2 py-0.5 rounded bg-black/40 border border-dark-border/50 text-[9px] font-bold text-dark-muted whitespace-nowrap">
                          {t.nombre}
                        </span>
                        {idx < plan.tecnicasIds.length - 1 && (
                          <span className="text-dark-muted/50 text-xs flex items-center">-</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Viewing a Game Plan */}
      {viewingPlanId && activePlan && (
        <div className="mt-4 animate-in slide-in-from-right-8 duration-300">
          <button 
            onClick={() => setViewingPlanId(null)}
            className="mb-4 text-[10px] font-black text-dark-muted hover:text-white uppercase tracking-widest flex items-center gap-1"
          >
            ← Volver a planes
          </button>
          
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-black text-white uppercase tracking-widest">{activePlan.titulo}</h2>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dark-border before:to-transparent">
            {activePlan.tecnicasIds.map((tid, idx) => {
              const t = tecnicas.find(tec => tec.id === tid);
              if (!t) return null;
              
              return (
                <div key={`${tid}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-dark-bg bg-primary text-white font-black text-[10px] absolute left-[-24px] z-10 shadow-sm md:mx-auto md:left-1/2 md:-translate-x-1/2">
                    {idx + 1}
                  </div>
                  
                  <div className="w-full glass p-4 rounded-2xl border border-dark-border shadow-sm bg-neutral-900/80">
                    <h4 className="text-sm font-bold text-white mb-1">{t.nombre}</h4>
                    {t.nota && <p className="text-xs text-dark-muted italic mb-2 line-clamp-2">"{t.nota}"</p>}
                    
                    {t.videoUrl && (
                      <a 
                        href={t.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 w-fit transition-colors"
                      >
                        <PlaySquare size={12} /> Ver Video
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!viewingPlanId && (
        <button 
          onClick={handleOpenCreate}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-primary text-white shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-dark-bg/95 backdrop-blur-sm flex flex-col p-4 animate-in fade-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between mb-6 pt-2">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{editingPlanId ? 'Editar' : 'Nuevo'} Plan</h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-neutral-900 rounded-full text-dark-muted"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
            {formError && <div className="p-3 bg-red-950/40 text-red-400 text-xs rounded-xl flex items-center gap-2"><AlertTriangle size={14} />{formError}</div>}
            
            <input 
              type="text" 
              placeholder="Ej: Rutina de Pasajes Guardiero" 
              value={formTitulo} 
              onChange={(e) => setFormTitulo(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50" 
            />

            <div className="pt-2 border-t border-dark-border/50 flex-1 flex flex-col">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Secuencia de Técnicas</h4>
              
              {/* Added techniques */}
              <div className="flex flex-col gap-2 mb-4">
                {formTecnicasIds.length === 0 && <p className="text-xs text-dark-muted italic">No hay técnicas en la secuencia.</p>}
                {formTecnicasIds.map((tid, idx) => {
                  const t = tecnicas.find(tec => tec.id === tid);
                  return (
                    <div key={`${tid}-${idx}`} className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-dark-border">
                      <div className="w-5 h-5 rounded-full bg-neutral-800 text-dark-muted flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-white flex-1 truncate">{t?.nombre || 'Técnica eliminada'}</span>
                      <button type="button" onClick={() => handleRemoveTechnique(idx)} className="p-1 text-red-500 hover:bg-red-950/30 rounded-lg">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add technique selector */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-dark-border mt-auto">
                <span className="block text-xs font-bold text-dark-muted mb-2">Añadir técnica a la secuencia:</span>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                  {tecnicas.map(t => (
                    <button 
                      key={t.id} 
                      type="button"
                      onClick={() => handleAddTechnique(t.id)}
                      className="text-left px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-xs text-white"
                    >
                      + {t.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-3">
              {editingPlanId && (
                <button type="button" onClick={() => setDeleteConfirmId(editingPlanId)} className="p-4 rounded-2xl bg-red-950/40 text-red-500 border border-red-900/50"><Trash2 size={20} /></button>
              )}
              <button type="submit" className="flex-1 p-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs">Guardar Plan</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-dark-card border border-red-900/50 rounded-3xl p-6 w-full max-w-sm text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-black text-white mb-2">¿Eliminar Plan?</h4>
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
