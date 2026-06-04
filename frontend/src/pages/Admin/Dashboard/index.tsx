import DonutChart from '@/components/Chart/DonutChart';
import LineChart from '@/components/Chart/LineChart';
import { ERole } from '@/services/base/constant';
import { getDashboardStats } from '@/services/Dashboard';
import { FileTextOutlined, MessageOutlined, QuestionCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Tag as AntTag, Avatar, Card, Col, List, Row, Space, Spin, Statistic, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

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
		return <Spin size='large' style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
	}

	if (!data) {
		return <div>Không thể tải dữ liệu.</div>;
	}

	const { cards, charts, recent } = data;

	// Xử lý dữ liệu cho biểu đồ Line (Backend đã trả chuẩn 30 ngày)
	const displayLineData = charts?.lineChart || [];

	const lineXAxis = displayLineData.map((item) => item.date) || [];
	const linePosts = displayLineData.map((item) => item.posts) || [];
	const lineComments = displayLineData.map((item) => item.comments) || [];

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
					<Avatar
						src={record.avatar}
						style={{ backgroundColor: '#1890ff' }}
						icon={!record.avatar ? <UserOutlined /> : undefined}
					/>
					<div>
						<div style={{ fontWeight: 600 }}>{text}</div>
						<div style={{ fontSize: 12, color: 'gray' }}>{record.email}</div>
					</div>
				</Space>
			),
		},
		{ title: 'MÃ', dataIndex: 'code', key: 'code' },
		{
			title: 'VAI TRÒ',
			dataIndex: 'role',
			key: 'role',
			render: (role) => {
				const roleConfig = {
					[ERole.ADMIN]: { label: 'Admin', color: 'red' },
					[ERole.TEACHER]: { label: 'Giảng viên', color: 'blue' },
					[ERole.STUDENT]: { label: 'Sinh viên', color: 'cyan' },
				};
				const currentRole = roleConfig[role as ERole] || { label: 'KHÔNG RÕ', color: 'default' };

				return (
					<AntTag color={currentRole.color} style={{ fontWeight: 600 }}>
						{currentRole.label}
					</AntTag>
				);
			},
		},
		{
			title: 'THAM GIA',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (val) => moment(val).fromNow(),
		},
	];

	return (
		<Space direction='vertical' size='large' style={{ width: '100%', paddingBottom: 24 }}>
			{/* 4 Thước đo */}
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} xl={6}>
					<Card bodyStyle={{ padding: '24px' }} style={{ height: '100%' }}>
						<Statistic
							title='Tổng số Thành viên'
							value={cards?.totalUsers}
							prefix={<UserOutlined style={{ color: '#1677ff', marginRight: 8 }} />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} xl={6}>
					<Card bodyStyle={{ padding: '24px' }} style={{ height: '100%' }}>
						<Statistic
							title='Tổng số bài viết'
							value={cards?.totalPosts}
							prefix={<FileTextOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} xl={6}>
					<Card bodyStyle={{ padding: '24px' }} style={{ height: '100%' }}>
						<Statistic
							title='Tổng số câu trả lời'
							value={cards?.totalComments}
							prefix={<MessageOutlined style={{ color: '#faad14', marginRight: 8 }} />}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} xl={6}>
					<Card bodyStyle={{ padding: '24px' }} style={{ height: '100%' }}>
						<Statistic
							title='Bài đăng chưa trả lời'
							value={cards?.totalUnansweredPosts}
							prefix={<QuestionCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
						/>
					</Card>
				</Col>
			</Row>

			{/* 2 Biểu đồ */}
			<Row gutter={[16, 16]}>
				<Col xs={24} xl={14}>
					<Card title='Thống kê tương tác trong 30 ngày qua' style={{ height: '100%' }}>
						<LineChart
							title=''
							xAxis={lineXAxis}
							yAxis={[linePosts, lineComments]}
							yLabel={['Câu hỏi mới', 'Câu trả lời mới']}
							height={350}
							colors={['#1677ff', '#52c41a']}
							formatY={(val: number) => `${val} câu`}
							otherOptions={{
								xaxis: {
									categories: lineXAxis,
									tickAmount: 10,
									labels: {
										rotate: -45,
										style: { fontSize: '11px' },
									},
								},
								chart: {
									toolbar: {
										show: true,
										tools: {
											download: true,
											selection: true,
											zoom: true,
											zoomin: true,
											zoomout: true,
											pan: true,
											reset: true,
										},
									},
								},
							}}
						/>
					</Card>
				</Col>
				<Col xs={24} xl={10}>
					<Card title='Tỷ lệ theo lĩnh vực' style={{ height: '100%' }}>
						<DonutChart
							xAxis={donutXAxis}
							yAxis={[donutCounts]}
							yLabel={['Số lượng']}
							height={350}
							showTotal
							formatY={(val: number) => `${val} câu`}
						/>
					</Card>
				</Col>
			</Row>

			{/* Khu vực thẻ theo dõi */}
			<Row gutter={[16, 16]}>
				<Col xs={24} xl={12}>
					<Card title='Câu hỏi mới đăng' bodyStyle={{ padding: 0 }} style={{ height: '100%' }}>
						<List
							itemLayout='horizontal'
							dataSource={recent?.posts}
							renderItem={(item) => (
								<List.Item style={{ padding: '16px 24px' }}>
									<List.Item.Meta
										avatar={
											<Avatar
												shape='square'
												size='large'
												src={item.author?.avatar}
												icon={!item.author?.avatar ? <QuestionCircleOutlined /> : undefined}
												style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
											/>
										}
										title={
											<a href={`/question/${item._id}`} target='_blank' rel='noreferrer' style={{ fontWeight: 600 }}>
												{item.title}
											</a>
										}
										description={`${item.author?.fullName} • ${moment(item.createdAt).fromNow()}`}
									/>
								</List.Item>
							)}
						/>
					</Card>
				</Col>
				<Col xs={24} xl={12}>
					<Card title='Thành viên mới gia nhập' bodyStyle={{ padding: 0 }} style={{ height: '100%' }}>
						<Table dataSource={recent?.users} columns={userColumns} rowKey='_id' pagination={false} size='middle' />
					</Card>
				</Col>
			</Row>
		</Space>
	);
};

export default AdminDashboard;
