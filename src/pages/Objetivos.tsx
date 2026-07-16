import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Objetivo } from '../types';
import { Target, Plus, Edit, Trash2, X, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

export const Objetivos: React.FC = () => {
  const { objetivos, addObjetivo, editObjetivo, removeObjetivo } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<Objetivo | null>(null);

  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState<'corto' | 'mediano' | 'largo'>('corto');
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingObjetivo(null);
    setFormTitulo('');
    setFormTipo('corto');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (objetivo: Objetivo) => {
    setEditingObjetivo(objetivo);
    setFormTitulo(objetivo.titulo);
    setFormTipo(objetivo.tipo);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitulo.trim()) {
      setFormError('El título del objetivo es obligatorio.');
      return;
    }

    const payload = {
      titulo: formTitulo.trim(),
      tipo: formTipo,
    };

    try {
      if (editingObjetivo) {
        await editObjetivo(editingObjetivo.id, payload);
      } else {
        await addObjetivo(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError('Error al guardar el objetivo.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeObjetivo(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const toggleCompletado = async (objetivo: Objetivo) => {
    try {
      await editObjetivo(objetivo.id, { completado: !objetivo.completado });
    } catch (err) {
      console.error('Failed to toggle', err);
    }
  };

  const grouped = useMemo(() => {
    return {
      corto: objetivos.filter(o => o.tipo === 'corto'),
      mediano: objetivos.filter(o => o.tipo === 'mediano'),
      largo: objetivos.filter(o => o.tipo === 'largo'),
    };
  }, [objetivos]);

  const renderSection = (title: string, items: Objetivo[], colorClass: string) => (
    <div className="space-y-3 mt-6">
      <h3 className={`text-xs font-black uppercase tracking-widest pl-2 ${colorClass}`}>
        {title} <span className="text-dark-muted ml-1">({items.length})</span>
      </h3>
      
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center border border-dark-border border-dashed">
          <p className="text-xs text-dark-muted font-medium">No hay objetivos definidos.</p>
        </div>
      ) : (
        items.map(obj => (
          <div key={obj.id} className={`glass rounded-2xl p-3 border flex items-center justify-between gap-3 group transition-all duration-300 ${obj.completado ? 'border-green-900/30 bg-green-950/5' : 'border-dark-border hover:border-primary/20'}`}>
            <button onClick={() => toggleCompletado(obj)} className="flex-shrink-0 text-dark-muted hover:text-green-500 transition-colors pl-1">
              {obj.completado ? <CheckCircle2 size={22} className="text-green-500" /> : <Circle size={22} />}
            </button>
            
            <p className={`flex-1 text-sm font-semibold transition-all ${obj.completado ? 'text-dark-muted line-through' : 'text-white'}`}>
              {obj.titulo}
            </p>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pr-1">
              <button onClick={() => handleOpenEdit(obj)} className="p-2 bg-neutral-900 rounded-xl text-dark-muted hover:text-white transition-colors">
                <Edit size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-8rem)] pb-20 animate-in fade-in duration-300">
      <div className="pt-2 pb-4">
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          OBJETIVOS <Target className="text-primary" size={24} strokeWidth={2.5} />
        </h2>
        <p className="text-sm text-dark-muted mt-1 font-medium">Define tus metas en el tatami a corto, mediano y largo plazo.</p>
      </div>

      <div className="space-y-6">
        {renderSection('Corto Plazo', grouped.corto, 'text-blue-500')}
        {renderSection('Mediano Plazo', grouped.mediano, 'text-orange-500')}
        {renderSection('Largo Plazo', grouped.largo, 'text-red-500')}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={handleOpenCreate}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-primary text-white shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-dark-bg/95 backdrop-blur-sm flex flex-col p-4 animate-in fade-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between mb-6 pt-2">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{editingObjetivo ? 'Editar' : 'Nuevo'} Objetivo</h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-neutral-900 rounded-full text-dark-muted hover:text-white"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
            {formError && <div className="p-3 bg-red-950/40 text-red-400 text-xs rounded-xl flex items-center gap-2"><AlertTriangle size={14} />{formError}</div>}
            
            <textarea 
              placeholder="Ej. Aprender a escapar de montada" 
              value={formTitulo} 
              onChange={(e) => setFormTitulo(e.target.value)} 
              rows={3} 
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50 resize-none" 
            />

            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider pl-1 block">Tipo de Plazo</label>
              <div className="flex flex-col gap-2">
                <button 
                  type="button" 
                  onClick={() => setFormTipo('corto')} 
                  className={`p-4 rounded-xl text-xs font-black uppercase text-left transition-colors border ${formTipo === 'corto' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-neutral-900 border-dark-border text-dark-muted'}`}
                >
                  Corto Plazo <span className="block text-[9px] font-medium text-dark-muted/80 normal-case mt-0.5">Metas para las próximas semanas o meses.</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormTipo('mediano')} 
                  className={`p-4 rounded-xl text-xs font-black uppercase text-left transition-colors border ${formTipo === 'mediano' ? 'bg-orange-600/10 border-orange-500 text-orange-500' : 'bg-neutral-900 border-dark-border text-dark-muted'}`}
                >
                  Mediano Plazo <span className="block text-[9px] font-medium text-dark-muted/80 normal-case mt-0.5">Metas para los próximos 6 a 12 meses.</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormTipo('largo')} 
                  className={`p-4 rounded-xl text-xs font-black uppercase text-left transition-colors border ${formTipo === 'largo' ? 'bg-red-600/10 border-red-500 text-red-500' : 'bg-neutral-900 border-dark-border text-dark-muted'}`}
                >
                  Largo Plazo <span className="block text-[9px] font-medium text-dark-muted/80 normal-case mt-0.5">Grandes logros (ej. cinturones, torneos grandes).</span>
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-3">
              {editingObjetivo && (
                <button type="button" onClick={() => setDeleteConfirmId(editingObjetivo.id)} className="p-4 rounded-2xl bg-red-950/40 text-red-500 border border-red-900/50 hover:bg-red-900/50"><Trash2 size={20} /></button>
              )}
              <button type="submit" className="flex-1 p-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(225,29,72,0.3)]">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-dark-card border border-red-900/50 rounded-3xl p-6 w-full max-w-sm text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-black text-white mb-2">¿Eliminar objetivo?</h4>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-neutral-900 rounded-xl text-xs font-bold text-white">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-3 bg-red-600 rounded-xl text-xs font-bold text-white">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
