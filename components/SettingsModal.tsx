
import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  show: boolean;
  onSave: (startTime: string, endTime: string) => void;
  onClose: () => void;
  initialWorkDay: { start: string; end: string } | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onSave, onClose, initialWorkDay }) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    if (initialWorkDay) {
      setStartTime(initialWorkDay.start);
      setEndTime(initialWorkDay.end);
    }
  }, [initialWorkDay]);

  if (!show) return null;

  const handleSave = () => {
    onSave(startTime, endTime);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-cyan-500 rounded-lg shadow-2xl p-8 max-w-md w-full transform transition-all scale-100 opacity-100">
        <h2 className="text-2xl font-bold text-white mb-4">Bienvenido a Chess Control</h2>
        <p className="text-slate-300 mb-6">Empieza un nuevo dia selecciona tu horario de trabajo, el horario por defecto es de 09:00 a 17:00</p>
        <p className="text-slate-300 mb-6">Recuerda que puedes cambiarlo en cualquier momento en la sección de configuración</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="start-time" className="text-slate-200 font-medium">Horario de inicio</label>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="end-time" className="text-slate-200 font-medium">Hora de termino</label>
            <input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!initialWorkDay}
            aria-disabled={!initialWorkDay}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Guardar Horario
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
