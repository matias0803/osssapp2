import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Tecnica } from '../types';
import { Search, Plus, Edit, Trash2, X, AlertTriangle, GraduationCap, PlaySquare, Link2, Map, Book } from 'lucide-react';
import { GamePlansView } from './GamePlansView';

export const Techniques: React.FC = () => {
  const { tecnicas, addTecnica, editTecnica, removeTecnica, stats } = useApp();

  const [viewMode, setViewMode] = useState<'biblioteca' | 'gameplans'>('biblioteca');

  const [search, setSearch] = useState('');
  const [giFilter, setGiFilter] = useState<'all' | 'gi' | 'nogi'>('all');
  const [tagFilter, setTagFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTecnica, setEditingTecnica] = useState<Tecnica | null>(null);

  const [formNombre, setFormNombre] = useState('');
  const [formNota, setFormNota] = useState('');
  const [formGi, setFormGi] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formConexiones, setFormConexiones] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingTecnica(null);
    setFormNombre('');
    setFormNota('');
    setFormGi(true);
    setFormTags([]);
    setTagInput('');
    setFormVideoUrl('');
    setFormConexiones([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tecnica: Tecnica) => {
    setEditingTecnica(tecnica);
    setFormNombre(tecnica.nombre);
    setFormNota(tecnica.nota);
    setFormGi(tecnica.gi);
    setFormTags(tecnica.tag ? [...tecnica.tag] : []);
    setTagInput('');
    setFormVideoUrl(tecnica.videoUrl || '');
    setFormConexiones(tecnica.conexiones ? [...tecnica.conexiones] : []);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (cleaned && !formTags.includes(cleaned)) {
        setFormTags([...formTags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNombre.trim() || !formNota.trim()) {
      setFormError('Nombre y nota son obligatorios.');
      return;
    }

    const payload = {
      nombre: formNombre.trim(),
      nota: formNota.trim(),
      gi: formGi,
      tag: formTags,
      videoUrl: formVideoUrl.trim() || undefined,
      conexiones: formConexiones.length > 0 ? formConexiones : undefined,
    };

    try {
      if (editingTecnica) {
        await editTecnica(editingTecnica.id, payload);
      } else {
        await addTecnica(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError('Error al guardar.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeTecnica(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete technique');
    }
  };

  const filteredTecnicas = useMemo(() => {
    return tecnicas.filter(t => {
      const matchesSearch = t.nombre.toLowerCase().includes(search.toLowerCase()) || 
                            (t.nota && t.nota.toLowerCase().includes(search.toLowerCase()));
      const matchesGi = giFilter === 'all' ? true : giFilter === 'gi' ? t.gi : !t.gi;
      const matchesTag = !tagFilter ? true : t.tag && t.tag.some(tag => tag.toLowerCase() === tagFilter.toLowerCase());
      return matchesSearch && matchesGi && matchesTag;
    });
  }, [tecnicas, search, giFilter, tagFilter]);

  const toggleConexion = (id: string) => {
    if (formConexiones.includes(id)) {
      setFormConexiones(formConexiones.filter(c => c !== id));
    } else {
      setFormConexiones([...formConexiones, id]);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] pb-20 animate-in fade-in duration-300">
      
      {/* Top Tabs */}
      <div className="flex bg-neutral-900 p-1 mb-2 rounded-xl border border-dark-border">
        <button onClick={() => setViewMode('biblioteca')} className={`flex-1 py-2 flex items-center justify-center gap-2 text-xs font-black uppercase rounded-lg transition-colors ${viewMode === 'biblioteca' ? 'bg-primary text-white shadow-sm' : 'text-dark-muted hover:text-white'}`}>
          <Book size={14} /> Biblioteca
        </button>
        <button onClick={() => setViewMode('gameplans')} className={`flex-1 py-2 flex items-center justify-center gap-2 text-xs font-black uppercase rounded-lg transition-colors ${viewMode === 'gameplans' ? 'bg-primary text-white shadow-sm' : 'text-dark-muted hover:text-white'}`}>
          <Map size={14} /> Planes
        </button>
      </div>

      {viewMode === 'gameplans' ? (
        <GamePlansView />
      ) : (
        <>
          {/* Sticky Header / Filters for Mobile */}
          <div className="sticky top-0 z-10 bg-dark-bg/95 backdrop-blur-md pt-2 pb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
          <input
            type="text"
            placeholder="Buscar técnicas..."
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

        {/* Scrollable Tag Chips */}
        {stats.allTags.length > 0 && (
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
             <button
                onClick={() => setTagFilter('')}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${
                  tagFilter === '' ? 'bg-white text-black border-white' : 'bg-transparent text-dark-muted border-dark-border'
                }`}
              >
                #todos
              </button>
            {stats.allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${
                  tagFilter === tag ? 'bg-white text-black border-white' : 'bg-transparent text-dark-muted border-dark-border'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3 mt-2">
        {filteredTecnicas.length === 0 ? (
          <div className="py-12 text-center text-dark-muted">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-semibold">No se encontraron técnicas.</p>
          </div>
        ) : (
          filteredTecnicas.map((tecnica) => (
            <div key={tecnica.id} className="glass rounded-2xl p-3.5 border border-dark-border flex flex-col gap-2 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${tecnica.gi ? 'bg-blue-500' : 'bg-orange-500'}`} />
              
              <div className="flex justify-between items-start pl-2">
                <h3 className="text-sm font-bold text-white pr-2 leading-tight">{tecnica.nombre}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenEdit(tecnica)} className="text-dark-muted hover:text-white p-1">
                    <Edit size={14} />
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-dark-muted pl-2 italic line-clamp-2 leading-relaxed">"{tecnica.nota}"</p>
              
              {/* Knowledge Map Extras */}
              {(tecnica.videoUrl || (tecnica.conexiones && tecnica.conexiones.length > 0)) && (
                <div className="pl-2 mt-2 pt-2 border-t border-dark-border/50 flex flex-col gap-2">
                  {tecnica.videoUrl && (
                    <a 
                      href={tecnica.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 w-fit transition-colors"
                    >
                      <PlaySquare size={12} /> Ver Video
                    </a>
                  )}
                  
                  {tecnica.conexiones && tecnica.conexiones.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-dark-muted font-bold flex items-center gap-1">
                        <Link2 size={10} /> Conecta con:
                      </span>
                      {tecnica.conexiones.map(cid => {
                        const connectedTec = tecnicas.find(t => t.id === cid);
                        if (!connectedTec) return null;
                        return (
                          <span key={cid} className="px-2 py-0.5 rounded-md bg-neutral-800 border border-dark-border text-[9px] font-bold text-white whitespace-nowrap">
                            {connectedTec.nombre}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pl-2 mt-2">
                {tecnica.tag && tecnica.tag.map((t, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded border border-dark-border/50 text-[9px] font-bold text-dark-muted">#{t}</span>
                ))}
              </div>
            </div>
          ))
        )}
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
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{editingTecnica ? 'Editar' : 'Nueva'} Técnica</h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-neutral-900 rounded-full text-dark-muted"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
            {formError && <div className="p-3 bg-red-950/40 text-red-400 text-xs rounded-xl flex items-center gap-2"><AlertTriangle size={14} />{formError}</div>}
            
            <input type="text" placeholder="Nombre" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50" />
            
            <textarea placeholder="Detalles / Notas" value={formNota} onChange={(e) => setFormNota(e.target.value)} rows={3} className="w-full p-4 rounded-2xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50 resize-none" />

            <div className="flex gap-2 p-1 bg-neutral-900 rounded-2xl border border-dark-border">
              <button type="button" onClick={() => setFormGi(true)} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-colors ${formGi ? 'bg-blue-600 text-white' : 'text-dark-muted'}`}>Gi</button>
              <button type="button" onClick={() => setFormGi(false)} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-colors ${!formGi ? 'bg-orange-600 text-white' : 'text-dark-muted'}`}>No-Gi</button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-dark-border">
              <div className="flex flex-wrap gap-2 mb-2">
                {formTags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded bg-black/50 text-[10px] font-bold border border-dark-border flex items-center gap-1">{tag} <X size={10} onClick={() => handleRemoveTag(tag)} className="cursor-pointer text-red-400"/></span>
                ))}
              </div>
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Añadir tag (Enter)" className="w-full bg-transparent text-xs outline-none text-white placeholder-dark-muted" />
              
              {stats.allTags.filter(t => !formTags.includes(t)).length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-border/50">
                  <span className="block text-[9px] font-bold text-dark-muted mb-2 uppercase tracking-wider">Tags Existentes:</span>
                  <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                    {stats.allTags.filter(t => !formTags.includes(t)).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormTags([...formTags, tag])}
                        className="whitespace-nowrap px-2 py-1 rounded-md bg-black/30 border border-dark-border/50 text-[10px] text-dark-muted hover:text-white hover:border-dark-border hover:bg-neutral-800 transition-colors flex-shrink-0"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-dark-border/50">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Mapa de Conocimiento</h4>
              
              <div className="space-y-3">
                <input 
                  type="url" 
                  placeholder="URL de Video (YouTube/Instagram)" 
                  value={formVideoUrl} 
                  onChange={(e) => setFormVideoUrl(e.target.value)} 
                  className="w-full p-3 rounded-xl bg-neutral-900 border border-dark-border text-sm text-white outline-none focus:border-primary/50" 
                />
                
                <div className="p-3 rounded-xl bg-neutral-900 border border-dark-border">
                  <span className="block text-xs font-bold text-dark-muted mb-2">Conecta con (Técnicas relacionadas):</span>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1 scrollbar-hide">
                    {tecnicas.filter(t => t.id !== editingTecnica?.id).map(t => (
                      <label key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formConexiones.includes(t.id)} 
                          onChange={() => toggleConexion(t.id)}
                          className="accent-primary"
                        />
                        <span className="text-xs text-white leading-tight">{t.nombre}</span>
                      </label>
                    ))}
                    {tecnicas.length <= 1 && <span className="text-[10px] text-dark-muted italic">Crea más técnicas para vincularlas.</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-3">
              {editingTecnica && (
                <button type="button" onClick={() => setDeleteConfirmId(editingTecnica.id)} className="p-4 rounded-2xl bg-red-950/40 text-red-500 border border-red-900/50"><Trash2 size={20} /></button>
              )}
              <button type="submit" className="flex-1 p-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs">Guardar</button>
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
      </>
      )}
    </div>
  );
};
