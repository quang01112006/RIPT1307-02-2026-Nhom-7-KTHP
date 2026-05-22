import { useEffect, useMemo, useState, FC } from 'react';
import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import {
  Table,
  Card,
  Typography,
  Input,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  message,
  Tag,
  Switch,
} from 'antd';
import { DeleteOutlined, EyeInvisibleOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';

interface PostItem {
  _id: string;
  title: string;
  author?: { fullName?: string; email?: string; code?: string; role?: string };
  tags?: string[];
  views?: number;
  isResolved?: boolean;
  isHidden?: boolean;
  createdAt?: string;
}

const QuanLyBaiViet: FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showHidden, setShowHidden] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ip3}/posts/page`, {
        params: { limit: 200, includeHidden: 'true' },
      });
      const result = response.data?.data?.result ?? [];
      setPosts(result);
    } catch {
      message.error('Không tải được danh sách bài viết.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (!showHidden && post.isHidden) return false;
        const lowerText = searchText.trim().toLowerCase();
        if (!lowerText) return true;
        return [post.title, post.author?.fullName || '', post.tags?.join(' ') || '']
          .join(' ')
          .toLowerCase()
          .includes(lowerText);
      })
      .sort((a, b) => (new Date(b.createdAt || '').getTime() || 0) - (new Date(a.createdAt || '').getTime() || 0));
  }, [posts, searchText, showHidden]);

  const toggleHidden = async (record: PostItem) => {
    try {
      await axios.put(`${ip3}/posts/${record._id}`, { isHidden: !record.isHidden });
      setPosts((prev) =>
        prev.map((item) => (item._id === record._id ? { ...item, isHidden: !item.isHidden } : item)),
      );
      message.success(`${record.isHidden ? 'Hiện' : 'Ẩn'} bài viết thành công.`);
    } catch {
      message.error('Không thay đổi được trạng thái ẩn bài viết.');
    }
  };

  const deletePost = async (id: string) => {
    try {
      await axios.delete(`${ip3}/posts/${id}`);
      setPosts((prev) => prev.filter((item) => item._id !== id));
      message.success('Đã xóa bài viết.');
    } catch {
      message.error('Xóa bài viết thất bại.');
    }
  };

  const columns: ColumnsType<PostItem> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
      width: 280,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tác giả',
      dataIndex: ['author', 'fullName'],
      key: 'author',
      width: 220,
      render: (_, record) => (
        <div>
          <div>{record.author?.fullName || 'Chưa xác định'}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.author?.code || record.author?.email || ''}</div>
        </div>
      ),
    },
    {
      title: 'Chủ đề',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: any) =>
        tags?.map((tag: any) => (
          <Tag key={tag} color='blue' style={{ marginBottom: 4 }}>
            {tag}
          </Tag>
        )),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
      width: 110,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_, record) => (
        <Space direction='vertical'>
          <Tag color={record.isHidden ? 'default' : record.isResolved ? 'green' : 'blue'}>
            {record.isHidden ? 'Đã ẩn' : record.isResolved ? 'Đã giải quyết' : 'Đang mở'}
          </Tag>
          {record.isHidden ? <Tag color='orange'>Ẩn</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => (new Date(a.createdAt || '').getTime() || 0) - (new Date(b.createdAt || '').getTime() || 0),
      render: (date) => (date ? new Date(date).toLocaleString() : '—'),
      width: 180,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title={record.isHidden ? 'Hiện bài viết' : 'Ẩn bài viết'}>
            <Popconfirm
              title={`Bạn có muốn ${record.isHidden ? 'hiện' : 'ẩn'} bài viết này?`}
              onConfirm={() => toggleHidden(record)}
              okText='Xác nhận'
              cancelText='Hủy'
            >
              <Button type='text' icon={<EyeInvisibleOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title='Xóa bài viết'>
            <Popconfirm
              title='Bạn có chắc muốn xóa bài viết này?'
              onConfirm={() => deletePost(record._id)}
              okText='Xóa'
              cancelText='Hủy'
            >
              <Button type='text' danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Quản lý bài viết
            </Typography.Title>
            <Typography.Text type='secondary'>Nơi duyệt, ẩn và xóa các bài viết học thuật trên diễn đàn Q&A.</Typography.Text>
          </div>
          <Space>
            <span style={{ marginRight: 8 }}>Hiện cả bài viết ẩn</span>
            <Switch checked={showHidden} onChange={setShowHidden} />
          </Space>
        </div>

        <Input.Search
          placeholder='Tìm kiếm tiêu đề, tác giả hoặc chủ đề'
          allowClear
          enterButton={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 520, width: '100%' }}
        />

        <Table
          rowKey='_id'
          columns={columns}
          dataSource={filteredPosts}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          scroll={{ x: 1160 }}
        />
      </Space>
    </Card>
  );
};

export default QuanLyBaiViet;
