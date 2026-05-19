import { ArrowDownOutlined, ArrowUpOutlined, CommentOutlined, ShareAltOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Space, Tag, Typography } from 'antd';
import moment from 'moment';
import React from 'react';
import { getTagColor } from '@/utils/utils';
import styles from '../index.less';

const { Text, Title } = Typography;

interface BaiVietChinhProps {
	post: BaiViet.IRecord | undefined;
	postScore: number;
	hasUpvoted: boolean;
	hasDownvoted: boolean;
	onVote: (type: 'up' | 'down') => void;
}

const BaiVietChinh: React.FC<BaiVietChinhProps> = ({ post, postScore, hasUpvoted, hasDownvoted, onVote }) => {
	if (!post) return null;

	return (
		<Card hoverable bordered={false} style={{ height: 'auto' }} title={<Title level={3}>{post.title}</Title>}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
				<Space split={<Divider type='vertical' style={{ borderColor: '#bfbfbf' }} />}>
					<Space>
						<Avatar src={post.author?.avatar} icon={<UserOutlined />} />
						<Text type='secondary'>{post.author?.fullName || '--'}</Text>
					</Space>
					<Text type='secondary'>Đăng {moment(post.createdAt).fromNow() || '--'}</Text>
					<Text type='secondary'>{post.views || 0} lượt xem</Text>
				</Space>

				<Space>
					{post.tags?.map((t) => (
						<Tag
							key={t}
							color={getTagColor(t)}
							style={{
								borderRadius: '100px',
								padding: '2px 12px',
								fontSize: '13px',
								fontWeight: 500,
							}}
						>
							{t}
						</Tag>
					))}
				</Space>
			</div>

			<div
				className={styles.postContent}
				dangerouslySetInnerHTML={{ __html: post.content || '' }}
				style={{ wordBreak: 'break-word' }}
			/>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					marginTop: '20px',
					borderTop: '1px solid #f0f0f0',
					paddingTop: '16px',
				}}
			>
				<Space>
					<Button
						className={styles.voteUpBtn}
						type='text'
						icon={<ArrowUpOutlined />}
						style={{
							height: 'auto',
							padding: '4px',
							color: hasUpvoted ? '#1890ff' : undefined,
							backgroundColor: hasUpvoted ? 'rgba(24, 144, 255, 0.08)' : undefined,
						}}
						onClick={() => onVote('up')}
					/>
					<Text strong style={{ fontSize: '20px', display: 'block', textAlign: 'center' }}>
						{postScore}
					</Text>
					<Button
						type='text'
						className={styles.voteDownBtn}
						icon={<ArrowDownOutlined />}
						style={{
							height: 'auto',
							padding: '4px',
							color: hasDownvoted ? '#ff4d4f' : undefined,
							backgroundColor: hasDownvoted ? 'rgba(255, 77, 79, 0.08)' : undefined,
						}}
						onClick={() => onVote('down')}
					/>
					<Button icon={<CommentOutlined />} type='text'>
						Trả lời
					</Button>

					<Button icon={<ShareAltOutlined />} type='text'>
						Chia sẻ
					</Button>
				</Space>
			</div>
		</Card>
	);
};

export default BaiVietChinh;
