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

export async function updateMe(id: string, payload: { fullName?: string; avatar?: string }) {
	return axios.patch(`${ip3}/users/${id}`, payload);
}

export async function deleteUser(id: string) {
	return axios.delete(`${ip3}/users/${id}`);
}

export async function getAllUser() {
	return axios.get(`${ip3}/users`);
}

export async function toggleUserActive(id: string) {
	return axios.patch(`${ip3}/users/${id}/toggle-active`);
}
