import { getUserBookmarks, toggleBookmark } from '@/services/base/api';
import { getTagColor } from '@/utils/utils';
import { List, Space, Spin, Tag, Typography, Button, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link } from 'umi';

const { Text } = Typography;

interface Props {
	user: any;
}

const BookmarksTab = ({ user }: Props) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<any[]>([]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await getUserBookmarks(user._id);
			setData(res.data?.data?.result || []);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleUnsave = async (postId: string) => {
		try {
			await toggleBookmark(user._id, postId);
			message.success('Đã bỏ lưu bài viết');
			fetchData();
		} catch (error) {
			message.error('Có lỗi xảy ra, vui lòng thử lại');
		}
	};

	useEffect(() => {
		if (user?._id) {
			fetchData();
		}
	}, [user?._id]);

	return (
		<div>
			<Spin spinning={loading}>
				<List
					itemLayout='vertical'
					dataSource={data}
					pagination={{
						pageSize: 5,
						hideOnSinglePage: true,
					}}
					locale={{ emptyText: 'Chưa có bài viết nào được lưu' }}
					renderItem={(item) => (
						<List.Item 
							key={item._id} 
							style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
							extra={
								<Popconfirm
									title="Bỏ lưu bài viết này?"
									onConfirm={() => handleUnsave(item._id)}
									okText="Có"
									cancelText="Không"
								>
									<Button 
										type="text" 
										icon={
											<span className="anticon" style={{ fontSize: '16px' }}>
												<svg viewBox="0 0 24 24" width="1em" height="1em" fill="#1890ff">
													<path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path>
												</svg>
											</span>
										}
										style={{ color: '#1890ff', fontWeight: 500 }}
									>
										Đã lưu
									</Button>
								</Popconfirm>
							}
						>
							<div style={{ marginBottom: 8 }}>
								<Link to={`/question/${item._id}`} style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
									{item.title}
								</Link>
							</div>
							<Space size='middle' style={{ marginBottom: 8 }}>
								{item.tags?.map((tag: string) => (
									<Tag key={tag} color={getTagColor(tag)}>
										{tag}
									</Tag>
								))}
							</Space>
							<div>
								<Text type='secondary'>
									{moment(item.createdAt).format('DD/MM/YYYY HH:mm')} • {item.views || 0} lượt xem
								</Text>
							</div>
						</List.Item>
					)}
				/>
			</Spin>
		</div>
	);
};

export default BookmarksTab;
