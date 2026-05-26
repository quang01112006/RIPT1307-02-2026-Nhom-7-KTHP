import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	MenuOutlined,
	PlusOutlined,
	SearchOutlined,
	UserOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Descriptions,
	Dropdown,
	Form,
	Input,
	Menu,
	Modal,
	Popover,
	Popconfirm,
	Row,
	Select,
	Space,
	Statistic,
	Switch,
	Table,
	Tag,
	Tooltip,
	Typography,
	Divider,
	message,
} from 'antd';
import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

const { Text, Title } = Typography;

const QuanLyUser: React.FC = () => {
	const { danhSach, getModel, deleteModel, putModel, loading, page, limit, total, setPage, setLimit } = useModel('users');
	const { initialState } = useModel('@@initialState');
	const [form] = Form.useForm();

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
	const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
	const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
	const [currentUserDetail, setCurrentUserDetail] = useState<any>(null);

	const activeCount = useMemo(() => danhSach?.filter((u: any) => u.isActive).length || 0, [danhSach]);
	const adminCount = useMemo(() => danhSach?.filter((u: any) => u.role === 'admin').length || 0, [danhSach]);
	const totalCount = total || 0;

	useEffect(() => {
		getModel();
	}, []);

	const refreshData = () => {
		getModel();
	};

	const handleStatusChange = async (checked: boolean, record: any) => {
		if (record._id === initialState?.currentUser?._id) {
			message.warning('Bạn không thể tự khóa tài khoản của chính mình!');
			return;
		}

		try {
			await putModel(record._id, { isActive: checked });
			message.success(`Đã ${checked ? 'kích hoạt' : 'khóa'} tài khoản ${record.fullName || record.email}`);
			refreshData();
		} catch (error) {
			message.error('Cập nhật trạng thái thất bại!');
		}
	};

	const handleRoleChange = async (record: any, newRole?: string) => {
		const targetRole = newRole ?? (record.role === 'admin' ? 'teacher' : record.role === 'teacher' ? 'student' : 'admin');
		try {
			await putModel(record._id, { role: targetRole });
			message.success(`Đã cập nhật vai trò ${targetRole} cho ${record.fullName || record.email}`);
			refreshData();
		} catch (error) {
			message.error('Đổi vai trò thất bại');
		}
	};

	const handleCreateUser = async (values: any) => {
		try {
			const payload = {
				fullName: values.fullName,
				email: values.email,
				password: values.password,
				code: values.code,
				role: values.role || 'student',
				faculty: values.faculty,
				bio: values.bio,
			};
			await axios.post(`${ip3}/users/register`, payload);
			message.success('Thêm người dùng mới thành công');
			setIsCreateModalVisible(false);
			form.resetFields();
			refreshData();
		} catch (error: any) {
			console.error('Create user error:', error);
			message.error(error?.response?.data?.message || 'Không thể thêm người dùng');
		}
	};

	const loadUserDetail = (user: any) => {
		setCurrentUserDetail(user);
		setIsDetailModalVisible(true);
	};

	const showUserDetail = (user: any) => {
		loadUserDetail(user);
	};

	const handleColumnSearchChange = async (value: string) => {
		setSearchText(value);
		setPage(1);
		if (value) {
			const fetchLimit = total > 0 ? total : 9999;
			await getModel(undefined, undefined, undefined, 1, fetchLimit).catch(() => {});
		} else {
			getModel(undefined, undefined, undefined, 1, limit);
		}
	};

	const getColumnSearchProps = (dataIndex: string, title: string) => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
			<div style={{ padding: 12 }} onKeyDown={(e) => e.stopPropagation()}>
				<Input
					placeholder={`Tìm ${title}...`}
					value={selectedKeys[0]}
					onChange={async (e) => {
						const value = e.target.value;
						setSelectedKeys(value ? [value] : []);
						await handleColumnSearchChange(value);
					}}
					style={{ width: 280, borderRadius: '6px' }}
					prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
					allowClear
				/>
			</div>
		),
		filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value: any, record: any) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
	});

	const columns = [
		{
			title: 'STT',
			key: 'index',
			width: 60,
			align: 'center' as const,
			render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
		},
		{
			title: 'Mã',
			dataIndex: 'code',
			key: 'code',
			...getColumnSearchProps('code', 'mã'),
			width: 120,
			sorter: (a: any, b: any) => (a.code || '').localeCompare(b.code || ''),
		},
		{
			title: 'Tên người dùng',
			dataIndex: 'fullName',
			key: 'fullName',
			...getColumnSearchProps('fullName', 'tên'),
			sorter: (a: any, b: any) => (a.fullName || '').localeCompare(b.fullName || ''),
			render: (_: string, record: any) => (
				<a onClick={() => showUserDetail(record)}>
					<Space>
						<UserOutlined style={{ color: '#6a737c' }} />
						<Text strong style={{ color: '#0074cc' }}>
							{record.fullName || record.email || 'Chưa đặt tên'}
						</Text>
					</Space>
				</a>
			),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			...getColumnSearchProps('email', 'email'),
			width: 200,
			sorter: (a: any, b: any) => (a.email || '').localeCompare(b.email || ''),
		},
		{
			title: 'Vai trò',
			dataIndex: 'role',
			align: 'center' as const,
			key: 'role',
			filters: [
				{ text: 'Admin', value: 'admin' },
				{ text: 'Sinh viên', value: 'student' },
				{ text: 'Giảng viên', value: 'teacher' },
			],
			onFilter: (value: any, record: any) => record.role === value,
			render: (role: string) => (
				<Tag color={role === 'admin' ? 'volcano' : 'blue'} style={{ borderRadius: '4px' }}>
					{role === 'admin' ? 'ADMIN' : role === 'teacher' ? 'GIẢNG VIÊN' : 'SINH VIÊN'}
				</Tag>
			),
		},
		{
			title: 'Điểm uy tín',
			dataIndex: 'reputation',
			key: 'reputation',
			align: 'center' as const,
			sorter: (a: any, b: any) => (a.reputation || 0) - (b.reputation || 0),
			render: (score: number) => <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{score || 0}</Text>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'isActive',
			key: 'isActive',
			align: 'left' as const,
			render: (isActive: boolean, record: any) => (
				<Space>
					<Tooltip title={record._id === initialState?.currentUser?._id ? "Không thể tự khóa tài khoản" : (isActive ? "Đang hoạt động" : "Bị khóa")}>
						<Switch 
							checked={isActive} 
							onChange={(checked) => handleStatusChange(checked, record)} 
							size="small" 
							disabled={record._id === initialState?.currentUser?._id}
						/>
					</Tooltip>
					<Text type={isActive ? 'success' : 'danger'} style={{ fontSize: '13px', minWidth: '95px', textAlign: 'left' }}>
						{isActive ? 'Đang hoạt động' : 'Bị khóa'}
					</Text>
				</Space>
			),
		},
		{
			title: 'Thao tác',
			key: 'action',
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Popover
					content={
						<Space size="middle">
							<Tooltip title="Xem chi tiết">
								<Button type="text" icon={<EyeOutlined style={{ color: '#0074cc' }} />} onClick={() => showUserDetail(record)} />
							</Tooltip>
							<Dropdown
								overlay={
									<Menu>
										<Menu.Item key="admin" disabled={record.role === 'admin'} onClick={() => handleRoleChange(record, 'admin')}>Admin</Menu.Item>
										<Menu.Item key="teacher" disabled={record.role === 'teacher'} onClick={() => handleRoleChange(record, 'teacher')}>Giảng viên</Menu.Item>
										<Menu.Item key="student" disabled={record.role === 'student'} onClick={() => handleRoleChange(record, 'student')}>Sinh viên</Menu.Item>
									</Menu>
								}
							>
								<Tooltip title="Đổi vai trò">
									<Button type="text" icon={<EditOutlined style={{ color: '#faad14' }} />} />
								</Tooltip>
							</Dropdown>
							<Popconfirm 
								title={`Xóa ${record.fullName || 'người dùng này'}?`} 
								onConfirm={async () => { if (record.role !== 'admin') { await deleteModel(record._id); refreshData(); } }}
							>
								<Tooltip title={record.role === 'admin' ? "Không thể xóa tài khoản Admin" : "Xóa"}>
									<Button type="text" danger icon={<DeleteOutlined />} disabled={record.role === 'admin'} />
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

	const filteredData = React.useMemo(() => {
		const dataSource = danhSach || [];
		if (!searchText) return dataSource;
		const lowerSearch = searchText.toLowerCase();
		return dataSource.filter((u: any) =>
			(u.fullName || '').toLowerCase().includes(lowerSearch) ||
			u.email?.toLowerCase().includes(lowerSearch) ||
			u.code?.toLowerCase().includes(lowerSearch),
		);
	}, [danhSach, searchText]);

	return (
		<div style={{ padding: '24px' }}>
			<Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}>
				<div style={{ marginBottom: '20px' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
						<div>
							<Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1a3353', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
								<UserOutlined style={{ color: '#0095ff' }} />
								Quản lý người dùng
							</Title>
						</div>
						<Space size={8}>
							<Input
								placeholder="Tìm người dùng..."
								prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
								value={searchText}
								onChange={handleSearchTextChange}
								style={{ width: 280, borderRadius: '6px', height: '40px' }}
								allowClear
							/>
							<Button
								type="primary"
								icon={<PlusOutlined />}
								onClick={() => setIsCreateModalVisible(true)}
								style={{ borderRadius: '6px', backgroundColor: '#0095ff', borderColor: '#0095ff', height: '40px' }}
							>
								Thêm mới
							</Button>
							<Tooltip title="Tổng số cột dữ liệu trong bảng">
								<div style={{ padding: '0 15px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff', color: '#0095ff', border: '1px solid #0095ff', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
									Tổng số: {columns.length}
								</div>
							</Tooltip>
						</Space>
					</div>
				</div>

				<Row gutter={16} style={{ marginBottom: 24 }}>
					<Col span={8}>
						<Card bordered={false} style={{ borderRadius: 8, background: '#fafafa' }}>
							<Statistic title="Tổng người dùng" value={totalCount} />
						</Card>
					</Col>
					<Col span={8}>
						<Card bordered={false} style={{ borderRadius: 8, background: '#fafafa' }}>
							<Statistic title="Đang kích hoạt" value={activeCount} />
						</Card>
					</Col>
					<Col span={8}>
						<Card bordered={false} style={{ borderRadius: 8, background: '#fafafa' }}>
							<Statistic title="Admin" value={adminCount} />
						</Card>
					</Col>
				</Row>

				<Table
					columns={columns}
					dataSource={filteredData}
					loading={loading}
					rowKey="_id"
					pagination={{
						current: page,
						pageSize: limit,
						total: searchText ? filteredData.length : total,
						showSizeChanger: false,
						showQuickJumper: true,
						locale: { jump_to: 'Đến trang', page: '' },
						onChange: (p, s) => {
							setPage(p);
							setLimit(s);
							if (!searchText) {
								getModel(undefined, undefined, undefined, p, s);
							}
						},
					}}
					size="middle"
				/>
			</Card>

			<Modal
				title="Thêm người dùng mới"
				visible={isCreateModalVisible}
				onCancel={() => setIsCreateModalVisible(false)}
				onOk={() => form.submit()}
				okText="Lưu"
				cancelText="Hủy"
			>
				<Form form={form} layout="vertical" onFinish={handleCreateUser}>
					<Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
						<Input placeholder="Nhập họ và tên" />
					</Form.Item>
					<Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập đúng định dạng email!' }]}>
						<Input placeholder="example@gmail.com" />
					</Form.Item>
					<Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
						<Input.Password placeholder="Nhập mật khẩu mặc định" />
					</Form.Item>
					<Form.Item name="code" label="Mã sinh viên/giảng viên" rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên/giảng viên!' }]}>
						<Input placeholder="SV001 hoặc GV001" />
					</Form.Item>
					<Form.Item name="faculty" label="Khoa">
						<Input placeholder="Khoa/Đơn vị" />
					</Form.Item>
					<Form.Item name="bio" label="Giới thiệu">
						<Input.TextArea placeholder="Một dòng giới thiệu ngắn" rows={3} />
					</Form.Item>
					<Form.Item name="role" label="Vai trò" initialValue="student">
						<Select options={[
							{ label: 'Admin', value: 'admin' },
							{ label: 'Giảng viên', value: 'teacher' },
							{ label: 'Sinh viên', value: 'student' },
						]} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={`Chi tiết: ${currentUserDetail?.fullName || currentUserDetail?.email || 'Người dùng'}`}
				visible={isDetailModalVisible}
				onCancel={() => setIsDetailModalVisible(false)}
				footer={null}
				width={750}
				centered
			>
								<Descriptions bordered column={1} size="small">
					<Descriptions.Item label="Họ và tên">{currentUserDetail?.fullName || '---'}</Descriptions.Item>
					<Descriptions.Item label="Email">{currentUserDetail?.email || '---'}</Descriptions.Item>
					<Descriptions.Item label="Mã sinh viên/giảng viên">{currentUserDetail?.code || '---'}</Descriptions.Item>
					<Descriptions.Item label="Vai trò">
						{currentUserDetail?.role === 'admin' ? 'ADMIN' : 
						 currentUserDetail?.role === 'teacher' ? 'GIẢNG VIÊN' : 
						 'SINH VIÊN'}
					</Descriptions.Item>
					<Descriptions.Item label="Khoa">{currentUserDetail?.faculty || '---'}</Descriptions.Item>
					<Descriptions.Item label="Điểm uy tín">{currentUserDetail?.reputation ?? 0}</Descriptions.Item>
					<Descriptions.Item label="Giới thiệu">{currentUserDetail?.bio || '---'}</Descriptions.Item>
					<Descriptions.Item label="Kỹ năng">{currentUserDetail?.skills?.length ? currentUserDetail.skills.join(', ') : '---'}</Descriptions.Item>
					<Descriptions.Item label="Trạng thái">{currentUserDetail?.isActive ? 'Đang hoạt động' : 'Bị khóa'}</Descriptions.Item>
					<Descriptions.Item label="Ngày tạo">{currentUserDetail?.createdAt ? moment(currentUserDetail.createdAt).format('DD/MM/YYYY HH:mm') : '---'}</Descriptions.Item>
				</Descriptions>
			</Modal>
		</div>
	);
};

export default QuanLyUser;