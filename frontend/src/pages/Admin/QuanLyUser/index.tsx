import React from 'react';
import { Card, Typography } from 'antd';

const QuanLyUser: React.FC = () => {
	return (
		<Card>
			<Typography.Title level={2}>Quản lý người dùng</Typography.Title>
			<Typography.Paragraph>Danh sách thành viên của EduStack.</Typography.Paragraph>
		</Card>
	);
};

export default QuanLyUser;