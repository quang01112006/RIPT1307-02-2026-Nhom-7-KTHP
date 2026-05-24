import {
	deleteAllNotifications,
	deleteNotification,
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
	markNotificationAsUnread,
} from '@/services/base/api';
import socket from '@/utils/socket';
import { BellOutlined, CheckCircleOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';

export default () => {
	const [notifications, setNotifications] = useState<any[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);

	const fetchNotifications = async () => {
		setLoading(true);
		try {
			const res = await getNotifications();
			const list = res?.data?.data?.result || res?.data?.result || [];
			setNotifications(list);
			setUnreadCount(list.filter((n: any) => !n.isRead).length);
		} catch (error) {
			console.error('Error fetching notifications:', error);
		} finally {
			setLoading(false);
		}
	};

	const { initialState } = useModel('@@initialState');

	useEffect(() => {
		fetchNotifications();

		if (socket.connected) {
			socket.disconnect();
		}
		if (initialState?.currentUser) {
			socket.connect();
		}

		const handleNewNotif = (newNotif: any) => {
			setNotifications((prev) => [newNotif, ...prev]);
			setUnreadCount((prev) => prev + 1);

			const getIcon = (type: string) => {
				switch (type) {
					case 'UPVOTE':
						return React.createElement(LikeOutlined, { style: { color: '#eb2f96' } });
					case 'REPLY':
						return React.createElement(MessageOutlined, { style: { color: '#1890ff' } });
					case 'ACCEPTED':
						return React.createElement(CheckCircleOutlined, { style: { color: '#52c41a' } });
					default:
						return React.createElement(BellOutlined, { style: { color: '#1890ff' } });
				}
			};

			notification.open({
				message: newNotif.title,
				description: newNotif.message,
				placement: 'bottomRight',
				icon: getIcon(newNotif.type),
			});
		};

		socket.on('NEW_NOTIFICATION', handleNewNotif);

		return () => {
			socket.off('NEW_NOTIFICATION', handleNewNotif);
		};
	}, [initialState?.currentUser?._id]);

	const markAsRead = async (id: string) => {
		try {
			await markNotificationAsRead(id);
			setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error('Error marking as read:', error);
		}
	};

	const markAsUnread = async (id: string) => {
		try {
			await markNotificationAsUnread(id);
			setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)));
			setUnreadCount((prev) => prev + 1);
		} catch (error) {
			console.error('Error marking as unread:', error);
		}
	};

	const markAllAsReadModel = async () => {
		try {
			await markAllNotificationsAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error('Error marking all as read:', error);
		}
	};

	const deleteModel = async (id: string) => {
		try {
			await deleteNotification(id);
			setNotifications((prev) => {
				const item = prev.find((n) => n._id === id);
				if (item && !item.isRead) {
					setUnreadCount((count) => Math.max(0, count - 1));
				}
				return prev.filter((n) => n._id !== id);
			});
		} catch (error) {
			console.error('Error deleting notification:', error);
		}
	};

	const deleteAllModel = async () => {
		try {
			await deleteAllNotifications();
			setNotifications([]);
			setUnreadCount(0);
		} catch (error) {
			console.error('Error deleting all notifications:', error);
		}
	};

	return {
		notifications,
		unreadCount,
		loading,
		setNotifications,
		setUnreadCount,
		fetchNotifications,
		markAsRead,
		markAsUnread,
		markAllAsReadModel,
		deleteModel,
		deleteAllModel,
	};
};
