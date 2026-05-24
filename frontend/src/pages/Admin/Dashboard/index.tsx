import React from 'react';
import { Card, Typography } from 'antd';

const AdminDashboard: React.FC = () => {
	return (
		<Card>
			<Typography.Title level={2}>Dashboard Quản trị</Typography.Title>
			<Typography.Paragraph>Chào mừng Admin đến với hệ thống điều hành EduStack.</Typography.Paragraph>
		</Card>
	);
};

export default AdminDashboard;
