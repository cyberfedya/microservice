import React, { useEffect, useState, useCallback } from 'react'; // Добавлен useCallback
import { User, Role, Department } from '../types';
import { getUsers, addUser, updateUser, deleteUser, getRoles, getDepartments } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { Navigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from './icons/IconComponents';

// Оставляем emptyForm как изначальное пустое состояние
const initialEmptyForm = { name: '', email: '', password: '', role: '', department: '' };

const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Добавим состояние ошибки
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // formData теперь инициализируется initialEmptyForm
    const [formData, setFormData] = useState<any>(initialEmptyForm);

    // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ fetchData ---
    const fetchData = useCallback(async () => { // Используем useCallback + async/await
        setLoading(true);
        setError(''); // Сбрасываем ошибку при новой загрузке
        try {
            const [userData, roleData, deptData] = await Promise.all([
                getUsers(),
                getRoles(),
                getDepartments()
            ]);

            setUsers(userData);
            setRoles(roleData);
            setDepartments(deptData);

            console.log("Fetched Roles:", roleData); // Оставляем для проверки
            console.log("Fetched Departments:", deptData); // Оставляем для проверки

            // --- Устанавливаем ДЕФОЛТНЫЕ значения для НОВОГО пользователя ПРЯМО В СОСТОЯНИЕ ---
            // Делаем это только один раз при первой загрузке (когда role/department еще не установлены)
            // ИЛИ если formData сейчас содержит initialEmptyForm (т.е. модалка была закрыта)
            if (formData === initialEmptyForm) {
                 const defaultRoleName = roleData.length > 0 ? roleData[0].name : '';
                 const defaultDeptName = deptData.length > 0 ? deptData[0].name : '';
                 // Устанавливаем дефолты для следующего открытия модалки "Add New"
                 setFormData((prev: any) => ({
                     ...initialEmptyForm, // Сбрасываем все поля
                     role: defaultRoleName, // Устанавливаем дефолтную роль
                     department: defaultDeptName, // Устанавливаем дефолтный департамент
                 }));
                 console.log(`Set default role: ${defaultRoleName}, default dept: ${defaultDeptName}`);
            }

        } catch (err: any) {
            console.error("Failed to fetch initial data:", err);
            setError(err.message || 'Failed to load user management data. Please try again.');
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]); // Добавляем formData в зависимости, чтобы правильно установить дефолты после закрытия модалки

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Вызываем fetchData при монтировании и изменении (если нужно)

    // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ handleOpenModal ---
    const handleOpenModal = (userToEdit: User | null) => {
        setEditingUser(userToEdit);
        setError(''); // Сбрасываем ошибку при открытии модалки

        if (userToEdit) {
            // При редактировании устанавливаем текущие значения пользователя
            const roleName = typeof userToEdit.role === 'object' ? userToEdit.role.name : userToEdit.role;
            const departmentName = typeof userToEdit.department === 'object' ? userToEdit.department.name : userToEdit.department;
            setFormData({
                name: userToEdit.name || '',
                email: userToEdit.email,
                password: '', // Пароль всегда пустой при редактировании
                role: roleName,
                department: departmentName
            });
            console.log("Opening modal for EDIT:", { role: roleName, department: departmentName });
        } else {
            // При добавлении НОВОГО пользователя, используем текущие значения formData,
            // которые ДОЛЖНЫ были установиться с дефолтами в fetchData
             console.log("Opening modal for ADD with current formData:", formData);
             // Убедимся, что дефолты точно установлены, если вдруг formData не обновился
             const defaultRoleName = roles.length > 0 ? roles[0].name : '';
             const defaultDeptName = departments.length > 0 ? departments[0].name : '';
             setFormData({
                 ...initialEmptyForm, // Сбрасываем все, кроме роли и департамента
                 role: formData.role || defaultRoleName, // Используем текущее значение или дефолт
                 department: formData.department || defaultDeptName // Используем текущее значение или дефолт
             });
        }
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        // Сбрасываем formData к состоянию с дефолтами после закрытия
        const defaultRoleName = roles.length > 0 ? roles[0].name : '';
        const defaultDeptName = departments.length > 0 ? departments[0].name : '';
        setFormData({
             ...initialEmptyForm,
             role: defaultRoleName,
             department: defaultDeptName
        });
        setError(''); // Сбрасываем ошибку при закрытии
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Показываем загрузку на кнопке
        setError('');
        const dataToSend = { ...formData };

        try {
            if (editingUser) {
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await updateUser(editingUser.id, dataToSend);
            } else {
                 if (!dataToSend.password) { // Пароль обязателен при создании
                     throw new Error("Password is required for new users.");
                 }
                await addUser(dataToSend);
            }
            await fetchData(); // Перезагружаем данные ПОСЛЕ успешного сохранения
            handleCloseModal(); // Закрываем модалку ПОСЛЕ успешного сохранения
        } catch (err: any) {
             console.error("Submit error:", err);
             setError(err.message || 'Failed to save user.');
             // Оставляем модалку открытой при ошибке
        } finally {
            setLoading(false); // Убираем загрузку с кнопки в любом случае
        }
    };


    const handleDelete = async (userId: number) => {
        // Проверяем, не пытаемся ли удалить текущего пользователя или админа
        if (userId === user?.id) {
            setError("You cannot delete yourself.");
            return;
        }
        const userToDelete = users.find(u => u.id === userId);
         if (userToDelete?.role === UserRole.Admin) { // Сравниваем строку с enum
             setError("Cannot delete the Admin user.");
             return;
         }

        if (window.confirm('Are you sure you want to delete this user? This may fail if the user is associated with documents.')) {
            setLoading(true); // Можно показать общую загрузку
            setError('');
            try {
                await deleteUser(userId);
                await fetchData(); // Обновляем список пользователей
            } catch (err: any) {
                 console.error("Delete error:", err);
                 setError(err.message || 'Failed to delete user.');
            } finally {
                 setLoading(false);
            }
        }
    };


    if (user?.role?.name !== UserRole.Admin) {
        return <Navigate to="/dashboard" />;
    }

    // --- JSX без изменений, кроме кнопки Save ---
    return (
        <div className="space-y-6 text-white">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg shadow hover:bg-primary-dark transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    <span>Add User</span>
                </button>
            </div>
             {/* Отображаем общую ошибку */}
            {error && !isModalOpen && <p className="text-sm text-red-300 bg-red-900/30 p-3 rounded-md border border-red-400/50">{error}</p>}
            <div className="overflow-hidden rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-white/80">
                         <thead className="text-xs text-white/90 uppercase bg-white/10">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Department</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {loading && !isModalOpen ? ( // Показываем загрузку только если модалка не открыта
                                <tr><td colSpan={5} className="text-center p-5 animate-pulse">Loading users...</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="border-b border-white/10 hover:bg-white/20">
                                        <td className="px-6 py-4 font-medium text-white">{u.name || '-'}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">{u.role}</td> {/* Теперь это строка */}
                                        <td className="px-6 py-4">{u.department}</td> {/* Теперь это строка */}
                                        <td className="px-6 py-4 space-x-2 text-center">
                                            <button onClick={() => handleOpenModal(u)} className="p-2 text-cyan-300 rounded-full hover:bg-cyan-500/30 transition-colors" aria-label="Edit user"><PencilIcon className="w-5 h-5"/></button>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className={`p-2 rounded-full transition-colors ${u.role === UserRole.Admin || u.id === user?.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/30'}`}
                                                aria-label="Delete user"
                                                disabled={u.role === UserRole.Admin || u.id === user?.id} // Нельзя удалить Админа или себя
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && users.length === 0 && (
                                <tr><td colSpan={5} className="text-center p-5 text-white/60">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

             {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleCloseModal} role="dialog" aria-modal="true">
                    <div className="w-full max-w-md p-6 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-white/80">Full Name</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-white/80">Email Address</label>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block mb-1 text-sm font-medium text-white/80">Password {editingUser ? '(leave blank to keep current)' : ''}</label>
                                    <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required={!editingUser} className="w-full p-2 bg-white/10 border border-white/20 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="role" className="block mb-1 text-sm font-medium text-white/80">Role</label>
                                    <select name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white">
                                        {/* Добавляем опцию по умолчанию, если список пуст */}
                                        {roles.length === 0 && <option value="" disabled className="text-black">Loading...</option>}
                                        {roles.map(role => <option key={role.id} value={role.name} className="text-black bg-white">{role.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="department" className="block mb-1 text-sm font-medium text-white/80">Department</label>
                                    <select name="department" id="department" value={formData.department} onChange={handleChange} required className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white">
                                         {/* Добавляем опцию по умолчанию, если список пуст */}
                                        {departments.length === 0 && <option value="" disabled className="text-black">Loading...</option>}
                                        {departments.map(dept => <option key={dept.id} value={dept.name} className="text-black bg-white">{dept.name}</option>)}
                                    </select>
                                </div>
                                {/* Показываем ошибку внутри модального окна */}
                                {error && isModalOpen && <p className="text-sm text-red-300">{error}</p>}
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Cancel</button>
                                {/* Обновляем текст кнопки при загрузке */}
                                <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 min-w-[80px]"> {/* Добавил min-w */}
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;