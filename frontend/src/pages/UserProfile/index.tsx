import { Card, Spin, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useModel, useParams } from 'umi';

import OverviewTab from './components/OverviewTab';
import ProfileHeader from './components/ProfileHeader';
import SettingsTab from './components/SettingsTab';
import BookmarksTab from './components/BookmarksTab';
import styles from './index.less';

const { Text } = Typography;
const { TabPane } = Tabs;

const UserProfile = () => {
	const { id } = useParams<{ id: string }>();
	const { initialState } = useModel('@@initialState');
	const { fetchUser, record: user, loading } = useModel('users');
	const [activeTab, setActiveTab] = useState('profile');

	const isMe = initialState?.currentUser?._id === id;

	useEffect(() => {
		if (id) {
			fetchUser(id);
		}
	}, [id]);

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '50px' }}>
				<Spin size='large' />
			</div>
		);
	}

	if (!user) {
		return (
			<div style={{ textAlign: 'center', padding: '100px' }}>
				<Typography.Title level={4} type='secondary'>
					Không tìm thấy thông tin hồ sơ này, hoặc bạn không có quyền xem.
				</Typography.Title>
			</div>
		);
	}

	return (
		<div className={styles.profileContainer}>
			<ProfileHeader user={user} isMe={isMe} onEditClick={() => setActiveTab('settings')} />

			<Card bordered={false} className={styles.tabsCard}>
				<Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} size='large'>
					<TabPane tab='Hồ sơ' key='profile'>
						<div className={styles.tabContent}>
							<OverviewTab user={user} />
						</div>
					</TabPane>

					{isMe && (
						<TabPane tab={<span> Bài viết đã lưu</span>} key='bookmarks'>
							<div className={styles.tabContent}>
								<BookmarksTab user={user} />
							</div>
						</TabPane>
					)}

					{isMe && (
						<TabPane tab='Cài đặt' key='settings'>
							<div className={styles.tabContent}>
								<SettingsTab user={user} />
							</div>
						</TabPane>
					)}
				</Tabs>
			</Card>
		</div>
	);
};

export default UserProfile;
