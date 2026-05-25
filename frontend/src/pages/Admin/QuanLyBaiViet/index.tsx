import {
	DeleteOutlined,
	EyeOutlined,
	FileTextOutlined,
	MenuOutlined,
	SearchOutlined,
	TagsOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Input,
	Popover,
	Popconfirm,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { getTagColor } from '@/utils/utils';

const { Text, Title } = Typography;

const QuanLyBaiViet: React.FC = () => {
	const { danhSach, getModel, deleteModel, loading, page, limit, total, setPage, setLimit } = useModel('baiviet');
	const [searchText, setSearchText] = useState<string>('');

	useEffect(() => {
		getModel();
	}, []);

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

	const refreshData = () => {
		getModel();
	};

	const tagFilters = useMemo(() => {
		const allTags = danhSach?.flatMap((p: any) => p.tags || []) || [];
		return Array.from(new Set(allTags)).map(tag => ({ text: tag, value: tag }));
	}, [danhSach]);

	const getColumnSearchProps = (dataIndex: string | string[], title: string) => ({
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
		onFilter: (value: any, record: any) => {
			const keys = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
			const val = keys.reduce((obj, key) => obj?.[key], record);
			if (Array.isArray(val)) {
				return val.some(item => item?.toString().toLowerCase().includes(value.toLowerCase()));
			}
			return val?.toString().toLowerCase().includes(value.toLowerCase());
		},
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
			title: 'Tiêu đề',
			dataIndex: 'title',
			key: 'title',
			...getColumnSearchProps('title', 'tiêu đề'),
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
			...getColumnSearchProps(['author', 'fullName'], 'tác giả'),
			sorter: (a: any, b: any) => (a.author?.fullName || '').localeCompare(b.author?.fullName || ''),
			render: (fullName: string) => <Text style={{ color: '#0074cc' }}>{fullName || 'Ẩn danh'}</Text>,
		},
		{
			title: 'Thẻ',
			dataIndex: 'tags',
			key: 'tags',
			...getColumnSearchProps('tags', 'thẻ'),
			filters: tagFilters,
			onFilter: (value: any, record: any) => record.tags?.includes(value),
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
				<Popover
					content={
						<Space size="middle">
							<Tooltip title="Xem bài viết">
								<Button type="text" icon={<EyeOutlined style={{ color: '#0074cc' }} />} onClick={() => window.open(`/question/${record._id}`, '_blank')} />
							</Tooltip>
							<Popconfirm
								title="Xóa vĩnh viễn bài viết này?"
								onConfirm={async () => { await deleteModel(record._id); refreshData(); }}
							>
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
		return dataSource.filter((p: any) => p.title?.toLowerCase().includes(lowerSearch));
	}, [danhSach, searchText]);

	return (
		<div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
			<Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
					<div style={{ borderLeft: '5px solid #0095ff', paddingLeft: '16px' }}>
						<Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1a3353', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
							<FileTextOutlined style={{ color: '#0095ff' }} />
							Quản lý bài viết
						</Title>
						<Text type="secondary" style={{ fontSize: '13px', color: '#64748b' }}>Cấu trúc bảng hiện tại: {columns.length} cột dữ liệu</Text>
					</div>
					<Input
						placeholder="Tìm kiếm theo tiêu đề bài viết..."
						prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
						value={searchText}
						onChange={handleSearchTextChange}
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
						total: searchText ? filteredData.length : total,
						showSizeChanger: false,
						showQuickJumper: true,
						locale: { jump_to: 'Đến trang', page: '' },
						showTotal: (total) => `Tổng cộng ${total} bài viết`,
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
		</div>
	);
};

export default QuanLyBaiViet;