import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
	CommentOutlined,
	DeleteOutlined,
	EyeOutlined,
	FlagOutlined,
	SearchOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Divider,
	Input,
	Popconfirm,
	Row,
	Space,
	Statistic,
	Table,
	Tag,
	Tooltip,
	Typography,
	message,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

const { Title, Text } = Typography;

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
	PENDING: { text: 'Chưa xử lý', color: 'orange' },
	RESOLVED: { text: 'Đã xử lý', color: 'green' },
	REJECTED: { text: 'Đã từ chối', color: 'red' },
};

const TYPE_LABEL: Record<string, string> = {
	Post: 'Bài viết',
	Comment: 'Bình luận',
};

const QuanLyBaoCao: React.FC = () => {
	const { danhSach: reports, getModel, putModel, deleteModel, loading, page, limit, total, setPage, setLimit } = useModel('reports');
	const [searchText, setSearchText] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
	const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

	useEffect(() => {
		getModel();
	}, []);

	const fetchData = (search = searchText, status = statusFilter, type = typeFilter, p = page, l = limit) => {
		const query: any = {};
		if (search) query.search = search;
		if (status) query.status = status;
		if (type) query.targetType = type;

		return getModel(undefined, undefined, undefined, p, l, undefined, query);
	};

	const handleTableChange = (pagination: any, filters: any) => {
		const newStatus = filters?.status?.[0];
		const newType = filters?.targetType?.[0];
		setStatusFilter(newStatus);
		setTypeFilter(newType);
		const p = pagination.current || 1;
		const s = pagination.pageSize || limit;
		setPage(p);
		setLimit(s);
		fetchData(searchText, newStatus, newType, p, s);
	};

	const getTargetId = (report: any) => {
		if (!report?.targetId) return '-';
		if (typeof report.targetId === 'object') return report.targetId._id || report.targetId.toString();
		return report.targetId;
	};

	const getTargetLink = (report: any) => {
		const id = getTargetId(report);
		if (!id) return '';
		if (report.targetType === 'Post') return `/question/${id}`;
		if (report.targetType === 'Comment') {
			// Lấy postId từ targetId object nếu BE đã populate, hoặc dùng trường postId có sẵn
			const postId = report.targetId?.post?._id || report.targetId?.post || report.postId;
			return postId ? `/question/${postId}?commentId=${id}` : `/question/${id}`;
		}
		return null;
	};

	const handleStatusUpdate = async (id: string, status: string) => {
		try {
			await putModel(id, { status }, undefined, false, undefined, `Đã chuyển trạng thái thành ${STATUS_LABEL[status]?.text || status}`);
		} catch (error) {
			message.error('Cập nhật trạng thái thất bại');
		}
	};

	const handleDeleteReport = async (id: string) => {
		try {
			await deleteModel(id);
			message.success('Đã xóa báo cáo');
		} catch (error) {
			message.error('Xóa báo cáo thất bại');
		}
	};

	const getTargetSummary = (report: any) => {
		const target = report?.targetId;
		if (!target) return 'Không có dữ liệu';
		if (typeof target === 'object') {
			if (report.targetType === 'Post') return target.title || target.content || target._id || 'Không có tiêu đề';
			return target.content || target._id || 'Không có nội dung';
		}
		return target.toString();
	};

	const openTargetContent = (record: any) => {
		const url = getTargetLink(record);
		if (!url) {
			message.warning('Không tìm thấy đường dẫn đối tượng.');
			return;
		}
		window.open(url, '_blank');
	};

	const summary = useMemo(() => {
		const counts = {
			total: total || 0,
			pending: 0,
			resolved: 0,
			rejected: 0,
			posts: 0,
			comments: 0,
		};
		reports?.forEach((item: any) => {
			if (item.status === 'PENDING') counts.pending += 1;
			if (item.status === 'RESOLVED') counts.resolved += 1;
			if (item.status === 'REJECTED') counts.rejected += 1;
			if (item.targetType === 'Post') counts.posts += 1;
			if (item.targetType === 'Comment') counts.comments += 1;
		});
		return counts;
	}, [reports]);

	const columns = [
		{
			title: 'STT',
			key: 'index',
			width: 70,
			align: 'center' as const,
			render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
		},
		{
			title: 'Đối tượng',
			dataIndex: 'targetType',
			key: 'targetType',
			width: 180,
			filters: [
				{ text: 'Bài viết', value: 'Post' },
				{ text: 'Bình luận', value: 'Comment' },
			],
			filterMultiple: false,
			filteredValue: typeFilter ? [typeFilter] : null,
			render: (_: any, record: any) => (
				<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<div>
						<Tag color={record.targetType === 'Post' ? 'cyan' : 'geekblue'}>{TYPE_LABEL[record.targetType] || record.targetType}</Tag>
					</div>
					<Text ellipsis={{ tooltip: getTargetSummary(record) }} style={{ maxWidth: 260, display: 'block' }}>
						{getTargetSummary(record)}
					</Text>
				</div>
			),
		},
		{
			title: 'Lý do báo cáo',
			dataIndex: 'reason',
			key: 'reason',
			render: (reason: string) => <Text ellipsis={{ tooltip: reason }}>{reason}</Text>,
		},
		{
			title: 'Người báo cáo',
			dataIndex: ['reporter', 'fullName'],
			key: 'reporter',
			width: 220,
			render: (_: any, record: any) => (
				<div>
					<div style={{ fontWeight: 600, fontSize: '13px' }}>{record.reporter?.fullName || 'Người dùng ẩn danh'}</div>
					<Text type='secondary' style={{ fontSize: '12px' }}>{record.reporter?.email || 'Không có email'}</Text>
				</div>
			),
		},
		{
			title: 'Người bị báo cáo',
			key: 'reportedUser',
			width: 220,
			render: (_: any, record: any) => {
				const author = record?.targetId?.author;
				return (
					<div>
						<div style={{ fontWeight: 600, fontSize: '13px' }}>{author?.fullName || 'Không rõ tác giả'}</div>
						<Text type='secondary' style={{ fontSize: '12px' }}>{author?.email || 'Không có email'}</Text>
					</div>
				);
			},
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			width: 120,
			filters: [
				{ text: 'Chưa xử lý', value: 'PENDING' },
				{ text: 'Đã xử lý', value: 'RESOLVED' },
				{ text: 'Đã từ chối', value: 'REJECTED' },
			],
			filterMultiple: false,
			filteredValue: statusFilter ? [statusFilter] : null,
			render: (status: string) => {
				const label = STATUS_LABEL[status] || { text: status, color: 'default' };
				return <Tag color={label.color} style={{ borderRadius: 4 }}>{label.text}</Tag>;
			},
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 170,
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Space size='small'>
					<Tooltip title='Xem đối tượng'>
						<Button
							type='text'
							icon={<EyeOutlined style={{ color: '#0074cc', fontSize: 18 }} />}
							onClick={() => openTargetContent(record)}
						/>
					</Tooltip>
					{record.status === 'PENDING' && (
						<>
							<Tooltip title='Giải quyết'>
								<Button
									type='text'
									icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />}
									onClick={() => handleStatusUpdate(record._id, 'RESOLVED')}
								/>
							</Tooltip>
							<Tooltip title='Từ chối'>
								<Button
									type='text'
									icon={<CloseCircleOutlined style={{ color: '#f5222d', fontSize: 18 }} />}
									onClick={() => handleStatusUpdate(record._id, 'REJECTED')}
								/>
							</Tooltip>
						</>
					)}
					<Popconfirm
						title='Xóa báo cáo này?'
						onConfirm={() => handleDeleteReport(record._id)}
						okText='Xóa'
						cancelText='Hủy'
					>
						<Tooltip title='Xóa báo cáo'>
							<Button
								type='text'
								danger
								icon={<DeleteOutlined style={{ fontSize: 18 }} />}
							/>
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
			<Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)' }}>
				<div style={{ marginBottom: 20 }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
						<div>
							<Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1a3353' }}>
								<FlagOutlined style={{ color: '#1890ff', marginRight: 8 }} /> Quản lý báo cáo
							</Title>
						</div>
						<Space wrap size={8}>
							<Input
								style={{ width: 280, borderRadius: 8, height: 40 }}
								placeholder='Tìm lý do, người báo cáo...'
								prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
								value={searchText}
								onChange={(e) => {
									setSearchText(e.target.value);
									fetchData(e.target.value, statusFilter, typeFilter, 1);
								}}
							/>
							<Tooltip title='Tổng số hàng dữ liệu trong bảng'>
								<div style={{ padding: '0 15px', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff', color: '#0095ff', border: '1px solid #0095ff', borderRadius: 8, fontWeight: 'bold', fontSize: 14, whiteSpace: 'nowrap' }}>
									Tổng số: {total}
								</div>
							</Tooltip>
						</Space>
					</div>
				</div>
				<Divider style={{ margin: '20px 0' }} />

				<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Card
							size='small'
							bordered={false}
							style={{
								borderRadius: 12,
								background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
								border: '1px solid #91d5ff',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
							}}
						>
							<Statistic
								title={<Text strong style={{ color: '#0050b3' }}>TỔNG BÁO CÁO</Text>}
								value={summary.total}
								valueStyle={{ color: '#0050b3', fontWeight: 'bold' }}
								prefix={<FlagOutlined />}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Card
							size='small'
							bordered={false}
							style={{
								borderRadius: 12,
								background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
								border: '1px solid #ffd666',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
							}}
						>
							<Statistic
								title={<Text strong style={{ color: '#874d00' }}>CHƯA XỬ LÝ</Text>}
								value={summary.pending}
								valueStyle={{ color: '#874d00', fontWeight: 'bold' }}
								prefix={<ClockCircleOutlined />}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Card
							size='small'
							bordered={false}
							style={{
								borderRadius: 12,
								background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
								border: '1px solid #b7eb8f',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
							}}
						>
							<Statistic
								title={<Text strong style={{ color: '#237804' }}>ĐÃ XỬ LÝ</Text>}
								value={summary.resolved}
								valueStyle={{ color: '#237804', fontWeight: 'bold' }}
								prefix={<CheckCircleOutlined />}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Card
							size='small'
							bordered={false}
							style={{
								borderRadius: 12,
								background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
								border: '1px solid #ffa39e',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
							}}
						>
							<Statistic
								title={<Text strong style={{ color: '#a8071a' }}>TỪ CHỐI</Text>}
								value={summary.rejected}
								valueStyle={{ color: '#a8071a', fontWeight: 'bold' }}
								prefix={<CloseCircleOutlined />}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Card
							size='small'
							bordered={false}
							style={{
								borderRadius: 12,
								background: 'linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%)',
								border: '1px solid #adc6ff',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
							}}
						>
							<Statistic title={<Text strong style={{ color: '#1d39c4' }}>BÁO CÁO BÀI VIẾT</Text>} value={summary.posts} valueStyle={{ color: '#1d39c4', fontWeight: 'bold' }} prefix={<FileTextOutlined />} />
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Card
							size='small'
							bordered={false}
							style={{
								borderRadius: 12,
								background: 'linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%)',
								border: '1px solid #ffe58f',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
							}}
						>
							<Statistic
								title={<Text strong style={{ color: '#ad8b00' }}>BÁO CÁO BÌNH LUẬN</Text>}
								value={summary.comments}
								valueStyle={{ color: '#ad8b00', fontWeight: 'bold' }}
								prefix={<CommentOutlined />}
							/>
						</Card>
					</Col>
				</Row>

				<Table
					rowKey='_id'
					columns={columns}
					dataSource={reports}
					loading={loading}
					pagination={{
						current: page,
						pageSize: limit,
						total: total,
						showSizeChanger: false,
						showQuickJumper: true,
					}}
					onChange={handleTableChange}
					locale={{ emptyText: 'Không có báo cáo phù hợp' }}
				/>
			</Card>
		</div>
	);
};

export default QuanLyBaoCao;
