import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getCommentsByPost(postId: string) {
	return axios.get(`${ip3}/comments/post/${postId}`);
}

export async function createComment(payload: { content: string; post: string }) {
	return axios.post(`${ip3}/comments`, payload);
}

export async function updateComment(id: string, content: string) {
	return axios.patch(`${ip3}/comments/${id}`, { content });
}

export async function deleteComment(id: string) {
	return axios.delete(`${ip3}/comments/${id}`);
}

export async function toggleVoteComment(id: string, type: 'up' | 'down') {
	return axios.patch(`${ip3}/comments/${id}/vote`, { type });
}
