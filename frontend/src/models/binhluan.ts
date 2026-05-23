import useInitModel from '@/hooks/useInitModel';
import { getCommentsByPost, toggleVoteComment } from '@/services/BinhLuan';
import { getUserComments } from '@/services/base/api';
import { ip3 } from '@/utils/ip';
import { message } from 'antd';
import { useState } from 'react';

export default () => {
	const objInit = useInitModel<BinhLuan.IRecord>('comments', undefined, undefined, ip3);
	const { setLoading, setDanhSach, setTotal } = objInit;
	const [userComments, setUserComments] = useState<any[]>([]);

	const getCommentsByPostModel = async (postId: string) => {
		setLoading(true);
		try {
			const res = await getCommentsByPost(postId);
			// Backend trả về { data: { result, total } }
			setDanhSach(res.data?.data?.result ?? []);
			setTotal(res.data?.data?.total ?? 0);
		} catch (error) {
			message.error('Không thể tải bình luận');
		} finally {
			setLoading(false);
		}
	};

	const voteCommentModel = async (id: string, type: 'up' | 'down', postId: string) => {
		try {
			await toggleVoteComment(id, type);
			getCommentsByPostModel(postId);
		} catch (error) {
			message.error('Lỗi khi bình chọn');
		}
	};

	const getCommentsByAuthorModel = async (authorId: string) => {
		setLoading(true);
		try {
			const res = await getUserComments(authorId);
			setUserComments(res.data?.data?.result || []);
		} catch (error) {
			console.error('Lỗi tải comment của user:', error);
		} finally {
			setLoading(false);
		}
	};

	return {
		...objInit,
		getCommentsByPostModel,
		voteCommentModel,
		userComments,
		getCommentsByAuthorModel,
	};
};
