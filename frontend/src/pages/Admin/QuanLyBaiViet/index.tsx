import React from 'react';
import { Card, Typography } from 'antd';

const QuanLyBaiViet: React.FC = () => {
	return (
		<Card>
			<Typography.Title level={2}>Quản lý bài viết</Typography.Title>
			<Typography.Paragraph>Nơi kiểm duyệt và điều phối nội dung diễn đàn.</Typography.Paragraph>
		</Card>
	);
};

export default QuanLyBaiViet;