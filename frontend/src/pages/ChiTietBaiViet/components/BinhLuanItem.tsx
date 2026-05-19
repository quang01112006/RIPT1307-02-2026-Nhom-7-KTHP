import { ArrowDownOutlined, ArrowUpOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Space, Typography } from 'antd';
import moment from 'moment';
import React from 'react';
import ReplyForm from './ReplyForm';
import styles from '../index.less';

const { Text } = Typography;

interface BinhLuanItemProps {
	comment: BinhLuan.IRecord;
	userId?: string;
	currentUserAvatar?: string;
	isChild?: boolean;
	isLast?: boolean;
	directParent?: BinhLuan.IRecord | null;
	isReplyToChild?: boolean;
	onVote: (id: string, type: 'up' | 'down') => void;
	onSubmitReply: (content: string) => Promise<void>;
	replyingId: string | null;
	setReplyingId: (id: string | null) => void;
}

const BinhLuanItem: React.FC<BinhLuanItemProps> = ({
	comment,
	userId,
	currentUserAvatar,
	isChild = false,
	isLast = false,
	directParent = null,
	isReplyToChild = false,
	onVote,
	onSubmitReply,
	replyingId,
	setReplyingId,
}) => {
	const hasUpvoted = userId ? comment.upvotedBy?.includes(userId) : false;
	const hasDownvoted = userId ? comment.downvotedBy?.includes(userId) : false;
	const score = (comment.upvotedBy?.length || 0) - (comment.downvotedBy?.length || 0);

	const isReplyFormOpen = replyingId === comment._id;

	return (
		<div style={{ position: 'relative', padding: isChild ? '8px 0 12px 0' : '4px 0' }}>
			{/* Móc chữ L cong nghệ thuật (Chỉ vẽ cho bình luận con) */}
			{isChild && (
				<div
					style={{
						position: 'absolute',
						left: '-25px',
						top: '0px',
						width: '20px',
						height: '24px',
						borderLeft: '2px solid #e8e8e8',
						borderBottom: '2px solid #e8e8e8',
						borderBottomLeftRadius: '8px',
					}}
				/>
			)}

			{/* Đường nối dọc đi xuống tiếp (Chỉ hiện nếu chưa phải là con cuối cùng) */}
			{isChild && !isLast && (
				<div
					style={{
						position: 'absolute',
						left: '-25px',
						top: '24px',
						bottom: '0px',
						borderLeft: '2px solid #e8e8e8',
					}}
				/>
			)}

			{/* 1. Header (Avatar + Tên) */}
			<div
				style={{
					display: 'flex',
					gap: '8px',
					alignItems: 'center',
					marginBottom: isChild ? '6px' : '8px',
					flexWrap: 'wrap',
				}}
			>
				<Avatar
					src={comment.author?.avatar}
					icon={<UserOutlined />}
					size={isChild ? 'small' : undefined}
					style={{ width: isChild ? '24px' : '32px', height: isChild ? '24px' : '32px' }}
				/>
				<Text strong style={{ fontSize: isChild ? '13px' : '14px', color: isChild ? '#262626' : undefined }}>
					{comment.author?.fullName || 'Ẩn danh'}
				</Text>

				{/* Nhãn Mention khi trả lời bình luận con khác */}
				{isChild && isReplyToChild && directParent && (
					<span style={{ fontSize: '12px', color: '#8c8c8c' }}>
						phản hồi{' '}
						<Text strong style={{ color: '#1890ff', fontSize: '12px' }}>
							@{directParent.author?.fullName || 'Ẩn danh'}
						</Text>
					</span>
				)}

				<Text type='secondary' style={{ fontSize: isChild ? '12px' : '14px' }}>
					{isChild ? `• ${moment(comment.createdAt).fromNow()}` : moment(comment.createdAt).fromNow()}
				</Text>
			</div>

			{/* 2. Thân nội dung và nút vote */}
			<div
				style={{
					marginLeft: isChild ? '0px' : '16px',
					paddingLeft: isChild ? '32px' : '24px',
					borderLeft: !isChild && !isLast ? '2px solid #e8e8e8' : '2px solid transparent',
				}}
			>
				<div
					dangerouslySetInnerHTML={{ __html: comment.content || '' }}
					style={{
						fontSize: isChild ? '14px' : '15px',
						lineHeight: isChild ? '1.5' : '1.6',
						wordBreak: 'break-word',
						color: isChild ? '#434343' : undefined,
					}}
				/>

				<div
					style={{
						display: 'flex',
						gap: '16px',
						alignItems: 'center',
						marginTop: isChild ? '6px' : '8px',
						paddingBottom: isChild ? '0px' : '8px',
					}}
				>
					<Space size={2}>
						<Button
							className={styles.voteUpBtn}
							type='text'
							icon={<ArrowUpOutlined style={{ fontSize: isChild ? '11px' : '13px' }} />}
							style={{
								width: isChild ? '24px' : '28px',
								height: isChild ? '24px' : '28px',
								padding: 0,
								color: hasUpvoted ? '#1890ff' : undefined,
								backgroundColor: hasUpvoted ? 'rgba(24, 144, 255, 0.08)' : undefined,
							}}
							onClick={() => onVote(comment._id, 'up')}
						/>
						<Text
							strong
							style={{
								fontSize: isChild ? '12px' : '13px',
								color: isChild ? '#8c8c8c' : '#595959',
								minWidth: isChild ? '12px' : '16px',
								textAlign: 'center',
							}}
						>
							{score}
						</Text>
						<Button
							className={styles.voteDownBtn}
							type='text'
							icon={<ArrowDownOutlined style={{ fontSize: isChild ? '11px' : '13px' }} />}
							style={{
								width: isChild ? '24px' : '28px',
								height: isChild ? '24px' : '28px',
								padding: 0,
								color: hasDownvoted ? '#ff4d4f' : undefined,
								backgroundColor: hasDownvoted ? 'rgba(255, 77, 79, 0.08)' : undefined,
							}}
							onClick={() => onVote(comment._id, 'down')}
						/>
					</Space>

					<Button
						type='text'
						icon={<CommentOutlined style={{ fontSize: isChild ? '11px' : '13px' }} />}
						style={{
							color: '#8c8c8c',
							display: 'inline-flex',
							alignItems: 'center',
							height: isChild ? '24px' : '28px',
							fontSize: isChild ? '12px' : '13px',
							padding: isChild ? '0 6px' : '0 8px',
							borderRadius: '4px',
						}}
						onClick={() => {
							setReplyingId(isReplyFormOpen ? null : comment._id);
						}}
					>
						Phản hồi
					</Button>
				</div>

				{isReplyFormOpen && (
					<ReplyForm
						commentId={comment._id}
						authorName={comment.author?.fullName || 'Ẩn danh'}
						avatar={currentUserAvatar}
						onSubmit={onSubmitReply}
						onCancel={() => setReplyingId(null)}
					/>
				)}
			</div>
		</div>
	);
};

export default BinhLuanItem;
