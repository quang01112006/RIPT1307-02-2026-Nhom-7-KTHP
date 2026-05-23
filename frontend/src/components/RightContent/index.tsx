import React from 'react';
import { useModel } from 'umi';
import { Badge, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
	const { initialState } = useModel('@@initialState');

	if (!initialState || !initialState.currentUser) {
		return null;
	}

	return (
		<div className={styles.right}>
			{/* <ModuleSwitch /> */}

			{/* <NoticeIconView /> */}

			{/* <Tooltip title='Giới thiệu chung' placement='bottom'>
				<a onClick={() => history.push('/gioi-thieu')}>
					<InfoCircleOutlined />
				</a>
			</Tooltip> */}

			<div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
				<Badge count={0} size="small">
					<BellOutlined 
						className={styles.bellIconCustom} 
						style={{ fontSize: '20px', cursor: 'pointer', transition: 'color 0.3s' }} 
					/>
				</Badge>
			</div>

			<AvatarDropdown menu />
		</div>
	);
};

export default GlobalHeaderRight;
