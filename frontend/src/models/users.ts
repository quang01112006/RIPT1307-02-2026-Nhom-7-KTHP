import useInitModel from '@/hooks/useInitModel';
import { ip3 } from '@/utils/ip';
import { toggleBookmark } from '@/services/base/api';
import { message } from 'antd';

export default () => {
	const objInit = useInitModel<any>('users', undefined, undefined, ip3);
	const { setLoading, setRecord } = objInit;


	const toggleBookmarkModel = async (userId: string, postId: string, isCurrentlyBookmarked: boolean) => {
		try {
			await toggleBookmark(userId, postId);
			message.success(!isCurrentlyBookmarked ? 'Đã lưu bài viết!' : 'Đã bỏ lưu bài viết!');
			return true; // Thành công
		} catch (error) {
			message.error('Có lỗi xảy ra khi lưu bài viết!');
			return false; // Thất bại
		}
	};

	return {
		...objInit,
		toggleBookmarkModel,
	};
};
