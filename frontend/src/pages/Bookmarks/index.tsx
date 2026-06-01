import React from 'react';
import { Card, Typography } from 'antd';
import { useModel } from 'umi';
import BookmarksTab from '../UserProfile/components/BookmarksTab';

const { Title, Text } = Typography;

const Bookmarks: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const currentUser = initialState?.currentUser;

	return (
		<div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
			<div style={{ marginBottom: '24px' }}>
				<Title level={2} style={{ margin: 0 }}>Bài viết đã lưu</Title>
				<Text type="secondary">Danh sách các bài viết, câu hỏi mà bạn đã đánh dấu lưu lại để đọc sau.</Text>
			</div>
			<Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
				{currentUser ? (
					<BookmarksTab user={currentUser} />
				) : (
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<Text type="secondary">Vui lòng đăng nhập để xem bài viết đã lưu.</Text>
					</div>
				)}
			</Card>
		</div>
	);
};

export default Bookmarks;
