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

  // The summary record (pauseCount > 0 or the last one saved) holds global pause info
  const summaryRecord = records.find(r => r.pauseCount > 0) ?? records[records.length - 1];
  const pauseCount = summaryRecord?.pauseCount ?? 0;
  const pauseMinutes = summaryRecord?.pauseMinutes ?? 0;

  // Per-project records (exclude the global summary duplicate)
  const projectRecords = records.filter(r => !(r.pauseCount > 0 && r.projectId === null && records.length > 1));

  const total = projectRecords.reduce((sum, r) => sum + r.totalSeconds, 0) ||
    (summaryRecord?.totalSeconds ?? 0);

  const today = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🏁</div>
          <h2 className="text-white font-bold text-xl">Resumen del día</h2>
          <p className="text-slate-400 text-sm capitalize mt-1">{today}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-700 rounded-xl p-3 text-center">
            <p className="text-cyan-400 font-bold text-xl">{formatHours(total)}</p>
            <p className="text-slate-400 text-xs mt-0.5">Trabajado</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-bold text-xl">{pauseCount}</p>
            <p className="text-slate-400 text-xs mt-0.5">Descansos</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-bold text-xl">{pauseMinutes}m</p>
            <p className="text-slate-400 text-xs mt-0.5">En pausa</p>
          </div>
        </div>

        {/* Por proyecto */}
        {projectRecords.filter(r => r.projectId !== null || projectRecords.length === 1).length > 0 && (
          <div className="space-y-2 mb-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Por proyecto</p>
            {projectRecords.map(record => {
              const project = record.projectId
                ? projects.find(p => p.id === record.projectId)
                : null;
              const base = projectRecords.reduce((s, r) => s + r.totalSeconds, 0);
              const pct = base > 0 ? Math.round((record.totalSeconds / base) * 100) : 0;

              return (
                <div key={record.id} className="bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project?.color ?? '#64748b' }} />
                      <span className="text-white text-sm font-medium">{project?.name ?? 'Sin proyecto'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-400 font-semibold text-sm">{formatHours(record.totalSeconds)}</span>
                      <span className="text-slate-500 text-xs ml-1">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: project?.color ?? '#64748b' }} />
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
        )}

        {/* Pausa detalle */}
        {pauseCount > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">☕</span>
              <div>
                <p className="text-emerald-300 text-sm font-medium">
                  {pauseCount} {pauseCount === 1 ? 'descanso tomado' : 'descansos tomados'}
                </p>
                <p className="text-emerald-400/70 text-xs">
                  {pauseMinutes} minutos de pausa registrados
                </p>
              </div>
            </div>
          </div>
        )}

        {total === 0 && pauseCount === 0 && (
          <p className="text-slate-500 text-sm text-center mb-5">No hay actividad registrada hoy.</p>
        )}

        <button onClick={onClose} className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DaySummaryModal;
