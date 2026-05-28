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
	UserOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Descriptions,
	Divider,
	Input,
	Modal,
	Popover,
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
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { removeHtmlTags, toRegex } from '@/utils/utils';

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
	const { danhSach, getModel, putModel, deleteModel, loading, page, limit, total, setPage, setLimit } = useModel('reports');

	const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
	const [currentReportDetail, setCurrentReportDetail] = useState<any>(null);
	const [searchText, setSearchText] = useState<string>('');

	const handleSearchTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchText(value);
		setPage(1);
		if (value) {
			const fetchLimit = total > 0 ? total : 9999;
			await getModel(undefined, undefined, undefined, 1, fetchLimit).catch(() => {});
		} else {
			getModel(undefined, undefined, undefined, 1, limit);
		}
	};

	useEffect(() => {
		getModel();
	}, []);

	const refreshData = () => {
		getModel();
	};

	const getColumnSearchProps = (dataIndex: string, title: string) => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: any) => (
			<div style={{ padding: 12 }} onKeyDown={(e) => e.stopPropagation()}>
				<Input
					placeholder={`Tìm ${title}...`}
					value={selectedKeys[0]}
					onChange={async (e) => {
						const value = e.target.value;
						setSelectedKeys(value ? [value] : []);
						setPage(1);
						confirm({ closeDropdown: false });
						if (value && danhSach.length < total) {
							await getModel(undefined, undefined, undefined, 1, 9999).catch(() => {});
						}
					}}
					style={{ width: 280, borderRadius: '6px' }}
					prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
					allowClear
				/>
			</div>
		),
		filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value: any, record: any) => {
			const lowerValue = String(value).toLowerCase();
			if (dataIndex === 'reporter') {
				return (record.reporter?.fullName || '').toLowerCase().includes(lowerValue) || (record.reporter?.email || '').toLowerCase().includes(lowerValue);
			}
			if (dataIndex === 'reportedUser') {
				const author = record?.targetId?.author;
				return (author?.fullName || '').toLowerCase().includes(lowerValue) || (author?.email || '').toLowerCase().includes(lowerValue);
			}
			return (record[dataIndex] || '').toString().toLowerCase().includes(lowerValue);
		},
	});

	const handleTableChange = (pagination: any) => {
		setPage(pagination.current);
		setLimit(pagination.pageSize);
		if (!searchText) {
			getModel(undefined, undefined, undefined, pagination.current, pagination.pageSize);
		}
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
			const postId = report.targetId?.post?._id || report.targetId?.post || report.postId;
			return postId ? `/question/${postId}?commentId=${id}` : `/question/${id}`;
		}
		return null;
	};

	const showReportDetail = (report: any) => {
		setCurrentReportDetail(report);
		setIsDetailModalVisible(true);
	};

	const handleStatusUpdate = async (id: string, status: string) => {
		try {
			await putModel(id, { status }, undefined, false, undefined, `Đã chuyển trạng thái thành ${STATUS_LABEL[status]?.text || status}`);
			refreshData();
		} catch (error) {
		}
	};


	const handleDeleteReport = async (id: string) => {
		try {
			await deleteModel(id);
			getModel();
		} catch (error) {
			message.error('Xóa báo cáo thất bại');
		}
	};

	const getTargetSummary = (report: any) => {
		const target = report?.targetId;
		if (!target) return 'Không có dữ liệu';
		if (typeof target === 'object') {
			const rawText = report.targetType === 'Post' ? (target.title || target.content) : target.content;
			return removeHtmlTags(rawText || target._id || 'Không có nội dung');
		}
		return removeHtmlTags(String(target));
	};

	const openTargetContent = (record: any) => {
		const url = getTargetLink(record);
		if (!url) {
			message.warning('Không tìm thấy đường dẫn đối tượng.');
			return;
		}
		window.open(url, '_blank');
	};

	const filteredData = React.useMemo(() => {
		const dataSource = danhSach || [];
		if (!searchText) return dataSource;
		const lowerSearch = searchText.toLowerCase();
		return dataSource.filter((r: any) =>
			(r.reason || '').toLowerCase().includes(lowerSearch) ||
			(r.reporter?.fullName || '').toLowerCase().includes(lowerSearch) ||
			(r.reporter?.email || '').toLowerCase().includes(lowerSearch) ||
			(r.targetType || '').toLowerCase().includes(lowerSearch) ||
			(r.targetId?.author?.fullName || '').toLowerCase().includes(lowerSearch) ||
			(r.targetId?.author?.email || '').toLowerCase().includes(lowerSearch)
		);
	}, [danhSach, searchText]);

	const summary = useMemo(() => {
		const counts = {
			total: total || 0,
			pending: 0,
			resolved: 0,
			rejected: 0,
			posts: 0,
			comments: 0,
		};
		danhSach?.forEach((item: any) => {
			if (item.status === 'PENDING') counts.pending += 1;
			if (item.status === 'RESOLVED') counts.resolved += 1;
			if (item.status === 'REJECTED') counts.rejected += 1;
			if (item.targetType === 'Post') counts.posts += 1;
			if (item.targetType === 'Comment') counts.comments += 1;
		});
		return counts;
	}, [danhSach, total]);

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
			onFilter: (value: any, record: any) => record.targetType === value,
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
			...getColumnSearchProps('reason', 'lý do'),
			render: (reason: string) => <Text ellipsis={{ tooltip: removeHtmlTags(reason) }}>{removeHtmlTags(reason)}</Text>,
		},
		{
			title: 'Người báo cáo',
			dataIndex: ['reporter', 'fullName'],
			key: 'reporter',
			...getColumnSearchProps('reporter', 'người báo cáo'),
			width: 220,
			render: (_: any, record: any) => (
				<a onClick={() => showReportDetail(record)}>
					<Space>
						<UserOutlined style={{ color: '#6a737c' }} />
						<Text strong style={{ color: '#0074cc' }}>
							{record.reporter?.fullName || record.reporter?.email || 'Người dùng ẩn danh'}
						</Text>
					</Space>
				</a>
			),
		},
		{
			title: 'Người bị báo cáo',
			key: 'reportedUser',
			...getColumnSearchProps('reportedUser', 'người bị báo cáo'),
			width: 220,
			render: (_: any, record: any) => {
				const author = record?.targetId?.author;
				return (
					<Space>
						<UserOutlined style={{ color: '#6a737c' }} />
						<Text strong style={{ color: '#0074cc' }}>
							{author?.fullName || author?.email || 'Không rõ tác giả'}
						</Text>
					</Space>
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
			onFilter: (value: any, record: any) => record.status === value,
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
				<Popover
					content={
						<Space size="middle">
							<Tooltip title='Xem đối tượng'>
								<Button
									type='text'
									icon={<EyeOutlined style={{ color: '#0074cc' }} />}
									onClick={() => openTargetContent(record)}
								/>
							</Tooltip>
							{record.status === 'PENDING' && (
								<>
									<Tooltip title='Giải quyết'>
										<Button
											type='text'
											icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
											onClick={() => handleStatusUpdate(record._id, 'RESOLVED')}
										/>
									</Tooltip>
									<Tooltip title='Từ chối'>
										<Button
											type='text'
											icon={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
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
										icon={<DeleteOutlined />}
									/>
								</Tooltip>
							</Popconfirm>
						</Space>
					}
					placement="left"
					trigger="hover"
				>
					<Button type="text" icon={<MenuOutlined />} />
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
						<Space size={8}>
							<Input
								placeholder="Tìm lý do, người báo cáo..."
								prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
								value={searchText}
								onChange={handleSearchTextChange}
								style={{ width: 280, borderRadius: '6px', height: '40px' }}
								allowClear
							/>
							<Tooltip title='Tổng số hàng dữ liệu trong bảng'>
								<div style={{ padding: '0 15px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff', color: '#0095ff', border: '1px solid #0095ff', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
									Tổng số: {searchText ? filteredData.length : total}
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
					dataSource={filteredData as any}
					loading={loading}
					pagination={{
						current: page,
						pageSize: limit,
						total: searchText ? filteredData.length : total,
						showSizeChanger: false,
						showQuickJumper: true,
						locale: { jump_to: 'Đến trang', page: '' },
					}}
					onChange={handleTableChange}
					locale={{ emptyText: 'Không có báo cáo phù hợp' }}
				/>
			</Card>

			<Modal
				title={`Chi tiết báo cáo`}
				visible={isDetailModalVisible}
				onCancel={() => setIsDetailModalVisible(false)}
				footer={null}
				width={750}
				centered
			>
				<Descriptions bordered column={1} size="small">
					<Descriptions.Item label="Người báo cáo">{currentReportDetail?.reporter?.fullName || '---'}</Descriptions.Item>
					<Descriptions.Item label="Email">{currentReportDetail?.reporter?.email || '---'}</Descriptions.Item>
					<Descriptions.Item label="Lý do báo cáo"><Text type="danger">{currentReportDetail?.reason || '---'}</Text></Descriptions.Item>
					<Descriptions.Item label="Mô tả">{currentReportDetail?.description || '---'}</Descriptions.Item>
					<Descriptions.Item label="Loại nội dung">{currentReportDetail?.targetType === 'Post' ? 'Bài viết' : 'Bình luận'}</Descriptions.Item>
					<Descriptions.Item label="ID nội dung bị báo cáo">{currentReportDetail?.targetId?._id || currentReportDetail?.targetId || '---'}</Descriptions.Item>
					<Descriptions.Item label="Trạng thái">{STATUS_LABEL[currentReportDetail?.status]?.text || currentReportDetail?.status || '---'}</Descriptions.Item>
					<Descriptions.Item label="Ngày tạo">{currentReportDetail?.createdAt ? moment(currentReportDetail.createdAt).format('DD/MM/YYYY HH:mm') : '---'}</Descriptions.Item>
				</Descriptions>
			</Modal>
		</div>
	);
};

export default QuanLyBaoCao;