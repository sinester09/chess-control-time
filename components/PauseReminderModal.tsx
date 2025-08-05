import React from 'react';
import { CoffeeIcon } from './icons';

interface PauseReminderModalProps {
  show: boolean;
  onConfirm: () => void;
  onClose: () => void;
  pauseDuration?: number; // Duración recomendada de la pausa en minutos
}

const PauseReminderModal: React.FC<PauseReminderModalProps> = ({ show, onConfirm, onClose, pauseDuration = 15 }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-cyan-500 rounded-lg shadow-2xl p-8 max-w-md w-full text-center transform transition-all scale-100 opacity-100">
        <CoffeeIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Tiempo para una Pausa!</h2>
        <p className="text-slate-300 mb-6">
          Has estado trabajando por un tiempo. Te recomendamos tomar una pausa de {pauseDuration}-minutos.
          Dale un paso atrás, relájate y refresca tu mente.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              onClick={onClose}
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              Remind me later
            </button>
            <button
              onClick={onConfirm}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Ya tomé una Pausa
            </button>
        </div>
      </div>
    </div>
  );
};

export default PauseReminderModal;
