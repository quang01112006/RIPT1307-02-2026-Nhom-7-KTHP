import { FileTextOutlined, MessageOutlined } from '@ant-design/icons';
import { List, Segmented, Spin, Typography, Card, Space, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link } from 'umi';
import { getUserPosts, getUserComments } from '@/services/base/api';

const { Text, Title } = Typography;

interface Props {
	user: any;
}

const ActivityTab = ({ user }: Props) => {
	const [type, setType] = useState<string | number>('posts');
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<any[]>([]);

	const fetchData = async () => {
		setLoading(true);
		try {
			if (type === 'posts') {
				const res = await getUserPosts(user._id);
				setData(res.data?.data?.result || []);
			} else {
				const res = await getUserComments(user._id);
				setData(res.data?.data?.result || []);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user?._id) {
			fetchData();
		}
	}, [user?._id, type]);

	return (
		<div>
			<div style={{ marginBottom: 24 }}>
				<Segmented
					size='large'
					value={type}
					onChange={setType}
					options={[
						{
							label: (
								<div style={{ padding: 4 }}>
									<FileTextOutlined style={{ marginRight: 8 }} />
									Câu hỏi
								</div>
							),
							value: 'posts',
						},
						{
							label: (
								<div style={{ padding: 4 }}>
									<MessageOutlined style={{ marginRight: 8 }} />
									Câu trả lời
								</div>
							),
							value: 'comments',
						},
					]}
				/>
			</div>

			<Spin spinning={loading}>
				{type === 'posts' ? (
					<List
						itemLayout='vertical'
						dataSource={data}
						locale={{ emptyText: 'Chưa có câu hỏi nào' }}
						renderItem={(item) => (
							<List.Item key={item._id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
								<div style={{ marginBottom: 8 }}>
									<Link to={`/post/${item._id}`} style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
										{item.title}
									</Link>
								</div>
								<Space size='middle' style={{ marginBottom: 8 }}>
									{item.tags?.map((tag: string) => (
										<Tag key={tag}>{tag}</Tag>
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
				) : (
					<List
						itemLayout='vertical'
						dataSource={data}
						locale={{ emptyText: 'Chưa có câu trả lời nào' }}
						renderItem={(item) => (
							<List.Item key={item._id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
								<div style={{ marginBottom: 8 }}>
									<Text type='secondary'>Đã trả lời bài viết: </Text>
									<Link to={`/post/${item.post?._id || item.post}`} style={{ fontWeight: 600 }}>
										{item.post?.title || 'Bài viết'}
									</Link>
								</div>
								<Card size='small' style={{ background: '#f9f9f9', border: 'none' }}>
									<div dangerouslySetInnerHTML={{ __html: item.content }} />
								</Card>
								<div style={{ marginTop: 8 }}>
									<Text type='secondary'>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
								</div>
							</List.Item>
						)}
					/>
				)}
			</Spin>
		</div>
	);
};

export default ActivityTab;
