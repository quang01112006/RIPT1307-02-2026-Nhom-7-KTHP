import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import type { Login } from './typing';

export async function login(payload: { identifier: string; password: string }): Promise<Login.ILoginResponse> {
	return axios.post(`${ip3}/auth/login`, payload);
}

export async function register(payload: any) {
	return axios.post(`${ip3}/users/register`, payload);
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

export async function toggleBookmark(userId: string, postId: string) {
	return axios.post(`${ip3}/users/${userId}/bookmarks/${postId}`);
}
