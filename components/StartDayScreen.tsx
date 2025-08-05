import React from 'react';
import { PlayCircleIcon } from './icons';

interface StartDayScreenProps {
  onStart: () => void;
}

const StartDayScreen: React.FC<StartDayScreenProps> = ({ onStart }) => {
  return (
    <div className="text-center py-20 px-4 bg-slate-800/50 rounded-lg flex flex-col items-center gap-6 mt-8">
      <h2 className="text-3xl font-bold text-slate-100">¿Listo para un dia productivo?</h2>
      <p className="text-slate-400 max-w-md">
        Presiona aqui para empezar tu dia
      </p>
      <button
        onClick={onStart}
        className="flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 text-lg"
      >
        <PlayCircleIcon className="w-7 h-7" />
        <span>Empezar</span>
      </button>
    </div>
  );
};

export default StartDayScreen;
