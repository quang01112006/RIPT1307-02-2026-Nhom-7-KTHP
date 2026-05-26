import useInitModel from '@/hooks/useInitModel';
import { getCommentsByPost, toggleVoteComment } from '@/services/BinhLuan';
import { getUserComments } from '@/services/base/api';
import { ip3 } from '@/utils/ip';
import { message } from 'antd';
import { useState, useEffect } from 'react';
import socket from '@/utils/socket';

export default () => {
	const objInit = useInitModel<BinhLuan.IRecord>('comments', undefined, undefined, ip3);
	const { setLoading, setDanhSach, setTotal } = objInit;
	const [userComments, setUserComments] = useState<any[]>([]);

	useEffect(() => {
		const handleNewComment = (newComment: any) => {
			setDanhSach((prev: any[]) => {
				if (prev.some((c) => c._id === newComment._id)) return prev;
				if (prev.length > 0 && String(prev[0].post) !== String(newComment.post)) return prev;
				return [newComment, ...prev];
			});
			setTotal((prev: number) => prev + 1);
		};

		const handleUpdateComment = (updatedComment: any) => {
			setDanhSach((prev: any[]) =>
				prev.map((c) => (c._id === updatedComment._id ? updatedComment : c))
			);
		};

		const handleDeleteComment = (data: { _id: string }) => {
			setDanhSach((prev: any[]) => prev.filter((c) => c._id !== data._id));
			setTotal((prev: number) => Math.max(0, prev - 1));
		};

		socket.on('NEW_COMMENT', handleNewComment);
		socket.on('UPDATE_COMMENT', handleUpdateComment);
		socket.on('DELETE_COMMENT', handleDeleteComment);
		
		return () => {
			socket.off('NEW_COMMENT', handleNewComment);
			socket.off('UPDATE_COMMENT', handleUpdateComment);
			socket.off('DELETE_COMMENT', handleDeleteComment);
		};
	}, [setDanhSach, setTotal]);

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
			console.error('Lỗi khi bình chọn:', error);
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
