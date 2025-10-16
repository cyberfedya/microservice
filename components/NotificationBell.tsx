import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification as antdNotification } from 'antd';
import { getNotifications, markNotificationAsRead } from '../services/api';
import { Notification } from '../types';
import { BellIcon } from './icons/IconComponents';

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const newNotifications = await getNotifications();
            if (newNotifications.length > notifications.length) {
                // Find the truly new notification to show a popup
                const latestNew = newNotifications.find(n => !notifications.some(on => on.id === n.id));
                if (latestNew) {
                    antdNotification.open({
                        message: 'Yangi xabarnoma',
                        description: latestNew.message,
                        placement: 'bottomRight',
                    });
                }
            }
            setNotifications(newNotifications);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications(); // Fetch on initial load
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        try {
            await markNotificationAsRead(notification.id);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            setIsOpen(false);
            if (notification.link) {
                navigate(notification.link);
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-white/20">
                <BellIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-gray-900/40" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-white/20 rounded-lg shadow-lg z-50">
                    <div className="p-3 font-bold border-b border-white/10">
                        Xabarnomalar
                    </div>
                    <ul className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <li key={n.id}>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handleNotificationClick(n); }}
                                        className="block px-4 py-3 text-sm text-white/80 hover:bg-white/10"
                                    >
                                        <p>{n.message}</p>
                                        <p className="text-xs text-white/50 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                    </a>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-5 text-center text-sm text-white/60">
                                Yangi xabarnomalar yo'q.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;