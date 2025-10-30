// components/DocumentCard.tsx
import React from 'react';
import { Correspondence } from '../types';
import { getStageDisplayName } from '../constants';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  UserCircleIcon as UserIcon,
} from './icons/IconComponents';
import Deadline from './Deadline';

interface DocumentCardProps {
  document: Correspondence;
  onClick: (document: Correspondence) => void;
}

const stageStyles: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  PENDING_REGISTRATION: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-300',
    dot: 'bg-gray-400',
  },
  EXECUTION: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
  },
  COMPLETED: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  REJECTED: {
    bg: 'bg-red-500/10',
    text: 'text-red-300',
    dot: 'bg-red-400',
  },
  ON_HOLD: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  FINAL_REVIEW: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-300',
    dot: 'bg-yellow-400',
  },
  DEFAULT: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  },
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const style = stageStyles[document.stage] || stageStyles.DEFAULT;
  const executorName = document.mainExecutor?.name || 'Tayinlanmagan';

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') onClick(document);
  };

  return (
    <div
      onClick={() => onClick(document)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View document: ${document.title}`}
      className="
        relative overflow-hidden
        flex flex-col justify-between 
        p-4 sm:p-5 rounded-xl sm:rounded-2xl
        cursor-pointer group select-none
        backdrop-blur-md bg-white/[0.04]
        border border-white/10
        shadow-[0_6px_25px_rgba(0,0,0,0.45)]
        hover:shadow-[0_10px_40px_rgba(0,255,255,0.25)]
        hover:bg-white/[0.08]
        hover:border-cyan-300/30
        transition-all duration-400 ease-out
        focus:outline-none focus:ring-2 focus:ring-cyan-400/50
        w-full
      "
    >
      {/* Сияние краёв */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/[0.05] via-transparent to-cyan-400/[0.08]" />
      {/* Лёгкая бумажная текстура */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

      {/* Верхняя часть */}
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <span
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {getStageDisplayName(document.stage)}
          </span>

          {document.type === 'Kiruvchi' ? (
            <ArrowDownTrayIcon className="w-5 h-5 text-cyan-400/80 group-hover:scale-110 transition-transform" />
          ) : (
            <ArrowUpTrayIcon className="w-5 h-5 text-amber-400/80 group-hover:scale-110 transition-transform" />
          )}
        </div>

        <h3
          className="mt-3 text-base sm:text-lg font-semibold text-white/95 
          tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-2"
        >
          {document.title}
        </h3>

        <p className="mt-1.5 text-sm text-white/70 leading-snug line-clamp-2 italic">
          {document.content || 'Hujjat matni mavjud emas...'}
        </p>
      </div>

      {/* Нижняя часть */}
      <div
        className="relative z-10 mt-5 pt-3 border-t border-white/10 
        flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <div className="flex items-center gap-2 text-sm text-white/80">
          <UserIcon className="w-5 h-5 text-white/60" />
          <span className="font-medium">{executorName}</span>
        </div>

        <div className="w-full sm:w-auto">
          <Deadline deadline={document.deadline} stage={document.stage} />
        </div>
      </div>

      {/* Эффект мягкого свечения при наведении */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-cyan-400/20 via-transparent to-amber-400/20 rounded-2xl pointer-events-none" />
    </div>
  );
};

export default DocumentCard;
