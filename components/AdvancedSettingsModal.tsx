import React, { useState, useEffect } from 'react';
import { Settings } from '../types';

interface AdvancedSettingsModalProps {
  show: boolean;
  onSave: (settings: Settings) => void;
  onClose: () => void;
  initialSettings: Settings;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  show,
  onSave,
  onClose,
  initialSettings
}) => {
  const [toleranceTime, setToleranceTime] = useState(Math.floor(initialSettings.toleranceTime / 60));
  const [pauseInterval, setPauseInterval] = useState(Math.floor(initialSettings.pauseInterval / 3600));
  const [pauseDuration, setPauseDuration] = useState(initialSettings.pauseDuration);
  const [snoozeDuration, setSnoozeDuration] = useState(initialSettings.snoozeDuration);
  const [pomodoroTimer, setPomodoroTimer] = useState(initialSettings.pomodoroTimer || 25);

  useEffect(() => {
    if (initialSettings) {
      setToleranceTime(Math.floor(initialSettings.toleranceTime / 60));
      setPauseInterval(Math.floor(initialSettings.pauseInterval / 3600));
      setPauseDuration(initialSettings.pauseDuration);
      setSnoozeDuration(initialSettings.snoozeDuration);
      setPomodoroTimer(initialSettings.pomodoroTimer || 25);
    }
  }, [initialSettings]);

  if (!show) return null;

  const handleSave = () => {
    const newSettings: Settings = {
      ...initialSettings,
      toleranceTime: toleranceTime * 60,
      pauseInterval: pauseInterval * 3600,
      pauseDuration,
      snoozeDuration,
      pomodoroTimer,
    };
    onSave(newSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-cyan-500 rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Configuración Avanzada</h2>
        <p className="text-slate-300 mb-6">Personaliza la experiencia de Chess Control.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="tolerance-time" className="text-slate-200 font-medium">Tolerancia de tiempo (minutos)</label>
            <input
              type="number"
              id="tolerance-time"
              value={toleranceTime}
              onChange={(e) => setToleranceTime(Math.max(0, parseInt(e.target.value) || 0))}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-24"
              min="0"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="pause-interval" className="text-slate-200 font-medium">Intervalo de descanso (horas)</label>
            <input
              type="number"
              id="pause-interval"
              value={pauseInterval}
              onChange={(e) => setPauseInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-24"
              min="1"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="pause-duration" className="text-slate-200 font-medium">Duración del descanso (minutos)</label>
            <input
              type="number"
              id="pause-duration"
              value={pauseDuration}
              onChange={(e) => setPauseDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-24"
              min="1"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="snooze-duration" className="text-slate-200 font-medium">Posponer recordatorio (minutos)</label>
            <input
              type="number"
              id="snooze-duration"
              value={snoozeDuration}
              onChange={(e) => setSnoozeDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-24"
              min="1"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="pomodoro-timer" className="text-slate-200 font-medium">Timer Pomodoro (minutos)</label>
            <input
              type="number"
              id="pomodoro-timer"
              value={pomodoroTimer}
              onChange={(e) => setPomodoroTimer(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-24"
              min="1"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsModal;
