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
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { removeHtmlTags } from '@/utils/utils';

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

	const [isResolveModalVisible, setIsResolveModalVisible] = useState<boolean>(false);
	const [currentResolveReport, setCurrentResolveReport] = useState<any>(null);
	const [selectedAction, setSelectedAction] = useState<'delete' | 'ban' | 'reject' | null>(null);
	const [isConfirming, setIsConfirming] = useState<boolean>(false);
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
			return postId ? `/question/${postId}#comment-${id}` : `/question/${id}`;
		}
		return null;
	};

	const showResolveModal = (report: any) => {
		setCurrentResolveReport(report);
		setSelectedAction(null);
		setIsResolveModalVisible(true);
	};

	const handleStatusUpdate = async (id: string, status: string, messageText?: string) => {
		try {
			await putModel(id, { status }, undefined, false, undefined, messageText || `Đã chuyển trạng thái thành ${STATUS_LABEL[status]?.text || status}`);
			refreshData();
		} catch (error) {
		}
	};

	const handleProcessReport = async (report: any, actionType: 'delete' | 'ban' | 'reject') => {
		const actionLabel = actionType === 'delete' ? 'Xóa nội dung này' : actionType === 'ban' ? 'Khóa tài khoản' : 'Từ chối';
		const status = actionType === 'reject' ? 'REJECTED' : 'RESOLVED';
		await handleStatusUpdate(report._id, status, `${actionType === 'reject' ? 'Đã từ chối' : 'Đã giải quyết'}: ${actionLabel}`);
	};

	const confirmProcessReport = async () => {
		if (!currentResolveReport) return;
		if (!selectedAction) {
			message.warning('Vui lòng chọn hình thức xử lý.');
			return;
		}
		setIsConfirming(true);
		try {
			await handleProcessReport(currentResolveReport, selectedAction);
			setIsResolveModalVisible(false);
			setSelectedAction(null);
			refreshData();
		} catch (error) {
		} finally {
			setIsConfirming(false);
		}
	};

	const handleCancelModal = () => {
		setIsResolveModalVisible(false);
		setSelectedAction(null);
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

	const getTargetViolationContent = (report: any) => {
		const target = report?.targetId;
		if (!target) return 'Không có nội dung vi phạm';

		if (report.targetType === 'Post') {
			return removeHtmlTags(target.title || target.content || '---');
		}

		if (report.targetType === 'Comment') {
			const commentText = removeHtmlTags(target.content || '---');
			const postTitle = target.post?.title
				? removeHtmlTags(target.post.title)
				: typeof target.post === 'string'
					? target.post
					: report.postId || '';

			return postTitle
				? `Bài viết: ${postTitle}\n\nBình luận: ${commentText}`
				: `Bình luận: ${commentText}`;
		}

		return removeHtmlTags(target.title || target.content || '---');
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
				<Space>
					<UserOutlined style={{ color: '#6a737c' }} />
					<Text strong style={{ color: '#0074cc' }}>
						{record.reporter?.fullName || record.reporter?.email || 'Người dùng ẩn danh'}
					</Text>
				</Space>
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
							<Tooltip title='Giải quyết'>
									<Button
										type='text'
										icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
										onClick={() => showResolveModal(record)}
									/>
								</Tooltip>
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
		title={`Xử lý báo cáo`}
		visible={isResolveModalVisible}
		onCancel={handleCancelModal}
		footer={[
			<Button key="cancel" onClick={handleCancelModal}>
				Hủy
			</Button>,
			<Button key="confirm" type="primary" loading={isConfirming} disabled={!selectedAction || currentResolveReport?.status !== 'PENDING'} onClick={confirmProcessReport}>
				OK
			</Button>,
		]}
		width={750}
		centered
	>
	<Descriptions bordered column={1} size="small">
<Descriptions.Item label="Người bị báo cáo">
{currentResolveReport?.targetId?.author?.fullName || currentResolveReport?.targetId?.author?.email || '---'}
{currentResolveReport?.targetId?.author?.email && (
<div style={{ marginTop: 8 }}><Text type="secondary">{currentResolveReport?.targetId?.author?.email}</Text></div>
)}
</Descriptions.Item>
<Descriptions.Item label="Nội dung vi phạm">
<div style={{ whiteSpace: 'pre-line' }}>
{getTargetViolationContent(currentResolveReport)}
</div>
</Descriptions.Item>
<Descriptions.Item label="Liên kết nội dung vi phạm">
{currentResolveReport && (
<Button type="link" onClick={() => openTargetContent(currentResolveReport)}>
Mở nội dung vi phạm
</Button>
)}
</Descriptions.Item>
<Descriptions.Item label="Trạng thái báo cáo">
<Tag color={STATUS_LABEL[currentResolveReport?.status]?.color || 'default'}>
{STATUS_LABEL[currentResolveReport?.status]?.text || currentResolveReport?.status || '---'}
</Tag>
</Descriptions.Item>
</Descriptions>

<div style={{ marginTop: 24 }}>
			<Title level={5}>Xử lý</Title>
			<Space wrap size='middle'>
				<Button
					type={selectedAction === 'delete' ? 'primary' : 'default'}
					danger
					onClick={() => currentResolveReport?.status === 'PENDING' && setSelectedAction('delete')}
					disabled={currentResolveReport?.status !== 'PENDING'}
				>
					Xóa nội dung này
				</Button>
				<Button
					type={selectedAction === 'ban' ? 'primary' : 'default'}
					onClick={() => currentResolveReport?.status === 'PENDING' && setSelectedAction('ban')}
					disabled={currentResolveReport?.status !== 'PENDING'}
				>
					Khóa tài khoản
				</Button>
				<Button
					type={selectedAction === 'reject' ? 'primary' : 'default'}
					danger={selectedAction === 'reject'}
					onClick={() => currentResolveReport?.status === 'PENDING' && setSelectedAction('reject')}
					disabled={currentResolveReport?.status !== 'PENDING'}
				>
					Từ chối
				</Button>
			</Space>
			{!selectedAction && currentResolveReport?.status === 'PENDING' && (
				<div style={{ marginTop: 16 }}>
					<Text type='secondary'>Vui lòng chọn hình thức xử lý, sau đó bấm OK.</Text>
				</div>
			)}
			{currentResolveReport?.status !== 'PENDING' && (
				<div style={{ marginTop: 16 }}>
					<Text type='secondary'>Báo cáo hiện tại có trạng thái: {STATUS_LABEL[currentResolveReport?.status]?.text || currentResolveReport?.status || '---'}.</Text>
				</div>
			)}
		</div>
</Modal>
		</div>
	);
};

export default QuanLyBaoCao;