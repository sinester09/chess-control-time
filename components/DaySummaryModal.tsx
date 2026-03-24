import React from 'react';
import { TimeRecord, Project } from '../types';

interface DaySummaryModalProps {
  show: boolean;
  records: TimeRecord[];
  projects: Project[];
  onClose: () => void;
}

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const DaySummaryModal: React.FC<DaySummaryModalProps> = ({ show, records, projects, onClose }) => {
  if (!show) return null;

  const total = records.reduce((sum, r) => sum + r.totalSeconds, 0);
  const today = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏁</div>
          <h2 className="text-white font-bold text-xl">Resumen del día</h2>
          <p className="text-slate-400 text-sm capitalize mt-1">{today}</p>
        </div>

        {/* Total */}
        <div className="bg-slate-700 rounded-xl p-4 mb-4 text-center">
          <p className="text-slate-400 text-sm mb-1">Tiempo total trabajado</p>
          <p className="text-cyan-400 font-bold text-3xl">{formatHours(total)}</p>
        </div>

        {/* Por proyecto */}
        {records.length > 0 ? (
          <div className="space-y-2 mb-6">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">Por proyecto</p>
            {records.map(record => {
              const project = record.projectId
                ? projects.find(p => p.id === record.projectId)
                : null;
              const pct = total > 0 ? Math.round((record.totalSeconds / total) * 100) : 0;

              return (
                <div key={record.id} className="bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project?.color ?? '#64748b' }}
                      />
                      <span className="text-white text-sm font-medium">
                        {project?.name ?? 'Sin proyecto'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-400 font-semibold text-sm">{formatHours(record.totalSeconds)}</span>
                      <span className="text-slate-500 text-xs ml-1">({pct}%)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: project?.color ?? '#64748b' }}
                    />
                  </div>
                  {record.taskCount > 0 && (
                    <p className="text-slate-500 text-xs mt-1">
                      {record.taskCount} {record.taskCount === 1 ? 'tarea completada' : 'tareas completadas'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center mb-6">No hay tareas registradas hoy.</p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DaySummaryModal;
