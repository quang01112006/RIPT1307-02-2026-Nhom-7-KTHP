import useInitModel from '@/hooks/useInitModel';
import { toggleVotePost } from '@/services/BaiViet';
import { ip3 } from '@/utils/ip';
import { message } from 'antd';

export default () => {
	const objInit = useInitModel<BaiViet.IRecord>('posts', undefined, undefined, ip3);
	const { setLoading, getModel } = objInit;
	const voteBaiVietModel = async (id: string, type: 'up' | 'down') => {
		setLoading(true);
		try {
			await toggleVotePost(id, type);
			message.success('Thao tác thành công');
			await getModel();
		} catch (error) {
			console.error('Lỗi khi vote:', error);
			message.error('Không thể thực hiện bình chọn');
		} finally {
			setLoading(false);
		}
	};
	return { ...objInit, voteBaiVietModel };
};
