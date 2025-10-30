import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { DashboardIcon, UsersIcon, KeyIcon, LogoutIcon, ScaleIcon, ServerStackIcon } from './icons/IconComponents';

// Иконки для новых страниц (SVG inline)
const MonitoringIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const MeetingsIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ReceptionIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const KPIIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const Taskbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, roles: Object.values(UserRole) },
        { path: '/monitoring', label: 'Monitoring', icon: <MonitoringIcon />, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
        { path: '/meetings', label: 'Yig\'ilishlar', icon: <MeetingsIcon />, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
        { path: '/reception', label: 'Qabul', icon: <ReceptionIcon />, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
        { path: '/kpi', label: 'KPI', icon: <KPIIcon />, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
        { path: '/collegial', label: 'Kollegial', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
        { path: '/reports', label: 'Hisobotlar', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
        { path: '/discipline', label: 'Intizom', icon: <ScaleIcon />, roles: [UserRole.Admin, UserRole.BankApparati, UserRole.Boshqaruv] },
        { path: '/users', label: 'Foydalanuvchilar', icon: <UsersIcon />, roles: [UserRole.Admin] },
        { path: '/roles', label: 'Rollar', icon: <KeyIcon />, roles: [UserRole.Admin] },
        { path: '/api-docs', label: 'API', icon: <ServerStackIcon />, roles: [UserRole.Admin] },
    ];

    // ИСПРАВЛЕНИЕ: user.role.name
    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role.name as UserRole));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center justify-center gap-4 h-16 px-6 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
                <nav className="flex items-center gap-2">
                    {filteredNavItems.map(item => (
                        <div key={item.path} className="relative group">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
                                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                            </NavLink>
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                {item.label}
                                <div className="absolute top-full left-1/2 -ml-1 w-2 h-2 bg-white transform rotate-45"></div>
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="w-px h-8 bg-white/20"></div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center"
                        aria-haspopup="true"
                        aria-expanded={isUserMenuOpen}
                    >
                        <img
                            className="w-10 h-10 rounded-full border-2 border-white/50"
                            src={`https://i.pravatar.cc/150?u=${user?.email}`}
                            alt="User avatar"
                        />
                    </button>

                    {isUserMenuOpen && (
                        <div
                            className="absolute right-0 bottom-full mb-3 w-56 origin-bottom-right rounded-lg shadow-lg bg-slate-800/80 backdrop-blur-xl border border-white/20 ring-1 ring-black ring-opacity-5 focus:outline-none"
                            role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button"
                        >
                            <div className="py-1" role="none">
                                <div className="px-4 py-2 border-b border-white/10">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-white/70 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate('/settings');
                                    }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                                    role="menuitem"
                                >
                                    <SettingsIcon />
                                    <span>Sozlamalar</span>
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                                    role="menuitem"
                                >
                                    <LogoutIcon className="w-5 h-5" />
                                    <span>Chiqish</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Taskbar;