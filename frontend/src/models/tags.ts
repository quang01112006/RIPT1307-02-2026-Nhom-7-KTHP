import useInitModel from '@/hooks/useInitModel';
import { getPostsByTag, getAllTags } from '@/services/Tags';
import { ip3 } from '@/utils/ip';
import { useState } from 'react';

export default () => {
	const objInit = useInitModel<Tags.IRecord>('tags', undefined, undefined, ip3);
	const { setLoading, danhSach, setDanhSach } = objInit;
	
	const [tagPosts, setTagPosts] = useState<any[]>([]);

	const getAllTagsModel = async () => {
		setLoading(true);
		try {
			const res = await getAllTags();
			const data = res?.data?.data || [];
			setDanhSach(data);
		} catch (error) {
			console.error('Lỗi khi tải danh sách tags:', error);
			setDanhSach([]);
		} finally {
			setLoading(false);
		}
	};

	const getPostsByTagModel = async (tagName: string, pageNum: number, limit: number) => {
		setLoading(true);
		try {
			const res = await getPostsByTag(tagName, pageNum, limit);
			const data = res?.data?.data;
			if (data?.result && Array.isArray(data.result)) {
				setTagPosts(data.result);
			} else if (Array.isArray(data)) {
				setTagPosts(data);
			} else {
				setTagPosts([]);
			}
		} catch (error) {
			console.error('Lỗi khi tải bài viết theo tag:', error);
			setTagPosts([]);
		} finally {
			setLoading(false);
		}
	};

	return {
		...objInit,
		tagPosts,
		getPostsByTagModel,
		getAllTagsModel,
	};
};
