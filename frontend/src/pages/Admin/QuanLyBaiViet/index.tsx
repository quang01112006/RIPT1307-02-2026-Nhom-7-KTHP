import {
	DeleteOutlined,
	EyeOutlined,
	MenuOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Dropdown,
	Input,
	Menu,
	Popconfirm,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getTagColor } from '@/utils/utils';

const { Text, Title } = Typography;

const QuanLyBaiViet: React.FC = () => {
	const { danhSach, getModel, deleteModel, loading, page, limit, total, setPage, setLimit } = useModel('baiviet');
	const [searchText, setSearchText] = useState<string>('');

	useEffect(() => {
		getModel();
	}, []);

	const refreshData = () => {
		getModel();
	};

	const columns = [
		{
			title: 'Tiêu đề',
			dataIndex: 'title',
			key: 'title',
			width: '30%',
			sorter: (a: any, b: any) => (a.title || '').localeCompare(b.title || ''),
			render: (text: string, record: any) => (
				<Tooltip title="Xem bài viết">
					<a href={`/question/${record._id}`} target="_blank" rel="noreferrer" style={{ fontWeight: 500, color: '#0074cc' }}>
						{text}
					</a>
				</Tooltip>
			),
		},
		{
			title: 'Tác giả',
			dataIndex: ['author', 'fullName'],
			key: 'author',
			sorter: (a: any, b: any) => (a.author?.fullName || '').localeCompare(b.author?.fullName || ''),
			render: (fullName: string) => <Text style={{ color: '#0074cc' }}>{fullName || 'Ẩn danh'}</Text>,
		},
		{
			title: 'Thẻ',
			dataIndex: 'tags',
			key: 'tags',
			render: (tags: string[]) => (
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
					{tags?.map((tag) => (
						<Tag color={getTagColor(tag)} key={tag} style={{ borderRadius: '4px', margin: 0, fontSize: 11 }}>
							{tag}
						</Tag>
					))}
				</div>
			),
		},
		{
			title: 'Lượt xem',
			dataIndex: 'views',
			key: 'views',
			width: 110,
			align: 'center' as const,
			sorter: (a: any, b: any) => (a.views || 0) - (b.views || 0),
			render: (views: number) => <Text strong>{views || 0}</Text>,
		},
		{
			title: 'Ngày đăng',
			dataIndex: 'createdAt',
			key: 'createdAt',
			width: 130,
			sorter: (a: any, b: any) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
			render: (date: string) => (
				<Tooltip title={moment(date).format('HH:mm:ss DD/MM/YYYY')}>
					{moment(date).format('DD/MM/YYYY')}
				</Tooltip>
			),
		},
		{
			title: 'Giải quyết',
			dataIndex: 'isResolved',
			key: 'isResolved',
			width: 120,
			filters: [
				{ text: 'Đã giải quyết', value: true },
				{ text: 'Chưa giải quyết', value: false },
			],
			onFilter: (value: any, record: any) => record.isResolved === value,
			render: (resolved: boolean) => (
				<Tag color={resolved ? 'green' : 'default'} style={{ borderRadius: '4px' }}>
					{resolved ? 'Đã giải quyết' : 'Chưa giải quyết'}
				</Tag>
			),
		},
		{
			title: 'Thao tác',
			key: 'action',
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Space size="middle">
					<Tooltip title="Xem bài viết">
						<Button
							type="text"
							icon={<EyeOutlined />}
							onClick={() => window.open(`/question/${record._id}`, '_blank')}
						/>
					</Tooltip>
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item key="delete" danger icon={<DeleteOutlined />}>
									<Popconfirm
										title="Xóa vĩnh viễn bài viết này?"
										onConfirm={async () => {
										await deleteModel(record._id);
										refreshData();
									}}
									>
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

	const filteredData = React.useMemo(() => {
		if (!searchText) return danhSach;
		const lowerSearch = searchText.toLowerCase();
		return danhSach?.filter((p: any) => p.title?.toLowerCase().includes(lowerSearch));
	}, [danhSach, searchText]);

	return (
		<div style={{ padding: '24px' }}>
			<Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
					<Title level={4} style={{ margin: 0 }}>Quản lý bài viết</Title>
					<Input
						placeholder="Tìm kiếm theo tiêu đề bài viết..."
						prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						style={{ width: 400, borderRadius: '4px' }}
						allowClear
					/>
				</div>

				<Table
					columns={columns}
					dataSource={filteredData || []}
					loading={loading}
					rowKey="_id"
					pagination={{
						current: page,
						pageSize: limit,
						total: total,
						showSizeChanger: false,
						showQuickJumper: true,
						locale: { jump_to: 'trang', page: '' },
						showTotal: (total) => `Tổng cộng ${total} bài viết`,
						onChange: (p, s) => {
							setPage(p);
							setLimit(s);
							getModel(undefined, undefined, undefined, p, s);
						},
					}}
					size="middle"
				/>
			</Card>
		</div>
	);
};

export default QuanLyBaiViet;