import { getTagColor } from '@/utils/utils';
import { ArrowDownOutlined, ArrowUpOutlined, CommentOutlined, ShareAltOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Space, Tag, Typography, message } from 'antd';
import moment from 'moment';
import React from 'react';
import styles from '../index.less';

const { Text, Title } = Typography;

interface BaiVietChinhProps {
	post: BaiViet.IRecord | undefined;
	postScore: number;
	hasUpvoted: boolean;
	hasDownvoted: boolean;
	onVote: (type: 'up' | 'down') => void;
	onCommentClick: () => void;
}

const BaiVietChinh: React.FC<BaiVietChinhProps> = ({
	post,
	postScore,
	hasUpvoted,
	hasDownvoted,
	onVote,
	onCommentClick,
}) => {
	if (!post) return null;

	const fallbackCopyTextToClipboard = (text: string) => {
		const textArea = document.createElement('textarea');
		textArea.value = text;

		// ẩn đi cho đỡ bị scroll
		textArea.style.top = '0';
		textArea.style.left = '0';
		textArea.style.position = 'fixed';
		textArea.style.opacity = '0';

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			const successful = document.execCommand('copy');
			if (successful) {
				message.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm! ');
			} else {
				message.error('Không thể tự động sao chép liên kết');
			}
		} catch (err) {
			message.error('Không thể tự động sao chép liên kết');
		}

		document.body.removeChild(textArea);
	};

	const handleShare = () => {
		const shareUrl = window.location.href;

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard
				.writeText(shareUrl)
				.then(() => {
					message.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
				})
				.catch(() => {
					fallbackCopyTextToClipboard(shareUrl);
				});
		} else {
			// dùng cờ cổ cho http vs đt chung wifi
			fallbackCopyTextToClipboard(shareUrl);
		}
	};

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
					<Button icon={<CommentOutlined />} type='text' onClick={onCommentClick}>
						Trả lời
					</Button>

					<Button icon={<ShareAltOutlined />} type='text' onClick={handleShare}>
						Chia sẻ
					</Button>
				</Space>
			</div>
		</Card>
	);
};

export default BaiVietChinh;
