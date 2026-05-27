import axios from '@/utils/axios';
import type { AxiosResponse } from 'axios';
import { ip3 } from '@/utils/ip';
import type { Login } from './typing';

export async function login(payload: { identifier: string; password: string }): Promise<any> {
	return axios.post(`${ip3}/auth/login`, payload);
}

export async function register(payload: any) {
	return axios.post(`${ip3}/users/register`, payload);
}

export async function forgotPassword(email: string) {
	return axios.post(`${ip3}/auth/forgot-password`, { email });
}

export async function resetPassword(payload: any) {
	return axios.post(`${ip3}/auth/reset-password`, payload);
}

// lấy thông tin 1 user
export async function getMe(): Promise<Login.IUser> {
	return axios.get(`${ip3}/users/me`);
}

export async function toggleUserActive(id: string) {
	return axios.patch(`${ip3}/users/${id}/toggle-active`);
}

export async function getUserPosts(authorId: string) {
	return axios.get(`${ip3}/posts/page`, { params: { author: authorId } });
}

export async function getUserComments(authorId: string) {
	return axios.get(`${ip3}/comments/author/${authorId}/page`);
}

export async function getUserBookmarks(userId: string) {
	return axios.get(`${ip3}/users/${userId}/bookmarks`);
}

export const toggleBookmark = async (userId: string, postId: string) => {
	return axios.post(`${ip3}/users/${userId}/bookmarks/${postId}`);
};

export async function getNotifications() {
	return axios.get(`${ip3}/notifications/page`);
}

export async function markNotificationAsRead(id: string) {
	return axios.patch(`${ip3}/notifications/${id}/read`);
}

export async function markNotificationAsUnread(id: string) {
	return axios.patch(`${ip3}/notifications/${id}/unread`);
}

export async function markAllNotificationsAsRead() {
	return axios.patch(`${ip3}/notifications/read-all`);
}

export async function deleteNotification(id: string) {
	return axios.delete(`${ip3}/notifications/${id}`);
}

export async function deleteAllNotifications() {
	return axios.delete(`${ip3}/notifications/all`);
}
