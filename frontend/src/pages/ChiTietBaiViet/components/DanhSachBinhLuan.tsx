import { ClockCircleOutlined, DownOutlined, FireOutlined } from '@ant-design/icons';
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
}

const DanhSachBinhLuan: React.FC<DanhSachBinhLuanProps> = ({
	comments,
	userId,
	currentUserAvatar,
	onVote,
	onSubmitReply,
}) => {
	const [replyingId, setReplyingId] = useState<string | null>(null);

	const sortMenu = (
		<Menu defaultValue='newest' style={{ borderRadius: '8px' }}>
			<Menu.Item key='newest' icon={<ClockCircleOutlined />}>
				Mới nhất
			</Menu.Item>
			<Menu.Item key='oldest' icon={<ClockCircleOutlined />}>
				Cũ nhất
			</Menu.Item>
			<Menu.Item key='votes' icon={<FireOutlined />}>
				Nổi bật
			</Menu.Item>
		</Menu>
	);

	const getThreadComments = (rootId: string) => {
		const results: BinhLuan.IRecord[] = [];
		const queue = [rootId];

		while (queue.length > 0) {
			const currentId = queue.shift();
			const children = comments.filter((c) => String(c.parent) === String(currentId));
			results.push(...children);
			queue.push(...children.map((c) => c._id));
		}

		return results.sort((a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf());
	};

	const parentComments = comments?.filter((c) => !c.parent) || [];

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0' }}>
				<Title level={4}>{comments?.length || 0} câu trả lời</Title>
				<div>
					<span>Sắp xếp: </span>
					<Dropdown overlay={sortMenu} trigger={['click']}>
						<Button type='text' style={{ borderRadius: '8px' }}>
							Mới nhất
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
						/>

						{/*====PHẦN BÌNH LUẬN CON ====*/}
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
