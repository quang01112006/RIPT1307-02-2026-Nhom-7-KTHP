import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	CheckCircleOutlined,
	CommentOutlined,
	DeleteOutlined,
	EditOutlined,
	FlagOutlined,
	LockOutlined,
	MoreOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, Menu, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { Link, useModel } from 'umi';
import styles from '../index.less';
import ReplyForm from './ReplyForm';

const { Text } = Typography;

interface BinhLuanItemProps {
	comment: BinhLuan.IRecord;
	userId?: string;
	currentUserAvatar?: string;
	postAuthorId?: string;
	isChild?: boolean;
	isLast?: boolean;
	directParent?: BinhLuan.IRecord | null;
	isReplyToChild?: boolean;
	onVote: (id: string, type: 'up' | 'down') => void;
	onSubmitReply: (content: string) => Promise<void>;
	replyingId: string | null;
	setReplyingId: (id: string | null) => void;
	onEdit: (id: string, content: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onAccept?: (id: string) => Promise<void>;
	onBanUser?: (userId: string) => void;
	onReport?: (id: string) => void;
}

const BinhLuanItem: React.FC<BinhLuanItemProps> = ({
	comment,
	userId,
	currentUserAvatar,
	postAuthorId,
	isChild = false,
	isLast = false,
	directParent = null,
	isReplyToChild = false,
	onVote,
	onSubmitReply,
	replyingId,
	setReplyingId,
	onEdit,
	onDelete,
	onAccept,
	onBanUser,
	onReport,
}) => {
	const { initialState } = useModel('@@initialState');
	const isAdmin = initialState?.currentUser?.role === 'admin';

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editContent, setEditContent] = useState<string>('');
	const [submittingEdit, setSubmittingEdit] = useState<boolean>(false);

	const hasUpvoted = userId ? comment.upvotedBy?.includes(userId) : false;
	const hasDownvoted = userId ? comment.downvotedBy?.includes(userId) : false;
	const score = (comment.upvotedBy?.length || 0) - (comment.downvotedBy?.length || 0);

	const isReplyFormOpen = replyingId === comment._id;
	const isAuthor = userId && comment.author?._id === userId;

	const startEdit = () => {
		const plainText = (comment.content || '').replace(/^<p>/i, '').replace(/<\/p>$/i, '');
		setEditContent(plainText);
		setIsEditing(true);
	};

	const handleEditSubmit = async () => {
		if (!editContent.trim()) return;
		setSubmittingEdit(true);
		try {
			await onEdit(comment._id, editContent.trim());
			setIsEditing(false);
		} catch (error) {
			console.error(error);
		} finally {
			setSubmittingEdit(false);
		}
	};

	const handleDeleteClick = () => {
		Modal.confirm({
			title: 'Xóa bình luận',
			content: 'Bạn có chắc chắn muốn xóa bình luận này không?',
			okText: 'Xóa',
			cancelText: 'Hủy',
			okButtonProps: { danger: true },
			onOk: async () => {
				try {
					await onDelete(comment._id);
				} catch (error) {
					console.error(error);
				}
			},
		});
	};

	const handleBanClick = () => {
		Modal.confirm({
			title: 'Khóa tài khoản này',
			content: `Bạn có chắc chắn muốn khóa tài khoản của ${
				comment.author?.fullName || 'người dùng này'
			}? Họ sẽ bị văng ra khỏi hệ thống ngay lập tức!`,
			okText: 'Khóa ngay',
			cancelText: 'Hủy',
			okButtonProps: { danger: true },
			onOk: () => {
				if (onBanUser && comment.author?._id) {
					onBanUser(comment.author._id);
				}
			},
		});
	};

	const menu = (
		<Menu style={{ borderRadius: '8px' }}>
			{isAuthor && (
				<Menu.Item key='edit' icon={<EditOutlined />} onClick={startEdit}>
					Sửa bình luận
				</Menu.Item>
			)}
			{(isAuthor || isAdmin) && (
				<Menu.Item key='delete' icon={<DeleteOutlined />} danger onClick={handleDeleteClick}>
					Xóa bình luận
				</Menu.Item>
			)}
			{userId && !isAuthor && !isAdmin && (
				<Menu.Item key='report' icon={<FlagOutlined />} onClick={() => onReport && onReport(comment._id)}>
					Báo cáo bình luận
				</Menu.Item>
			)}
			{isAdmin && !isAuthor && (
				<>
					<Menu.Divider />
					<Menu.Item key='ban' icon={<LockOutlined />} danger onClick={handleBanClick}>
						Khóa tài khoản này
					</Menu.Item>
				</>
			)}
		</Menu>
	);

