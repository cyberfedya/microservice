import React from 'react';
import { Correspondence } from '../types';
import { ChatBubbleLeftEllipsisIcon, UserCircleIcon } from './icons/IconComponents';

interface AuditTrailProps {
    log: Correspondence['auditLogs'];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ log }) => {
    if (!log || log.length === 0) {
        return (
            <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                <h3 className="text-lg font-semibold">Hujjat Tarixi</h3>
                <p className="mt-2 text-sm text-white/60">Harakatlar tarixi mavjud emas.</p>
            </div>
        );
    }

    return (
        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
            <h3 className="text-lg font-semibold">Hujjat Tarixi</h3>
            <ul className="mt-4 space-y-4">
                {log.map(entry => (
                    <li key={entry.id} className="relative pl-8">
                        <div className="absolute left-0 top-1 flex items-center justify-center w-5 h-5 bg-slate-700 rounded-full ring-4 ring-slate-800">
                            <UserCircleIcon className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="absolute left-2 top-6 h-full border-l-2 border-slate-700 border-dashed"></div>
                        <p className="text-sm font-medium text-white/90">{entry.action}</p>
                        <p className="text-xs text-white/60">
                            {entry.user?.name || 'Tizim'} &bull; {new Date(entry.timestamp).toLocaleString()}
                        </p>
                        {entry.details && <p className="mt-1 text-xs text-white/70 italic flex items-start gap-1.5"><ChatBubbleLeftEllipsisIcon className="w-3 h-3 mt-0.5 flex-shrink-0" /> "{entry.details}"</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AuditTrail;