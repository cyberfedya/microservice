import React, { useState, useMemo } from 'react';
import { User, Department } from '../types';
import DepartmentTreeSelector from './DepartmentTreeSelector';

interface SendDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (departmentId: number, userId: number) => Promise<void>;
    departments: Department[];
    users: User[];
    isLoading?: boolean;
}

const SendDocumentModal: React.FC<SendDocumentModalProps> = ({
    isOpen,
    onClose,
    onSend,
    departments,
    users,
    isLoading = false
}) => {
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [error, setError] = useState('');

    // Фильтруем пользователей по выбранному департаменту
    const filteredUsers = useMemo(() => {
        if (!selectedDepartmentId) return [];
        return users.filter(user => 
            user.departmentId === selectedDepartmentId || 
            user.department?.id === selectedDepartmentId
        );
    }, [selectedDepartmentId, users]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedDepartmentId) {
            setError('Iltimos, departamentni tanlang');
            return;
        }

        if (!selectedUserId) {
            setError('Iltimos, xodimni tanlang');
            return;
        }

        try {
            await onSend(selectedDepartmentId, selectedUserId);
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Xatolik yuz berdi');
        }
    };

    const handleClose = () => {
        setSelectedDepartmentId(null);
        setSelectedUserId(null);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" 
            onClick={handleClose}
        >
            <div 
                className="w-full max-w-2xl p-6 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-6 text-2xl font-bold">Hujjatni yuborish</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department Selector */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-white/80">
                            Departamentni tanlang
                        </label>
                        <DepartmentTreeSelector
                            departments={departments}
                            selectedDepartmentId={selectedDepartmentId}
                            onSelect={setSelectedDepartmentId}
                        />
                    </div>

                    {/* User Selector */}
                    {selectedDepartmentId && (
                        <div>
                            <label htmlFor="user" className="block mb-2 text-sm font-medium text-white/80">
                                Xodimni tanlang
                            </label>
                            {filteredUsers.length === 0 ? (
                                <p className="text-sm text-white/60 p-4 bg-white/5 rounded-md">
                                    Bu departamentda xodimlar topilmadi
                                </p>
                            ) : (
                                <select
                                    id="user"
                                    value={selectedUserId || ''}
                                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                    required
                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white"
                                >
                                    <option value="" className="text-black">Xodimni tanlang...</option>
                                    {filteredUsers.map(user => (
                                        <option key={user.id} value={user.id} className="text-black bg-white">
                                            {user.name} - {user.role?.name || 'Rol ko\'rsatilmagan'}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-300 bg-red-900/30 p-3 rounded-md border border-red-400/50">
                            {error}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !selectedDepartmentId || !selectedUserId}
                            className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors min-w-[120px]"
                        >
                            {isLoading ? 'Yuborilmoqda...' : 'Yuborish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendDocumentModal;
