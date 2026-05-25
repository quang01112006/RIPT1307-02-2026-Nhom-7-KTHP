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

// lấy thông tin 1 user
export async function getMe(): Promise<Login.IUser> {
	return axios.get(`${ip3}/users/me`);
}



export async function toggleUserActive(id: string) {
	return axios.patch(`${ip3}/users/${id}/toggle-active`);
}

export async function getUserProfile(id: string) {
	return axios.get(`${ip3}/users/${id}`);
}
