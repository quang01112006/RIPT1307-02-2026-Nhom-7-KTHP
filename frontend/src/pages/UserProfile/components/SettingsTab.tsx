import UploadFile from '@/components/Upload/UploadFile';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import {
	DeleteOutlined,
	EditOutlined,
	FacebookOutlined,
	GithubOutlined,
	LinkedinOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { Button, Card, Checkbox, Col, Form, Input, Menu, Row, Select, Typography } from 'antd';
import { useState } from 'react';
import { history, useModel } from 'umi';

const { Title, Text } = Typography;

interface Props {
	user: any;
}

const SettingsTab = ({ user }: Props) => {
	const [form] = Form.useForm();
	const [selectedMenu, setSelectedMenu] = useState('edit-profile');
	const [checkedDelete, setCheckedDelete] = useState(false);
	const { getByIdModel, putModel, deleteModel, formSubmiting } = useModel('users');
	const { setInitialState } = useModel('@@initialState');

	const handleDeleteProfile = async () => {
		try {
			await deleteModel(user._id);
			localStorage.removeItem('token');
			setInitialState((s: any) => ({ ...s, currentUser: undefined }));
			history.replace('/user/login');
		} catch (error) {
			console.error(error);
		}
	};

	const onFinish = async (values: any) => {
		try {
			let avatarUrl = undefined;
			const originFile = values.avatar?.fileList?.[0]?.originFileObj;
			if (originFile) {
				avatarUrl = await uploadToCloudinary(originFile);
			}

			const payload = {
				...values,
				avatar: avatarUrl ?? user.avatar,
				socials: {
					github: values.github,
					facebook: values.facebook,
					linkedin: values.linkedin,
				},
			};
			await putModel(user._id, payload, () => getByIdModel(user._id), undefined, false, 'Cập nhật hồ sơ thành công!');
		} catch (error) {
			console.error('Lỗi khi cập nhật:', error);
		}
	};

	const menuItems = [
		{
			type: 'group',
			label: 'THÔNG TIN CÁ NHÂN',
			children: [
				{ key: 'edit-profile', icon: <EditOutlined />, label: 'Chỉnh sửa hồ sơ' },
				{ key: 'delete-profile', icon: <DeleteOutlined />, label: 'Xóa tài khoản', danger: true },
			],
		},
		{
			type: 'group',
			label: 'CÀI ĐẶT KHÁC',
			children: [{ key: 'account', icon: <SettingOutlined />, label: 'Tùy chọn hiển thị' }],
		},
	];

	return (
		<div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', paddingTop: 16 }}>
			{/* Sidebar menu */}
			<div style={{ flex: '0 0 250px' }}>
				<Menu
					mode='inline'
					selectedKeys={[selectedMenu]}
					onClick={(e) => setSelectedMenu(e.key)}
					items={menuItems as any}
					style={{ borderRight: 'none', background: 'transparent' }}
				/>
			</div>

			{/* Content */}
			<div style={{ flex: '1 1 auto', maxWidth: 800 }}>
				{selectedMenu === 'edit-profile' && (
					<div>
						<Title
							level={3}
							style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 24, marginTop: 0 }}
						>
							Chỉnh sửa hồ sơ
						</Title>

						<Title level={5} style={{ marginBottom: 16 }}>
							Thông tin công khai
						</Title>
						<Card
							bordered={false}
							style={{
								background: '#fff',
								borderRadius: 8,
								border: '1px solid #e8e8e8',
								boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
							}}
						>
							<Form
								form={form}
								layout='vertical'
								initialValues={{
									avatar: user.avatar,
									fullName: user.fullName,
									bio: user.bio,
									faculty: user.faculty,
									skills: user.skills,
									github: user.socials?.github,
									facebook: user.socials?.facebook,
									linkedin: user.socials?.linkedin,
								}}
								onFinish={onFinish}
							>
								<div style={{ marginBottom: 32 }}>
									<Text strong style={{ display: 'block', marginBottom: 12 }}>
										Ảnh đại diện
									</Text>
									<Form.Item name='avatar'>
										<UploadFile isAvatar resize />
									</Form.Item>
								</div>

								<Form.Item
									label={<b>Tên hiển thị</b>}
									name='fullName'
									rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}
								>
									<Input size='large' />
								</Form.Item>

								<Form.Item label={<b>Khoa / Viện</b>} name='faculty'>
									<Input size='large' placeholder='Ví dụ: Khoa Công nghệ thông tin 1' />
								</Form.Item>

								<Form.Item label={<b>Giới thiệu bản thân (Bio)</b>} name='bio' extra='Một câu ngắn gọn mô tả về bạn.'>
									<Input size='large' placeholder='Ví dụ: Fullstack Developer' />
								</Form.Item>

								<Form.Item label={<b>Kỹ năng / Công nghệ</b>} name='skills' extra='Nhấn Enter để thêm kỹ năng mới.'>
									<Select
										mode='tags'
										size='large'
										placeholder='Ví dụ: React, Node.js, Java'
										style={{ width: '100%' }}
									/>
								</Form.Item>

								<Title level={5} style={{ marginTop: 40, marginBottom: 16 }}>
									Mạng xã hội (Links)
								</Title>

								<Card bordered size='small' style={{ borderRadius: 8, borderColor: '#d9d9d9' }}>
									<Row gutter={16}>
										<Col span={8}>
											<Form.Item label={<b>Link Facebook</b>} name='facebook' style={{ marginBottom: 0 }}>
												<Input size='large' prefix={<FacebookOutlined style={{ color: '#1877f2' }} />} />
											</Form.Item>
										</Col>
										<Col span={8}>
											<Form.Item label={<b>Link LinkedIn</b>} name='linkedin' style={{ marginBottom: 0 }}>
												<Input size='large' prefix={<LinkedinOutlined style={{ color: '#0a66c2' }} />} />
											</Form.Item>
										</Col>
										<Col span={8}>
											<Form.Item label={<b>Link GitHub</b>} name='github' style={{ marginBottom: 0 }}>
												<Input size='large' prefix={<GithubOutlined style={{ color: '#333' }} />} />
											</Form.Item>
										</Col>
									</Row>
								</Card>

								<Form.Item style={{ marginTop: 40, marginBottom: 0 }}>
									<Button type='primary' htmlType='submit' size='large' style={{ width: 200 }} loading={formSubmiting}>
										Lưu thay đổi
									</Button>
								</Form.Item>
							</Form>
						</Card>
					</div>
				)}

				{selectedMenu === 'delete-profile' && (
					<div>
						<Title
							level={3}
							style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 24, marginTop: 0 }}
							type='danger'
						>
							Xóa tài khoản
						</Title>
						<Text style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
							Trước khi xác nhận xóa tài khoản, vui lòng đọc kỹ các hệ quả của hành động này:
						</Text>
						<ul style={{ fontSize: 15, lineHeight: '1.8', marginBottom: 24, color: '#555' }}>
							<li>
								<b>Việc xóa tài khoản là vĩnh viễn và không thể hoàn tác.</b> Bạn sẽ không thể khôi phục lại thông tin
								hồ sơ hay dữ liệu cá nhân nếu thay đổi ý định sau này.
							</li>
							<li>
								<b>Các bài đăng của bạn sẽ không bị xóa.</b> Tuy nhiên, các câu hỏi và câu trả lời của bạn sẽ bị hủy
								liên kết và chuyển sang trạng thái ẩn danh (tác giả sẽ hiển thị là "Người dùng ẩn danh"). Hệ thống sẽ
								không ghi nhận quyền tác giả của bạn ngay cả khi bạn lập tài khoản mới.
							</li>
							<li>
								<b>Hành động này chỉ áp dụng tại nền tảng EduStack.</b> Việc xóa tài khoản sẽ lập tức hủy bỏ mọi phiên
								đăng nhập đang hoạt động của bạn.
							</li>
						</ul>

						<div style={{ background: '#fff1f0', border: '1px solid #ffa39e', padding: 24, borderRadius: 8 }}>
							<Checkbox onChange={(e) => setCheckedDelete(e.target.checked)}>
								<b>
									Tôi đã đọc kỹ các thông tin nêu trên và hiểu rõ hệ quả. Tôi xác nhận muốn tiến hành xóa tài khoản của
									mình.
								</b>
							</Checkbox>

							<div style={{ marginTop: 24 }}>
								<Button danger type='primary' disabled={!checkedDelete} size='large' onClick={handleDeleteProfile}>
									Xóa tài khoản vĩnh viễn
								</Button>
							</div>
						</div>
					</div>
				)}

				{selectedMenu !== 'edit-profile' && selectedMenu !== 'delete-profile' && (
					<div>
						<Title
							level={3}
							style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 24, marginTop: 0 }}
						>
							Đang phát triển
						</Title>
						<Text type='secondary'>Tính năng này đang được cập nhật...</Text>
					</div>
				)}
			</div>
		</div>
	);
};

export default SettingsTab;
