import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Space, Spin, Tag as AntTag, Avatar, List } from 'antd';
import { UserOutlined, FileTextOutlined, MessageOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getDashboardStats } from '@/services/Dashboard';
import LineChart from '@/components/Chart/LineChart';
import DonutChart from '@/components/Chart/DonutChart';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';

const AdminDashboard: React.FC = () => {
	const [data, setData] = useState<Dashboard.IStatsResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await getDashboardStats();
				setData(res?.data?.data || res?.data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading) {
		return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
	}

	if (!data) {
		return <div>Không thể tải dữ liệu.</div>;
	}

	const { cards, charts, recent } = data;

	// Xử lý dữ liệu cho biểu đồ Line
	const lineXAxis = charts?.lineChart?.map((item) => item.date) || [];
	const linePosts = charts?.lineChart?.map((item) => item.posts) || [];
	const lineComments = charts?.lineChart?.map((item) => item.comments) || [];

	// Xử lý dữ liệu cho biểu đồ Donut
	const donutXAxis = charts?.pieChart?.map((item) => item.tag) || [];
	const donutCounts = charts?.pieChart?.map((item) => item.count) || [];

	// Cột table cho Thành viên mới
	const userColumns: ColumnsType<Dashboard.IRecentUser> = [
		{ 
			title: 'THÀNH VIÊN', 
			dataIndex: 'fullName', 
			key: 'fullName',
			render: (text, record) => (
				<Space>
					<Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
					<div>
						<div style={{ fontWeight: 600 }}>{text}</div>
						<div style={{ fontSize: 12, color: 'gray' }}>{record.email}</div>
					</div>
				</Space>
			)
		},
		{ title: 'MÃ', dataIndex: 'code', key: 'code' },
		{ 
			title: 'VAI TRÒ', 
			dataIndex: 'role', 
			key: 'role',
			render: (role) => (
				<AntTag color={role === 'admin' ? 'red' : role === 'teacher' ? 'blue' : 'cyan'} style={{ fontWeight: 600 }}>
					{role?.toUpperCase()}
				</AntTag>
			)
		},
		{ 
			title: 'THAM GIA', 
			dataIndex: 'createdAt', 
			key: 'createdAt',
			render: (val) => moment(val).fromNow() 
		},
	];

	return (
		<Space direction="vertical" size="large" style={{ width: '100%', paddingBottom: 24 }}>
			{/* 4 Thước đo */}
			<Row gutter={[16, 16]}>
				<Col span={6}>
					<Card bodyStyle={{ padding: '24px' }}>
						<Statistic title="Tổng số Thành viên" value={cards?.totalUsers} prefix={<UserOutlined style={{ color: '#1677ff', marginRight: 8 }} />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card bodyStyle={{ padding: '24px' }}>
						<Statistic title="Tổng số bài viết" value={cards?.totalPosts} prefix={<FileTextOutlined style={{ color: '#52c41a', marginRight: 8 }} />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card bodyStyle={{ padding: '24px' }}>
						<Statistic title="Tổng số câu trả lời" value={cards?.totalComments} prefix={<MessageOutlined style={{ color: '#faad14', marginRight: 8 }} />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card bodyStyle={{ padding: '24px' }}>
						<Statistic title="Bài đăng chưa trả lời" value={cards?.totalUnansweredPosts} prefix={<QuestionCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />} />
					</Card>
				</Col>
			</Row>

			{/* 2 Biểu đồ */}
			<Row gutter={[16, 16]}>
				<Col span={14}>
					<Card title="Tương tác trong tháng">
						<LineChart 
							xAxis={lineXAxis}
							yAxis={[linePosts, lineComments]}
							yLabel={['Câu hỏi mới', 'Câu trả lời mới']}
							height={350}
						/>
					</Card>
				</Col>
				<Col span={10}>
					<Card title="Tỷ lệ theo lĩnh vực">
						<DonutChart 
							xAxis={donutXAxis}
							yAxis={[donutCounts]}
							yLabel={['Số lượng']}
							height={350}
							showTotal
						/>
					</Card>
				</Col>
			</Row>

			{/* Khu vực thẻ theo dõi */}
			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Card title="Câu hỏi mới đăng" bodyStyle={{ padding: 0 }}>
						<List
							itemLayout="horizontal"
							dataSource={recent?.posts}
							renderItem={item => (
								<List.Item style={{ padding: '16px 24px' }}>
									<List.Item.Meta
										avatar={<Avatar shape="square" size="large" icon={<QuestionCircleOutlined />} style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }} />}
										title={<a style={{ fontWeight: 600 }}>{item.title}</a>}
										description={`${item.author?.fullName} • ${moment(item.createdAt).fromNow()}`}
									/>
								</List.Item>
							)}
						/>
					</Card>
				</Col>
				<Col span={12}>
					<Card title="Thành viên mới gia nhập" bodyStyle={{ padding: 0 }}>
						<Table 
							dataSource={recent?.users} 
							columns={userColumns} 
							rowKey="_id" 
							pagination={false} 
							size="middle"
						/>
					</Card>
				</Col>
			</Row>
		</Space>
	);
};

export default AdminDashboard;
