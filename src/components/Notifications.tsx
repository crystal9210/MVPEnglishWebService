// components/NotificationList.tsx
import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { format } from 'date-fns';

const NotificationList: React.FC = () => {
    const { notifications, markAsRead } = useNotifications();

    return (
        <div className="fixed top-4 right-4 w-80 bg-white shadow-lg rounded-lg p-4 overflow-y-auto max-h-screen z-50">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-600">No notifications</p>
            ) : (
                notifications.map(notif => (
                    <div key={notif.id} className={`border-b py-2 ${notif.read ? 'bg-gray-100' : 'bg-white'}`}>
                        <p>{notif.message}</p>
                        <p className="text-xs text-gray-500">{format(notif.createdAt, 'yyyy-MM-dd HH:mm')}</p>
                        {!notif.read && (
                            <button
                                onClick={() => markAsRead(notif.id)}
                                className="text-blue-500 mt-1"
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default NotificationList;
