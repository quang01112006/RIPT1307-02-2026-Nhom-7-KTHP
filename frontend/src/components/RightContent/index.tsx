import {
	BellOutlined,
	CheckCircleOutlined,
	CheckOutlined,
	DeleteOutlined,
	InfoCircleOutlined,
	LikeOutlined,
	MessageOutlined,
	MoreOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, List, Menu, Popover, Typography } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { history, useModel } from 'umi';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';

const { Text } = Typography;

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const {
		notifications,
		unreadCount,
		loading,
		markAsRead,
		markAsUnread,
		markAllAsReadModel,
		deleteAllModel,
		deleteModel,
	} = useModel('notifications');
	const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

	if (!initialState || !initialState.currentUser) {
		return (
			<div className={styles.right}>
				<Button type='primary' onClick={() => history.push('/user/login')} style={{ marginRight: 8, borderRadius: 8 }}>
					Đăng nhập
				</Button>
				<Button onClick={() => history.push('/user/register')} style={{ borderRadius: 8 }}>
					Đăng ký
				</Button>
			</div>
		);
	}

	const getIconByType = (type: string) => {
		switch (type) {
			case 'UPVOTE':
				return <LikeOutlined style={{ color: '#eb2f96' }} />;
			case 'REPLY':
				return <MessageOutlined style={{ color: '#1890ff' }} />;
			case 'ACCEPTED':
				return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
			default:
				return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
		}
	};

	const onNotificationClick = (item: any) => {
		if (!item.isRead) markAsRead(item._id);
		if (item.link) history.push(item.link);
	};

	const filteredNotifications = activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

	const notificationContent = (
		<div style={{ width: 'clamp(300px, 90vw, 380px)', maxHeight: 500, overflowY: 'auto' }}>
			<div style={{ padding: '8px 16px', display: 'flex', gap: '8px' }}>
				<Button
					type={activeTab === 'all' ? 'primary' : 'default'}
					shape='round'
					onClick={() => setActiveTab('all')}
					style={{
						fontWeight: 600,
						border: 'none',
						backgroundColor: activeTab === 'all' ? '#e6f7ff' : 'transparent',
						color: activeTab === 'all' ? '#1890ff' : '#050505',
						boxShadow: 'none',
					}}
				>
					Tất cả
				</Button>
				<Button
					type={activeTab === 'unread' ? 'primary' : 'default'}
					shape='round'
					onClick={() => setActiveTab('unread')}
					style={{
						fontWeight: 600,
						border: 'none',
						backgroundColor: activeTab === 'unread' ? '#e6f7ff' : 'transparent',
						color: activeTab === 'unread' ? '#1890ff' : '#050505',
						boxShadow: 'none',
					}}
				>
					Chưa đọc
				</Button>
			</div>
			<List
				itemLayout='horizontal'
				dataSource={filteredNotifications}
				loading={loading}
				locale={{ emptyText: 'Chưa có thông báo nào' }}
				renderItem={(item) => (
					<List.Item
						className={styles.notificationItem}
						style={{
							padding: '12px 16px',
							borderBottom: 'none',
							position: 'relative',
						}}
						extra={
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 8 }}>
								{!item.isRead && (
									<div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1890ff' }} />
								)}
								<Dropdown
									overlay={
										<Menu
											onClick={(e) => {
												if (e.key === 'read') markAsRead(item._id);
												if (e.key === 'unread') markAsUnread(item._id);
												if (e.key === 'delete') deleteModel(item._id);
											}}
										>
											{!item.isRead ? (
												<Menu.Item key='read' icon={<CheckOutlined />}>
													Đánh dấu đã đọc
												</Menu.Item>
											) : (
												<Menu.Item key='unread' icon={<MessageOutlined />}>
													Đánh dấu chưa đọc
												</Menu.Item>
											)}
											<Menu.Item key='delete' danger icon={<DeleteOutlined />}>
												Xóa thông báo
											</Menu.Item>
										</Menu>
									}
									trigger={['click']}
								>
									<Button type='text' shape='circle' icon={<MoreOutlined style={{ fontSize: 18 }} />} />
								</Dropdown>
							</div>
						}
					>
						<div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onNotificationClick(item)}>
							<List.Item.Meta
								avatar={
									<Badge
										count={getIconByType(item.type)}
										style={{
											backgroundColor: '#fff',
											boxShadow: '0 0 0 1px #d9d9d9 inset',
											color: '#1890ff',
											transform: 'translate(10%, 10%)',
										}}
										offset={[-4, 4]}
									>
										<Avatar
											size={48}
											src={item.sender?.avatar}
											icon={!item.sender?.avatar && getIconByType(item.type)}
										/>
									</Badge>
								}
								title={
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
										<Text
											style={{
												fontSize: '14.5px',
												lineHeight: '1.4',
												marginBottom: 2,
												fontWeight: item.isRead ? 400 : 600,
											}}
										>
											{item.title}
										</Text>
									</div>
								}
								description={
									<div>
										<Text
											style={{
												fontSize: '13.5px',
												color: item.isRead ? '#8c8c8c' : '#595959',
												display: '-webkit-box',
												WebkitLineClamp: 3,
												WebkitBoxOrient: 'vertical',
												overflow: 'hidden',
											}}
										>
											{item.message}
										</Text>
										<Text
											type='secondary'
											style={{
												fontSize: '12px',
												display: 'block',
												marginTop: 4,
												fontWeight: item.isRead ? 400 : 500,
												color: item.isRead ? '#8c8c8c' : '#1890ff',
											}}
										>
											{moment(item.createdAt).fromNow()}
										</Text>
									</div>
								}
							/>
						</div>
					</List.Item>
				)}
			/>
		</div>
	);

	const titleContent = (
		<div
			style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 4px 16px' }}
		>
			<Text strong style={{ fontSize: '20px' }}>
				Thông báo
			</Text>
			<Dropdown
				overlay={
					<Menu>
						<Menu.Item key='readAll' icon={<CheckOutlined />} onClick={markAllAsReadModel}>
							Đánh dấu tất cả là đã đọc
						</Menu.Item>
						<Menu.Item key='deleteAll' danger icon={<DeleteOutlined />} onClick={deleteAllModel}>
							Xóa tất cả thông báo
						</Menu.Item>
					</Menu>
				}
				trigger={['click']}
			>
				<Button type='text' shape='circle' icon={<MoreOutlined style={{ fontSize: 20 }} />} />
			</Dropdown>
		</div>
	);

	return (
		<div className={styles.right}>
			<div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
				<Popover
					placement='bottomRight'
					title={titleContent}
					content={notificationContent}
					trigger='click'
					overlayInnerStyle={{ padding: 0, borderRadius: 8, overflow: 'hidden' }}
				>
					<Badge count={unreadCount} size='small' style={{ cursor: 'pointer' }}>
						<BellOutlined
							className={styles.bellIconCustom}
							style={{ fontSize: '20px', cursor: 'pointer', transition: 'color 0.3s' }}
						/>
					</Badge>
				</Popover>
			</div>

			<AvatarDropdown menu />
		</div>
	);
};

export default GlobalHeaderRight;
