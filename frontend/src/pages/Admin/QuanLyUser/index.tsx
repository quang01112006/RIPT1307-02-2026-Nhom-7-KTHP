import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	MenuOutlined,
	PhoneOutlined,
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
	const [form] = Form.useForm();

	const [searchText, setSearchText] = useState<string>('');
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
		try {
			await putModel(record._id, { isActive: checked });
			message.success(`Đã ${checked ? 'kích hoạt' : 'khóa'} tài khoản ${record.fullName || record.email}`);
			refreshData();
		} catch (error) {
			message.error('Cập nhật trạng thái thất bại!');
		}
	};

	const handleRoleChange = async (record: any) => {
		const newRole = record.role === 'admin' ? 'teacher' : record.role === 'teacher' ? 'student' : 'admin';
		try {
			await putModel(record._id, { role: newRole });
			message.success(`Đã cập nhật vai trò ${newRole} cho ${record.fullName || record.email}`);
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
				teacherCode: values.teacherCode,
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

	const columns = [
		{
			title: 'Mã',
			dataIndex: 'code',
			key: 'code',
			width: 120,
			sorter: (a: any, b: any) => (a.code || '').localeCompare(b.code || ''),
		},
		{
			title: 'Tên người dùng',
			dataIndex: 'fullName',
			key: 'fullName',
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
			width: 200,
			sorter: (a: any, b: any) => (a.email || '').localeCompare(b.email || ''),
		},
		{
			title: 'Số điện thoại',
			dataIndex: 'soDienThoai',
			key: 'soDienThoai',
			render: (text: string) => text ? (
				<Space>
					<PhoneOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
					{text}
				</Space>
			) : '---',
		},
		{
			title: 'Vai trò',
			dataIndex: 'role',
			key: 'role',
			filters: [
				{ text: 'Admin', value: 'admin' },
				{ text: 'Student', value: 'student' },
				{ text: 'Teacher', value: 'teacher' },
			],
			onFilter: (value: any, record: any) => record.role === value,
			render: (role: string) => (
				<Tag color={role === 'admin' ? 'volcano' : 'blue'} style={{ borderRadius: '4px' }}>
					{(role || 'student').toUpperCase()}
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
			align: 'center' as const,
			render: (isActive: boolean, record: any) => (
				<Tooltip title={isActive ? "Đang hoạt động" : "Bị khóa"}>
					<Switch checked={isActive} onChange={(checked) => handleStatusChange(checked, record)} size="small" />
				</Tooltip>
			),
		},
		{
			title: 'Thao tác',
			key: 'action',
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Space size="middle">
					<Tooltip title="Xem chi tiết">
						<Button 
							type="text" 
							icon={<EyeOutlined style={{ color: '#0074cc' }} />} 
							onClick={() => showUserDetail(record)} 
						/>
					</Tooltip>
					<Dropdown
						overlay={
							<Menu>
								<Menu.SubMenu key="role-sub" title="Đổi vai trò" icon={<EditOutlined style={{ color: '#faad14' }} />}>
									<Menu.Item key="role-admin" disabled={record.role === 'admin'} onClick={() => handleRoleChange(record, 'admin')}>Admin</Menu.Item>
									<Menu.Item key="role-teacher" disabled={record.role === 'teacher'} onClick={() => handleRoleChange(record, 'teacher')}>Teacher</Menu.Item>
									<Menu.Item key="role-student" disabled={record.role === 'student'} onClick={() => handleRoleChange(record, 'student')}>Student</Menu.Item>
								</Menu.SubMenu>
								<Menu.Divider />
								<Menu.Item key="delete" danger icon={<DeleteOutlined />} onClick={(e) => e.domEvent.stopPropagation()}>
									<Popconfirm 
										title={`Xóa người dùng ${record.fullName || record.email || 'này'}?`} 
										onConfirm={async () => { await deleteModel(record._id); refreshData(); }}
									>
										<span style={{ display: 'block', width: '100%' }}>Xóa người dùng</span>
									</Popconfirm>
								</Menu.Item>
							</Menu>
						}
						trigger={['hover']}
					>
						<Tooltip title="Thao tác khác">
							<Button type="text" icon={<MenuOutlined />} />
						</Tooltip>
					</Dropdown>
				</Space>
			),
		},
	];

	const filteredData = danhSach?.filter((u: any) =>
		(u.fullName || '').toLowerCase().includes(searchText.toLowerCase()) ||
		u.email?.toLowerCase().includes(searchText.toLowerCase()) ||
		u.code?.toLowerCase().includes(searchText.toLowerCase())
	) || [];

	return (
		<div style={{ padding: '24px' }}>
			<Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
					<Title level={3} style={{ margin: 0, fontWeight: 400 }}>Người dùng</Title>
					<Space>
						<Input
							placeholder="Tìm tên hoặc email..."
							prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							style={{ width: 300, borderRadius: '4px' }}
							allowClear
						/>
						<Button 
							type="primary" 
							icon={<PlusOutlined />} 
							onClick={() => setIsCreateModalVisible(true)}
							style={{ borderRadius: '4px', backgroundColor: '#0095ff', borderColor: '#0095ff' }}
						>
							Thêm mới
						</Button>
					</Space>
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
							<Statistic title="Admin/Teacher" value={adminCount} />
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
						total: total,
						showSizeChanger: false,
						showQuickJumper: true,
						locale: { jump_to: 'Đến trang bao nhiêu', page: '' },
						showTotal: (total) => `Tổng cộng ${total} người dùng`,
						onChange: (p, s) => {
							setPage(p);
							setLimit(s);
							getModel(undefined, undefined, undefined, p, s);
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
					<Form.Item name="code" label="Mã người dùng" rules={[{ required: true, message: 'Vui lòng nhập mã người dùng!' }]}>
						<Input placeholder="SV001 hoặc GV001" />
					</Form.Item>
					<Form.Item name="faculty" label="Khoa">
						<Input placeholder="Khoa/Đơn vị" />
					</Form.Item>
					<Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role} noStyle>
						{({ getFieldValue }) =>
							getFieldValue('role') === 'teacher' ? (
								<Form.Item
									name="teacherCode"
									label="Mã xác thực giáo viên"
									rules={[{ required: true, message: 'Vui lòng nhập mã xác thực giáo viên!' }]}
								>
									<Input.Password placeholder="Mã xác thực giáo viên" />
								</Form.Item>
							) : null
						}
					</Form.Item>
					<Form.Item name="bio" label="Giới thiệu">
						<Input.TextArea placeholder="Một dòng giới thiệu ngắn" rows={3} />
					</Form.Item>
					<Form.Item name="role" label="Vai trò" initialValue="student">
						<Select options={[
							{ label: 'Admin', value: 'admin' },
							{ label: 'Teacher', value: 'teacher' },
							{ label: 'Student', value: 'student' },
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
					<Descriptions.Item label="Mã người dùng">{currentUserDetail?.code || '---'}</Descriptions.Item>
					<Descriptions.Item label="Vai trò">{(currentUserDetail?.role || 'student').toUpperCase()}</Descriptions.Item>
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