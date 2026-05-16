import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function toggleVotePost(id: string, type: 'up' | 'down') {
	return axios.patch(`${ip3}/posts/${id}/vote`, { type });
}
