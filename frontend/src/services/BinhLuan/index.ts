import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getCommentsByPost(postId: string) {
	return axios.get(`${ip3}/comments/post/${postId}/page`);
}

export async function toggleVoteComment(id: string, type: 'up' | 'down') {
	return axios.put(`${ip3}/comments/${id}/vote`, { type });
}
