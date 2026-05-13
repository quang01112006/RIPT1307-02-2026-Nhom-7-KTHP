import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getPosts(params: BaiViet.IQuery) {
	return axios.get(`${ip3}/posts`, { params });
}

export async function getPostDetail(id: string) {
	return axios.get(`${ip3}/posts/${id}`);
}

export async function createPost(payload: { title: string; content: string; tags?: string[]; files?: string[] }) {
	return axios.post(`${ip3}/posts`, payload);
}

export async function updatePost(id: string, payload: Partial<BaiViet.IRecord>) {
	return axios.patch(`${ip3}/posts/${id}`, payload);
}

export async function deletePost(id: string) {
	return axios.delete(`${ip3}/posts/${id}`);
}

export async function toggleVotePost(id: string, type: 'up' | 'down') {
	return axios.patch(`${ip3}/posts/${id}/vote`, { type });
}
