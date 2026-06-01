import { landingUrl } from '@/services/base/constant';
import { FileWordOutlined, GlobalOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import { type ItemType } from 'antd/lib/menu/hooks/useItems';
import React from 'react';
import { history, useModel } from 'umi';
import HeaderDropdown from './HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
	menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
	const { initialState, setInitialState } = useModel('@@initialState');

	const loginOut = () => {
		localStorage.removeItem('token');
		setInitialState({ ...initialState, currentUser: undefined });
		history.replace('/user/login');
	};

	if (!initialState || !initialState.currentUser)
		return (
			<span className={`${styles.action} ${styles.account}`}>
				<Spin size='small' style={{ marginLeft: 8, marginRight: 8 }} />
			</span>
		);

	const currentUser = initialState.currentUser;
	const fullName = currentUser?.fullName || 'Người dùng';
	const lastNameChar = fullName.split(' ')?.at(-1)?.[0]?.toUpperCase() || 'U';

	const items: ItemType[] = [
		{
			key: 'profile',
			icon: <UserOutlined />,
			label: 'Trang cá nhân',
			onClick: () => history.push(`/profile/${currentUser._id}`),
		},
		...(currentUser?.role === 'admin'
			? [
					{
						key: 'switch_context',
						icon: <GlobalOutlined />,
						label: history.location.pathname.startsWith('/admin')
							? 'Quay lại diễn đàn'
							: 'Trang quản trị',
						onClick: () => {
							if (history.location.pathname.startsWith('/admin')) {
								history.push('/dashboard');
							} else {
								history.push('/admin/dashboard');
							}
						},
					},
			  ]
			: []),
		{ type: 'divider', key: 'divider' },
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Đăng xuất',
			onClick: loginOut,
			danger: true,
		},
	];

	return (
		<>
			<HeaderDropdown overlay={<Menu className={styles.menu} items={items} />}>
				<span className={`${styles.action} ${styles.account}`}>
					<Avatar
						className={styles.avatar}
						src={currentUser?.avatar}
						icon={!currentUser?.avatar ? lastNameChar : undefined}
						alt='avatar'
					/>
					<span className={`${styles.name}`}>{fullName}</span>
				</span>
			</HeaderDropdown>
		</>
	);
};

export default AvatarDropdown;
