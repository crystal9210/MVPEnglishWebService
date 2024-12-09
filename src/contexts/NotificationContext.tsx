// context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { container } from '@/containers/diContainer';
import { Notification } from '@/schemas/notificationSchema';
import { useSession } from 'next-auth/react';

interface NotificationContextProps {
    notifications: { id: string } & Notification[];
    markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC = ({ children }) => {
    const [notifications, setNotifications] = useState<{ id: string } & Notification[]>([]);
    const notificationRepo = container.resolve(NotificationRepository);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            const fetchNotifications = async () => {
                const fetchedNotifications = await notificationRepo.getAllNotifications(session.user.id);
                setNotifications(fetchedNotifications);
            };
            fetchNotifications();
        }
    }, [status, session, notificationRepo]);

    const markAsRead = async (id: string) => {
        if (status === "authenticated" && session?.user?.id) {
            await notificationRepo.markAsRead(session.user.id, id);
            setNotifications(prev =>
                prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
            );
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
