import axios from '@/utils/axios';
import { ip3, ipNotif } from '@/utils/ip';
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

export async function createSetting(payload: any, ip?: string) {
	const baseUrl = ip ?? ip3;
	return axios.post(`${baseUrl}/settings`, payload);
}

export async function getByKey(key: string, ip?: string) {
	const baseUrl = ip ?? ip3;
	return axios.get(`${baseUrl}/settings/${key}`);
}

export async function getSettingByKey(key: string, ip?: string) {
	const baseUrl = ip ?? ip3;
	return axios.get(`${baseUrl}/settings/${key}`);
}

export async function putSetting(payload: any, ip?: string) {
	const baseUrl = ip ?? ip3;
	return axios.put(`${baseUrl}/settings/${payload.key}`, payload);
}

export async function updateSetting(id: string, payload: any, ip?: string) {
	const baseUrl = ip ?? ip3;
	return axios.patch(`${baseUrl}/settings/${id}`, payload);
}

export async function getPermission() {
	return axios.get(`${ip3}/auth/permissions`);
}

export async function getUserInfo() {
	return axios.get(`${ip3}/users/me`);
}

export async function initOneSignal(payload: { playerId?: string }) {
	return axios.post(`${ipNotif}/onesignal/init`, payload);
}

export async function deleteOneSignal(payload: { playerId?: string }) {
	return axios.post(`${ipNotif}/onesignal/delete`, payload);
}
