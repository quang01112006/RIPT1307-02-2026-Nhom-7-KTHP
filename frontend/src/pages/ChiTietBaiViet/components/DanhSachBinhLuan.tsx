import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Typography } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import BinhLuanItem from './BinhLuanItem';

const { Title } = Typography;

interface DanhSachBinhLuanProps {
	comments: BinhLuan.IRecord[];
	userId?: string;
	currentUserAvatar?: string;
	onVote: (id: string, type: 'up' | 'down') => void;
	onSubmitReply: (content: string, parentId: string) => Promise<void>;
	onEdit: (id: string, content: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

const DanhSachBinhLuan: React.FC<DanhSachBinhLuanProps> = ({
	comments,
	userId,
	currentUserAvatar,
	onVote,
	onSubmitReply,
	onEdit,
	onDelete,
}) => {
	const [replyingId, setReplyingId] = useState<string | null>(null);
	const [sortKey, setSortKey] = useState<'newest' | 'oldest' | 'votes'>('newest');

	const handleSortClick = ({ key }: { key: string }) => {
		setSortKey(key as 'newest' | 'oldest' | 'votes');
	};

	const sortMenu = (
		<Menu onClick={handleSortClick} selectedKeys={[sortKey]} style={{ borderRadius: '8px' }}>
			<Menu.Item key='newest'>Mới nhất</Menu.Item>
			<Menu.Item key='oldest'>Cũ nhất</Menu.Item>
			<Menu.Item key='votes'>Nổi bật</Menu.Item>
		</Menu>
	);

	const getSortLabel = () => {
		switch (sortKey) {
			case 'oldest':
				return 'Cũ nhất';
			case 'votes':
				return 'Nổi bật';
			case 'newest':
			default:
				return 'Mới nhất';
		}
	};

	const getThreadComments = (rootId: string) => {
		const results: BinhLuan.IRecord[] = [];
		const queue = [rootId];

		while (queue.length > 0) {
			const currentId = queue.shift();
			const children = comments.filter((c) => String(c.parent) === String(currentId));
			results.push(...children);
			queue.push(...children.map((c) => c._id));
		}

		// Sắp xếp bình luận con theo thời gian tăng dần để mạch hội thoại tự nhiên nhất
		return results.sort((a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf());
	};

	// Lọc và sắp xếp các bình luận cha theo tiêu chuẩn lựa chọn
	const parentComments = (comments?.filter((c) => !c.parent) || []).sort((a, b) => {
		if (sortKey === 'newest') {
			return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
		}
		if (sortKey === 'oldest') {
			return moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf();
		}
		if (sortKey === 'votes') {
			const scoreA = (a.upvotedBy?.length || 0) - (a.downvotedBy?.length || 0);
			const scoreB = (b.upvotedBy?.length || 0) - (b.downvotedBy?.length || 0);
			if (scoreB !== scoreA) {
				return scoreB - scoreA; // Số điểm vote lớn hơn lên trước
			}
			// Nếu điểm bằng nhau, ưu tiên bình luận mới nhất
			return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
		}
		return 0;
	});

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0' }}>
				<Title level={4}>{comments?.length || 0} câu trả lời</Title>
				<div>
					<span style={{ color: '#8c8c8c' }}>Sắp xếp: </span>
					<Dropdown overlay={sortMenu} trigger={['click']}>
						<Button type='text' style={{ borderRadius: '8px', fontWeight: 500 }}>
							{getSortLabel()}
							<DownOutlined style={{ fontSize: '10px', marginLeft: '4px' }} />
						</Button>
					</Dropdown>
				</div>
			</div>

			{parentComments.map((comment) => {
				const childComments = getThreadComments(comment._id);

				return (
					<div key={comment._id} style={{ marginBottom: '24px' }}>
						<BinhLuanItem
							comment={comment}
							userId={userId}
							currentUserAvatar={currentUserAvatar}
							isChild={false}
							isLast={childComments.length === 0}
							onVote={onVote}
							onSubmitReply={(content) => onSubmitReply(content, comment._id)}
							replyingId={replyingId}
							setReplyingId={setReplyingId}
							onEdit={onEdit}
							onDelete={onDelete}
						/>

						{/*==== PHẦN BÌNH LUẬN CON ====*/}
						{childComments.length > 0 && (
							<div
								style={{
									marginLeft: '16px',
									paddingLeft: '24px',
									marginTop: '0px',
								}}
							>
								{childComments.map((child, index) => {
									const isLast = index === childComments.length - 1;
									const directParent = comments.find((c) => String(c._id) === String(child.parent));
									const isReplyToChild = String(child.parent) !== String(comment._id);

									return (
										<BinhLuanItem
											key={child._id}
											comment={child}
											userId={userId}
											currentUserAvatar={currentUserAvatar}
											isChild={true}
											isLast={isLast}
											directParent={directParent}
											isReplyToChild={isReplyToChild}
											onVote={onVote}
											onSubmitReply={(content) => onSubmitReply(content, child._id)}
											replyingId={replyingId}
											setReplyingId={setReplyingId}
											onEdit={onEdit}
											onDelete={onDelete}
										/>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default DanhSachBinhLuan;
