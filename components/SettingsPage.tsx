import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_BASE = "http://localhost:5000";

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: '👤' },
    { id: 'language', label: 'Язык и регион', icon: '🌐' },
    { id: 'notifications', label: 'Уведомление', icon: '🔔' },
    { id: 'security', label: 'Безопасность', icon: '🔒' },
    { id: 'personalization', label: 'Персонализация', icon: '🎨' },
    { id: 'privacy', label: 'Конфеденциальность', icon: '🛡️' },
    { id: 'devices', label: 'Устройства и сессии', icon: '💻' },
    { id: 'support', label: 'Помощь и поддержка', icon: '❓' },
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при сохранении');
      }

      const data = await response.json();
      
      if (updateUser) {
        updateUser(data);
      }
      
      setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ошибка при сохранении' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают!' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при смене пароля');
      }
      
      setMessage({ type: 'success', text: 'Пароль успешно изменен!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ошибка при смене пароля' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Профиль</h2>
      
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-white">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition text-white text-sm">
            Загрузить
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
          <button
            onClick={handleDeleteAvatar}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition text-white text-sm"
          >
            Удалить
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Имя Фамилия</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="Иванов"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">+998 00 000 00 00</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="+998 90 123 45 67"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-2">Адрес Эл.П</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="ivanov@gmail.com"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-2">Адрес</label>
          <input
            type="text"
            value={profileData.address}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="Ташкент, Центральный"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-white/10 mt-6">
        <button className="text-sm text-blue-400 hover:text-blue-300 transition">
          Запросить изменения данностей/филиала
        </button>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setProfileData({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || '',
              });
              setAvatarPreview(null);
              setAvatarFile(null);
            }}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-white"
          >
            Отменить
          </button>
          <button
            onClick={handleProfileSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Безопасность</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Текущий пароль</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Новый пароль</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Подтвердите пароль</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white disabled:opacity-50"
        >
          {loading ? 'Изменение...' : 'Изменить пароль'}
        </button>
      </div>

      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Двухфакторная аутентификация</h3>
        <p className="text-sm text-gray-400 mb-4">
          Добавьте дополнительный уровень безопасности к вашей учетной записи
        </p>
        <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-white">
          Включить 2FA
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'language':
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Язык и регион</h2>
            <p className="text-gray-400">Настройки языка и региона будут доступны в следующей версии.</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Уведомления</h2>
            <p className="text-gray-400">Настройки уведомлений будут доступны в следующей версии.</p>
          </div>
        );
      default:
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <p className="text-gray-400">Эта секция находится в разработке.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden flex flex-col pb-24">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">SETTINGS</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">В роли: {user?.role?.name}</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full px-4 py-3 rounded-lg text-left transition flex items-center space-x-3 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-y-auto">
          <div className="p-8 pb-32">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
