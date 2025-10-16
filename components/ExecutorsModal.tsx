import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserRole } from '../constants';

interface ExecutorsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: { mainExecutorId: number, coExecutorIds: number[], contributorIds: number[] }) => void;
    users: User[];
    initialData: {
        mainExecutorId?: number;
        coExecutorIds: number[];
        contributorIds: number[];
    };
    isLoading: boolean;
}

const ExecutorsModal: React.FC<ExecutorsModalProps> = ({ isOpen, onClose, onSave, users, initialData, isLoading }) => {
    const [selectedMainExecutor, setSelectedMainExecutor] = useState<number | undefined>(initialData.mainExecutorId);
    const [selectedCoExecutors, setSelectedCoExecutors] = useState<number[]>(initialData.coExecutorIds);
    const [selectedContributors, setSelectedContributors] = useState<number[]>(initialData.contributorIds);

    useEffect(() => {
        if (isOpen) {
            setSelectedMainExecutor(initialData.mainExecutorId);
            setSelectedCoExecutors(initialData.coExecutorIds);
            setSelectedContributors(initialData.contributorIds);
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!selectedMainExecutor) {
            alert("Asosiy ijrochini tanlang!");
            return;
        }
        onSave({
            mainExecutorId: selectedMainExecutor,
            coExecutorIds: selectedCoExecutors,
            contributorIds: selectedContributors,
        });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="executors-modal-title"
        >
            <div className="w-full max-w-2xl p-6 text-white bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <h2 id="executors-modal-title" className="text-2xl font-bold mb-4">Ijrochilarni Tahrirlash</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-white/80">Asosiy Ijrochi (Majburiy)</label>
                        <select value={selectedMainExecutor} onChange={(e) => setSelectedMainExecutor(Number(e.target.value))} className="w-full p-2 bg-white/10 border border-white/20 rounded-md">
                            <option value="" disabled>Tanlang...</option>
                            {users.map(u => <option key={u.id} value={u.id} className="text-black">{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-white/80">Qo'shimcha Ijrochilar</label>
                        <select multiple value={selectedCoExecutors.map(String)} onChange={(e) => setSelectedCoExecutors(Array.from(e.target.selectedOptions, option => Number(option.value)))} className="w-full p-2 h-32 bg-white/10 border border-white/20 rounded-md">
                            {users.filter(u => u.role === UserRole.Tarmoq).map(u => <option key={u.id} value={u.id} className="text-black p-1">{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-white/80">Ishtirokchilar</label>
                        <select multiple value={selectedContributors.map(String)} onChange={(e) => setSelectedContributors(Array.from(e.target.selectedOptions, option => Number(option.value)))} className="w-full p-2 h-32 bg-white/10 border border-white/20 rounded-md">
                            {users.map(u => <option key={u.id} value={u.id} className="text-black p-1">{u.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-white/20">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Bekor qilish</button>
                    <button type="button" onClick={handleSave} disabled={isLoading} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark">Saqlash</button>
                </div>
            </div>
        </div>
    );
};

export default ExecutorsModal;