	return (
		<div
			id={`comment-${comment._id}`}
			style={{
				position: 'relative',
				padding: isChild ? '8px 8px 12px 8px' : '8px 12px',
				backgroundColor: comment.isAccepted ? 'rgba(82, 196, 26, 0.06)' : undefined,
				borderRadius: comment.isAccepted ? '8px' : '0',
				border: comment.isAccepted ? '1px solid #b7eb8f' : '1px solid transparent',
				transition: 'all 0.3s ease',
			}}
		>
			{/* line cong l cho cmt con */}
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

			{/* line dọc đi xuống nếu chưa phải cmt con cuối */}
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

			{/* 1. header (avatar + tên + nút 3 chấm) */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: isChild ? '6px' : '8px',
				}}
			>
				<div
					style={{
						display: 'flex',
						gap: '8px',
						alignItems: 'center',
						flexWrap: 'wrap',
					}}
				>
					<Link to={`/profile/${comment.author?._id}`}>
						<Avatar
							src={comment.author?.avatar}
							icon={<UserOutlined />}
							size={isChild ? 'small' : undefined}
							style={{ width: isChild ? '24px' : '32px', height: isChild ? '24px' : '32px', cursor: 'pointer' }}
						/>
					</Link>
					<Link to={`/profile/${comment.author?._id}`}>
						<Text
							strong
							style={{ fontSize: isChild ? '13px' : '14px', color: isChild ? '#262626' : undefined, cursor: 'pointer' }}
						>
							{comment.author?.fullName || 'Ẩn danh'}
						</Text>
					</Link>

					{/* tag mention khi rep cmt con */}
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

				{(isAuthor || isAdmin || !!userId) && (
					<Dropdown overlay={menu} trigger={['click']} placement='bottomRight'>
						<Button
							type='text'
							icon={<MoreOutlined style={{ fontSize: isChild ? '16px' : '18px', color: '#595959' }} />}
							style={{
								padding: 0,
								width: '28px',
								height: '28px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: '50%',
							}}
						/>
					</Dropdown>
				)}
			</div>

			{/* 2. content vs vote */}
			<div
				style={{
					marginLeft: isChild ? '0px' : '16px',
					paddingLeft: isChild ? '32px' : '24px',
					borderLeft: !isChild && !isLast ? '2px solid #e8e8e8' : '2px solid transparent',
				}}
			>
				{isEditing ? (
					<div style={{ marginTop: '4px', marginBottom: '8px' }}>
						<Input.TextArea
							value={editContent}
							onChange={(e) => setEditContent(e.target.value)}
							autoSize={{ minRows: 2, maxRows: 6 }}
							style={{ borderRadius: '8px', marginBottom: '8px' }}
							disabled={submittingEdit}
						/>
						<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
							<Button size='small' type='text' onClick={() => setIsEditing(false)} disabled={submittingEdit}>
								Hủy
							</Button>
							<Button
								size='small'
								type='primary'
								disabled={!editContent.trim()}
								loading={submittingEdit}
								onClick={handleEditSubmit}
							>
								Lưu
							</Button>
						</div>
					</div>
				) : (
					<>
						{comment.isAccepted && (
							<div style={{ marginBottom: 8 }}>
								<Tag
									color='success'
									icon={<CheckCircleOutlined />}
									style={{ fontSize: '13px', padding: '2px 8px', borderRadius: '4px' }}
								>
									Tác giả bài viết đã chọn làm câu trả lời đúng
								</Tag>
							</div>
						)}
						<div
							className={styles.postContent}
							dangerouslySetInnerHTML={{ __html: comment.content || '' }}
							style={{
								fontSize: isChild ? '14px' : '15px',
								lineHeight: isChild ? '1.5' : '1.6',
								wordBreak: 'break-word',
								color: isChild ? '#434343' : undefined,
								whiteSpace: 'pre-wrap',
							}}
						/>
					</>
				)}

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
							shape='circle'
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
							style={{
								fontSize: isChild ? '12px' : '13px',
								color: '#595959',
								minWidth: isChild ? '12px' : '16px',
								textAlign: 'center',
							}}
						>
							{score}
						</Text>
						<Button
							className={styles.voteDownBtn}
							type='text'
							shape='circle'
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

					{!isChild && (postAuthorId === userId || comment.isAccepted) && (
						<Tooltip title={comment.isAccepted ? 'Câu trả lời đã được giải quyết' : 'Đánh dấu là câu trả lời đúng'}>
							<Button
								type='text'
								className={styles.textBtnNoBg}
								icon={<CheckCircleOutlined style={{ fontSize: isChild ? '12px' : '14px' }} />}
								style={{
									color: comment.isAccepted ? '#52c41a' : '#bfbfbf',
									backgroundColor: comment.isAccepted ? 'rgba(82, 196, 26, 0.1)' : undefined,
									display: 'inline-flex',
									alignItems: 'center',
									height: isChild ? '24px' : '28px',
									padding: isChild ? '0 4px' : '0 6px',
									cursor: postAuthorId !== userId ? 'default' : 'pointer',
								}}
								onClick={() => {
									if (postAuthorId === userId && onAccept) {
										onAccept(comment._id);
									}
								}}
							/>
						</Tooltip>
					)}

					<Button
						type='text'
						className={styles.textBtnNoBg}
						icon={<CommentOutlined style={{ fontSize: isChild ? '11px' : '13px' }} />}
						style={{
							color: '#595959',
							display: 'inline-flex',
							alignItems: 'center',
							height: isChild ? '24px' : '28px',
							fontSize: isChild ? '12px' : '13px',
							padding: isChild ? '0 4px' : '0 6px',
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
