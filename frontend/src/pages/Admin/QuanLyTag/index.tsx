import { DeleteOutlined, EditOutlined, MenuOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Form, Input, Menu, Modal, Popconfirm, Space, Table, Tooltip, Typography, message, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getTagColor } from '@/utils/utils';

const { Title, Text } = Typography;

const QuanLyTag: React.FC = () => {
	const { danhSach, getModel, deleteModel, postModel, putModel, loading, page, limit, total, setPage, setLimit } = useModel('tags');
	const [form] = Form.useForm();
	const [searchText, setSearchText] = useState<string>('');
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	useEffect(() => {
		getModel();
	}, []);

	const handleAddOrEdit = async (values: any) => {
		try {
			if (editingId) {
				await putModel(editingId, values, undefined, false, false, 'Cập nhật thẻ thành công');
			} else {
				await postModel(values, undefined, false, 'Thêm thẻ mới thành công');
			}
			setIsModalVisible(false);
			form.resetFields();
			setEditingId(null);
			getModel();
		} catch (error) {
			message.error('Thao tác thất bại');
		}
	};

	const showEditModal = (record: any) => {
		setEditingId(record._id);
		form.setFieldsValue(record);
		setIsModalVisible(true);
	};

	const columns = [
		{
			title: 'Tên thẻ',
			dataIndex: 'name',
			key: 'name',
			width: '20%',
			sorter: (a: any, b: any) => a.name.localeCompare(b.name),
			render: (name: string) => (
				<Tag color={getTagColor(name)} style={{ borderRadius: '4px', padding: '2px 8px', fontSize: '13px' }}>
					{name}
				</Tag>
			),
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			ellipsis: true,
			render: (text: string) => <Text type="secondary">{text || 'Chưa có mô tả'}</Text>
		},
		{
			title: 'Số bài viết',
			dataIndex: 'postCount',
			key: 'postCount',
			width: 150,
			align: 'center' as const,
			sorter: (a: any, b: any) => (a.postCount || 0) - (b.postCount || 0),
			render: (count: number) => <Text strong>{count || 0}</Text>,
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 120,
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Space>
					<Tooltip title="Chỉnh sửa">
						<Button type="text" icon={<EditOutlined style={{ color: '#faad14' }} />} onClick={() => showEditModal(record)} />
					</Tooltip>
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item key="delete" danger icon={<DeleteOutlined />}>
									<Popconfirm title="Xóa thẻ này?" onConfirm={async () => { await deleteModel(record._id); getModel(); }}>
										<span>Xóa vĩnh viễn</span>
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

	return (
		<div style={{ padding: '24px' }}>
			<Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
					<Title level={3} style={{ margin: 0, fontWeight: 400 }}>Thẻ</Title>
					<Space>
						<Input
							placeholder="Tìm thẻ..."
							prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							style={{ width: 300, borderRadius: '4px' }}
							allowClear
						/>
						<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setIsModalVisible(true); }} style={{ borderRadius: '4px', backgroundColor: '#0095ff' }}>
							Thêm thẻ mới
						</Button>
					</Space>
				</div>

				<Table
					columns={columns}
					dataSource={danhSach?.filter((t: any) =>
					t.name?.toLowerCase().includes(searchText.toLowerCase()) ||
					t.description?.toLowerCase().includes(searchText.toLowerCase())
				) || []}
					loading={loading}
					rowKey="_id"
					pagination={{
						current: page,
						pageSize: limit,
						total: total,
						showSizeChanger: false,
						showQuickJumper: true,
						locale: { jump_to: 'trang', page: '' },
						showTotal: (total) => `Tổng cộng ${total} thẻ`,
						onChange: (p, s) => {
							setPage(p);
							setLimit(s);
							getModel(undefined, undefined, undefined, p, s);
						},
					}}
				/>
			</Card>

			<Modal
				title={editingId ? "Chỉnh sửa thẻ" : "Thêm thẻ mới"}
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				onOk={() => form.submit()}
				okText="Lưu"
				cancelText="Hủy"
			>
				<Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
					<Form.Item name="name" label="Tên thẻ" rules={[{ required: true, message: 'Vui lòng nhập tên thẻ!' }]}>
						<Input placeholder="Ví dụ: reactjs" />
					</Form.Item>
					<Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
						<Input.TextArea rows={4} placeholder="Mô tả ngắn gọn về công nghệ/chủ đề này..." />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default QuanLyTag;