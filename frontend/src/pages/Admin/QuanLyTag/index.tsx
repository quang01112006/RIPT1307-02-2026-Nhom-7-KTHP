import { DeleteOutlined, EditOutlined, MenuOutlined, PlusOutlined, SearchOutlined, TagsOutlined } from '@ant-design/icons';
import { Button, Card, Popover, Form, Input, Modal, Popconfirm, Space, Table, Tooltip, Typography, message, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getTagColor } from '@/utils/utils';

const { Title, Text } = Typography;

const QuanLyTag: React.FC = () => {
	const { danhSach, getModel, deleteModel, postModel, putModel, loading, page, limit, total, setPage, setLimit } = useModel('tags');
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

	const getColumnSearchProps = (dataIndex: string, title: string) => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
			<div style={{ padding: 8 }}>
				<Input
					placeholder={`Tìm ${title}`}
					value={selectedKeys[0]}
					onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => confirm()}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => confirm()}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90 }}
					>
						Tìm
					</Button>
					<Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
						Xóa
					</Button>
				</Space>
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
			title: 'Tên thẻ',
			dataIndex: 'name',
			key: 'name',
			...getColumnSearchProps('name', 'tên thẻ'),
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
				<Popover
					content={
						<Space size="middle">
							<Tooltip title="Chỉnh sửa">
								<Button type="text" icon={<EditOutlined style={{ color: '#faad14' }} />} onClick={() => showEditModal(record)} />
							</Tooltip>
							<Popconfirm title="Xóa thẻ này?" onConfirm={async () => { await deleteModel(record._id); getModel(); }}>
								<Tooltip title="Xóa">
									<Button type="text" danger icon={<DeleteOutlined />} />
								</Tooltip>
							</Popconfirm>
						</Space>
					}
					placement="left"
					trigger="click"
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
		return dataSource.filter((t: any) =>
			t.name?.toLowerCase().includes(lowerSearch) ||
			t.description?.toLowerCase().includes(lowerSearch),
		);
	}, [danhSach, searchText]);

	return (
		<div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
			<Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
					<div style={{ borderLeft: '5px solid #0095ff', paddingLeft: '16px' }}>
						<Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1a3353', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
							<TagsOutlined style={{ color: '#0095ff' }} />
							Quản lý tag
						</Title>
						<Text type="secondary" style={{ fontSize: '13px', color: '#64748b' }}>Cấu trúc bảng hiện tại: {columns.length} cột dữ liệu</Text>
					</div>
					<Space>
						<Input
							placeholder="Tìm thẻ..."
							prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
							value={searchText}
							onChange={handleSearchTextChange}
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
						showTotal: (total) => `Tổng cộng ${total} thẻ`,
						onChange: (p, s) => {
							setPage(p);
							setLimit(s);
							if (!searchText) {
								getModel(undefined, undefined, undefined, p, s);
							}
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