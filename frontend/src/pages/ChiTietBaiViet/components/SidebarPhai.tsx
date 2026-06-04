import { getTagColor } from '@/utils/utils';
import { FireOutlined, LinkOutlined, TagsOutlined } from '@ant-design/icons';
import { Card, Space, Tag } from 'antd';
import moment from 'moment';
import { Link, history } from 'umi';

interface SidebarPhaiProps {
	popularTags: string[];
	hotPosts: BaiViet.IRecord[];
	relatedPosts: BaiViet.IRecord[];
}

const SidebarPhai = ({ popularTags, hotPosts, relatedPosts }: SidebarPhaiProps) => {
	return (
		<Space direction='vertical' size={20} style={{ width: '100%' }}>
			{/* tags nổi bật */}
			<Card
				bordered={false}
				style={{
					borderRadius: '12px',
					boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
				}}
				bodyStyle={{ padding: '20px' }}
			>
				<div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '16px' }}>
					<Space>
						<TagsOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
						<span style={{ fontSize: '15px', fontWeight: 600, color: '#262626' }}>Các tag phổ biển</span>
					</Space>
				</div>

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{popularTags.length > 0 ? (
						popularTags.map((tag) => (
							<Tag
								key={tag}
								color={getTagColor(tag)}
								style={{
									borderRadius: '100px',
									padding: '3px 12px',
									fontSize: '13px',
									fontWeight: 500,
									cursor: 'pointer',
									transition: 'transform 0.15s ease',
								}}
								onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
								onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
								onClick={() => history.push(`/tags/${encodeURIComponent(tag)}`)}
							>
								{tag}
							</Tag>
						))
					) : (
						<span style={{ color: '#bfbfbf', fontStyle: 'italic', fontSize: '13px' }}>Chưa có từ khóa nào.</span>
					)}
				</div>
			</Card>

			{/* câu hỏi chung tag */}
			<Card
				bordered={false}
				style={{
					borderRadius: '12px',
					boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
				}}
				bodyStyle={{ padding: '20px' }}
			>
				<div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '16px' }}>
					<Space>
						<LinkOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
						<span style={{ fontSize: '15px', fontWeight: 600, color: '#262626' }}>Câu hỏi cùng chủ đề</span>
					</Space>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
					{relatedPosts.length > 0 ? (
						relatedPosts.map((item) => (
							<div
								key={item._id}
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '4px',
									borderBottom: '1px dashed #f5f5f5',
									paddingBottom: '10px',
								}}
							>
								<Link
									to={`/question/${item._id}`}
									style={{
										fontSize: '14px',
										fontWeight: 500,
										color: '#262626',
										lineHeight: '1.4',
										transition: 'color 0.2s',
									}}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#1890ff')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '#262626')}
								>
									{item.title}
								</Link>
								<div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#bfbfbf' }}>
									<span>{item.views || 0} lượt xem</span>
									<span>•</span>
									<span>{moment(item.createdAt).format('DD/MM/YYYY')}</span>
								</div>
							</div>
						))
					) : (
						<span style={{ color: '#bfbfbf', fontStyle: 'italic', fontSize: '13px' }}>
							Không có câu hỏi cùng chủ đề nào khác.
						</span>
					)}
				</div>
			</Card>

			{/* câu hỏi hot views */}
			<Card
				bordered={false}
				style={{
					borderRadius: '12px',
					boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
				}}
				bodyStyle={{ padding: '20px' }}
			>
				<div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '16px' }}>
					<Space>
						<FireOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
						<span style={{ fontSize: '15px', fontWeight: 600, color: '#262626' }}>Bài viết nổi bật</span>
					</Space>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
					{hotPosts.length > 0 ? (
						hotPosts.map((item) => (
							<div
								key={item._id}
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '4px',
									borderBottom: '1px dashed #f5f5f5',
									paddingBottom: '10px',
								}}
							>
								<Link
									to={`/question/${item._id}`}
									style={{
										fontSize: '14px',
										fontWeight: 500,
										color: '#262626',
										lineHeight: '1.4',
										transition: 'color 0.2s',
									}}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#1890ff')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '#262626')}
								>
									{item.title}
								</Link>
								<div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#bfbfbf' }}>
									<span>{item.views || 0} lượt xem</span>
									<span>•</span>
									<span>{moment(item.createdAt).format('DD/MM/YYYY')}</span>
								</div>
							</div>
						))
					) : (
						<span style={{ color: '#bfbfbf', fontStyle: 'italic', fontSize: '13px' }}>
							Chưa có bài viết nổi bật nào.
						</span>
					)}
				</div>
			</Card>
		</Space>
	);
};

export default SidebarPhai;
