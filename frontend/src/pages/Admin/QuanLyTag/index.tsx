import { useModel } from 'umi';
import { useEffect } from 'react';
import { Card, List, Spin, Typography } from 'antd';
import React from 'react';

const QuanLyTag: React.FC = () => {
	const { danhSach, loading, getModel } = useModel('tags');

	useEffect(() => {
		getModel();
	}, []);

	return (
		<Card>
			<Typography.Title level={2}>Quản lý Tag</Typography.Title>
			<Typography.Paragraph>Danh sách các chủ đề kiến thức trên EduStack.</Typography.Paragraph>
			
			{loading ? (
				<Spin size="large" />
			) : (
				<List
					grid={{ gutter: 16, column: 4 }}
                dataSource={danhSach}
					renderItem={(item: any) => (
						<List.Item>
							<Card title={item.name} size="small">
								<p>{item.description}</p>
							</Card>
						</List.Item>
					)}
				/>
			)}
		</Card>
	);
};

export default QuanLyTag;