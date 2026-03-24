import React, { useState, useEffect } from 'react';
import { Project, PROJECT_COLORS } from '../types';

interface ProjectModalProps {
  show: boolean;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
  editing?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ show, onSave, onClose, editing }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setColor(editing.color);
    } else {
      setName('');
      setColor(PROJECT_COLORS[0]);
    }
  }, [editing, show]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), color);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-white font-semibold text-lg mb-5">
          {editing ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Desarrollo web"
              required
              autoFocus
              className="w-full bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-xl">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-white text-sm font-medium truncate">{name || 'Nombre del proyecto'}</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-semibold transition"
            >
              {editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
