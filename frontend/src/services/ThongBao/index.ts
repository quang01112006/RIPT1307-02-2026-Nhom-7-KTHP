import axios from '@/utils/axios';
import { ipNotif } from '@/utils/ip';

export async function postReceiver(payload: any, params?: any) {
	return axios.post(`${ipNotif}/receiver`, payload, {
		params,
	});
}

export async function getThongBao(params?: any) {
	return axios.get(`${ipNotif}/notification`, {
		params,
	});
}

export async function readNotification(payload: any) {
	return axios.post(`${ipNotif}/notification/read`, payload);
}

export async function guiThongBaoDanhSach(payload: any) {
	return axios.post(`${ipNotif}/notification/send`, payload);
}

export async function importNguoiNhanThongBao(payload: any, role?: string) {
	const url = role ? `${ipNotif}/notification/import/${role}` : `${ipNotif}/notification/import`;
	return axios.post(url, payload);
}

export async function thongKeNotificationNguoiNhan(id: string) {
	return axios.get(`${ipNotif}/notification/${id}/stats`);
}

export async function dowLoadBieuMauNguoiNhan() {
	return axios.get(`${ipNotif}/notification/template`, { responseType: 'blob' });
}
