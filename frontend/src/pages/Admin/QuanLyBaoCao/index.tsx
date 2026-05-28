import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
	CommentOutlined,
	DeleteOutlined,
	EyeOutlined,
	FlagOutlined,
	MenuOutlined,
	SearchOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Divider,
	Input,
	Modal,
	Popconfirm,
	Popover,
	Row,
	Space,
	Statistic,
	Table,
	Tag,
	Tooltip,
	Typography,
	message,
	Select,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

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
	const [detailVisible, setDetailVisible] = useState<boolean>(false);
	const [selectedReport, setSelectedReport] = useState<any>(null);

	useEffect(() => {
		getModel();
	}, []);

	const fetchData = (search = searchText, status = statusFilter, type = typeFilter, p = page, l = limit) => {
		const query: any = {};
		if (search) query.search = search;
		if (status) query.status = status;
		if (type) query.targetType = type;

		setPage(p);
		setLimit(l);
		getModel(undefined, undefined, undefined, p, l, undefined, query);
	};

	const getTargetId = (report: any) => {
		if (!report?.targetId) return '-';
		if (typeof report.targetId === 'object') return report.targetId._id || report.targetId.toString();
		return report.targetId;
	};

	const getTargetLink = (report: any) => {
		const id = getTargetId(report);
		if (!id) return null;
		if (report.targetType === 'Post') return `/question/${id}`;
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

	const showDetail = (report: any) => {
		setSelectedReport(report);
		setDetailVisible(true);
	};

	const closeDetail = () => {
		setSelectedReport(null);
		setDetailVisible(false);
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
			width: 140,
			render: (type: string) => <Tag color={type === 'Post' ? 'cyan' : 'geekblue'}>{TYPE_LABEL[type] || type}</Tag>,
		},
		{
			title: 'ID đối tượng',
			dataIndex: 'targetId',
			key: 'targetId',
			width: 180,
			render: (_: any, record: any) => (
				<Text copyable>{getTargetId(record)}</Text>
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
					<div style={{ fontWeight: 600 }}>{record.reporter?.fullName || 'Người dùng ẩn danh'}</div>
					<Text type='secondary'>{record.reporter?.email || 'Không có email'}</Text>
				</div>
			),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			width: 140,
			render: (status: string) => {
				const label = STATUS_LABEL[status] || { text: status, color: 'default' };
				return <Tag color={label.color}>{label.text}</Tag>;
			},
		},
		{
			title: 'Ngày báo cáo',
			dataIndex: 'createdAt',
			key: 'createdAt',
			width: 150,
			render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 80,
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Popover
					content={
						<Space size='middle'>
							<Tooltip title='Xem chi tiết'>
								<Button icon={<EyeOutlined style={{ color: '#0074cc' }} />} type='text' onClick={() => showDetail(record)} />
							</Tooltip>
							{getTargetLink(record) ? (
								<Tooltip title='Mở nội dung được báo cáo'>
									<Button
										icon={<FileTextOutlined style={{ color: '#1890ff' }} />}
										type='text'
										onClick={() => {
											const link = getTargetLink(record);
											if (link) window.open(link, '_blank');
										}}
									/>
								</Tooltip>
							) : (
								<Tooltip title='Không có đường dẫn trực tiếp'>
									<Button icon={<FlagOutlined />} type='text' disabled />
								</Tooltip>
							)}
							{record.status !== 'RESOLVED' && (
								<Tooltip title='Đánh dấu đã xử lý'>
									<Button
										icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
										type='text'
										onClick={() => handleStatusUpdate(record._id, 'RESOLVED')}
									/>
								</Tooltip>
							)}
							{record.status !== 'REJECTED' && (
								<Tooltip title='Từ chối báo cáo'>
									<Button
										icon={<CloseCircleOutlined style={{ color: '#faad14' }} />}
										type='text'
										onClick={() => handleStatusUpdate(record._id, 'REJECTED')}
									/>
								</Tooltip>
							)}
							<Tooltip title='Xóa báo cáo'>
								<Popconfirm
									title='Bạn có chắc muốn xóa báo cáo này?'
									onConfirm={() => handleDeleteReport(record._id)}
									okText='Xóa'
									cancelText='Hủy'
								>
									<Button icon={<DeleteOutlined />} type='text' danger />
								</Popconfirm>
							</Tooltip>
						</Space>
					}
					placement='left'
					trigger='hover'
				>
					<Button type='text' icon={<MenuOutlined />} />
				</Popover>
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
							<Select
								style={{ width: 180 }}
								placeholder='Lọc trạng thái'
								value={statusFilter}
								onChange={(value) => {
									setStatusFilter(value);
									fetchData(searchText, value, typeFilter, 1);
								}}
								allowClear
							>
								<Option value='PENDING'>Chưa xử lý</Option>
								<Option value='RESOLVED'>Đã xử lý</Option>
								<Option value='REJECTED'>Đã từ chối</Option>
							</Select>
							<Select
								style={{ width: 180 }}
								placeholder='Lọc loại'
								value={typeFilter}
								onChange={(value) => {
									setTypeFilter(value);
									fetchData(searchText, statusFilter, value, 1);
								}}
								allowClear
							>
								<Option value='Post'>Bài viết</Option>
								<Option value='Comment'>Bình luận</Option>
							</Select>
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
						onChange: (current, size) => {
							setPage(current);
							setLimit(size);
							fetchData(searchText, statusFilter, typeFilter, current, size);
						},
					}}
					locale={{ emptyText: 'Không có báo cáo phù hợp' }}
				/>
			</Card>

			<Modal
				title='Chi tiết báo cáo'
				visible={detailVisible}
				onCancel={closeDetail}
				onOk={closeDetail}
				okText='Đóng'
			>
				{selectedReport ? (
					<div>
						<Space direction='vertical' size='middle' style={{ width: '100%' }}>
							<div>
								<Text strong>Loại đối tượng:</Text> <Text>{TYPE_LABEL[selectedReport.targetType] || selectedReport.targetType}</Text>
							</div>
							<div>
								<Text strong>ID đối tượng:</Text> <Text copyable>{getTargetId(selectedReport)}</Text>
							</div>
							<div>
								<Text strong>Lý do:</Text>
								<div style={{ marginTop: 8 }}>{selectedReport.reason}</div>
							</div>
							<div>
								<Text strong>Người báo cáo:</Text>
								<div style={{ marginTop: 8 }}>{selectedReport.reporter?.fullName || selectedReport.reporter?.email || 'Không rõ'}</div>
								<Text type='secondary'>{selectedReport.reporter?.email}</Text>
							</div>
							<div>
								<Text strong>Trạng thái:</Text>{' '}
								<Tag color={STATUS_LABEL[selectedReport.status]?.color || 'default'}>{STATUS_LABEL[selectedReport.status]?.text || selectedReport.status}</Tag>
							</div>
							<div>
								<Text strong>Ngày tạo:</Text>{' '}
								<Text>{moment(selectedReport.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
							</div>
							{getTargetLink(selectedReport) ? (
								<Button
									type='link'
									onClick={() => {
									const link = getTargetLink(selectedReport);
									if (link) window.open(link, '_blank');
								}}
								>
									Mở nội dung liên quan
								</Button>
							) : (
								<Text type='secondary'>Không có đường dẫn trực tiếp đến nội dung báo cáo.</Text>
							)}
						</Space>
					</div>
				) : null}
			</Modal>
		</div>
	);
};

export default QuanLyBaoCao;
