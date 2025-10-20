// docmanageapp/components/RoleManagement.tsx
import React, { useEffect, useState } from 'react';
import { Role } from '../types';
import { getRoles, addRole, updateRole, deleteRole } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { Navigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from './icons/IconComponents';

const RoleManagement: React.FC = () => {
    const { user } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const emptyForm = { name: '', description: '' };
    const [formData, setFormData] = useState<Omit<Role, 'id'>>(emptyForm);

    const fetchRoles = () => {
        setLoading(true);
        setError('');
        getRoles().then(data => {
            setRoles(data);
            setLoading(false);
        }).catch(() => {
            setError('Failed to fetch roles.');
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenModal = (roleToEdit: Role | null) => {
        setEditingRole(roleToEdit);
        if (roleToEdit) {
            // Убедимся, что description не undefined перед установкой
            setFormData({ name: roleToEdit.name, description: roleToEdit.description || '' });
        } else {
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setFormData(emptyForm);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Убрал setLoading(true), т.к. оно перекрывает окно до закрытия
        setError('');
        try {
            if (editingRole) {
                // В API мы обновляем только description
                await updateRole(editingRole.id, { description: formData.description });
            } else {
                // Убедимся, что передаем правильный тип
                await addRole({ name: formData.name, description: formData.description });
            }
            fetchRoles(); // Обновляем список после успешного действия
            handleCloseModal(); // Закрываем модальное окно
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
            // Не закрываем окно при ошибке, чтобы пользователь видел сообщение
            // setLoading(false) не нужно, т.к. убрали setLoading(true)
        }
        // finally блок не нужен, т.к. setLoading убран
    };


    const handleDelete = async (roleId: number) => {
        if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            // setLoading(true); // Можно добавить, если удаление долгое
            setError('');
            try {
                await deleteRole(roleId);
                fetchRoles(); // Обновляем список после удаления
            } catch (err: any) {
                 // Используем setError вместо alert для консистентности
                setError(err.message || 'Failed to delete role.');
                // setLoading(false); // Если добавляли setLoading(true)
            }
            // finally блок не нужен
        }
    };

    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    // Сравниваем имя роли из объекта user с enum значением
    if (user?.role?.name !== UserRole.Admin) {
        // Если пользователь не админ, перенаправляем на дашборд
        return <Navigate to="/dashboard" />;
    }
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---


    // Если пользователь админ, отображаем компонент
    return (
        <div className="space-y-6 text-white">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Role Management</h1>
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg shadow hover:bg-primary-dark transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    <span>Add New Role</span>
                </button>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md border border-red-400/50">{error}</p>} {/* Улучшил отображение ошибки */}
            <div className="overflow-hidden rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-white/80">
                        <thead className="text-xs text-white/90 uppercase bg-white/10">
                            <tr>
                                <th scope="col" className="px-6 py-3">Role Name</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className="text-center p-5 animate-pulse">Loading roles...</td></tr>
                            ) : (
                                roles.map(r => (
                                    <tr key={r.id} className="border-b border-white/10 hover:bg-white/20">
                                        <td className="px-6 py-4 font-medium text-white">{r.name}</td>
                                        <td className="px-6 py-4">{r.description || '-'}</td> {/* Отображаем прочерк если нет описания */}
                                        <td className="px-6 py-4 space-x-2 text-center">
                                            <button onClick={() => handleOpenModal(r)} className="p-2 text-cyan-300 rounded-full hover:bg-cyan-500/30 transition-colors" aria-label="Edit role"><PencilIcon className="w-5 h-5"/></button>
                                            {/* Добавим проверку, чтобы нельзя было удалить стандартные роли, если нужно */}
                                            {/* {![UserRole.Admin, ...другие стандартные].includes(r.name as UserRole) && ( */}
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                className={`p-2 rounded-full transition-colors ${r.name === UserRole.Admin ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/30'}`}
                                                aria-label="Delete role"
                                                disabled={r.name === UserRole.Admin} // Нельзя удалить роль Admin
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                            {/* )} */}
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && roles.length === 0 && (
                                <tr><td colSpan={3} className="text-center p-5 text-white/60">No roles found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleCloseModal} role="dialog" aria-modal="true">
                    <div className="w-full max-w-md p-6 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-2xl font-bold">{editingRole ? 'Edit Role' : 'Add New Role'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-white/80">Role Name</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md disabled:opacity-50" disabled={!!editingRole} />
                                    {editingRole && <p className="text-xs text-white/60 mt-1">Role name cannot be changed.</p>}
                                </div>
                                <div>
                                    <label htmlFor="description" className="block mb-1 text-sm font-medium text-white/80">Description</label>
                                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                </div>
                                {/* Показываем ошибку внутри модального окна */}
                                {error && <p className="text-sm text-red-300">{error}</p>}
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;