import useInitModel from '@/hooks/useInitModel';
import { toggleVotePost } from '@/services/BaiViet';
import { getUserPosts } from '@/services/base/api';
import { ip3 } from '@/utils/ip';
import { message } from 'antd';
import { useState } from 'react';

export default () => {
	const objInit = useInitModel<BaiViet.IRecord>('posts', undefined, undefined, ip3);
	const { setLoading, getByIdModel } = objInit;
	const [userPosts, setUserPosts] = useState<BaiViet.IRecord[]>([]);

	const voteBaiVietModel = async (id: string, type: 'up' | 'down') => {
		setLoading(true);
		try {
			await toggleVotePost(id, type);
			await getByIdModel(id);
		} catch (error) {
			console.error('Lỗi khi vote:', error);
		} finally {
			setLoading(false);
		}
	};

	const getPostsByAuthorModel = async (authorId: string) => {
		setLoading(true);
		try {
			const res = await getUserPosts(authorId);
			setUserPosts(res?.data?.data?.result || []);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return { ...objInit, voteBaiVietModel, userPosts, getPostsByAuthorModel };
};
