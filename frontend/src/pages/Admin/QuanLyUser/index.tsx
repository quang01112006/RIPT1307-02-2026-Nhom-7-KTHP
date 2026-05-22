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
  Modal,
  Spin,
  Form,
  Select,
  Switch,
  Popconfirm,
  Tag,
  Divider,
  message,
  List,
  Dropdown,
  Menu,
} from 'antd';
import {
  EyeOutlined,
  MenuOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import type { FilterValue, SorterResult, TableCurrentDataSource, TablePaginationConfig } from 'antd/lib/table/interface';

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  code?: string;
  isActive: boolean;
  reputation: number;
  faculty?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PostSummary {
  _id: string;
  title: string;
  createdAt?: string;
}

interface CommentSummary {
  _id: string;
  content: string;
  createdAt?: string;
  post?: { title?: string };
}

const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  teacher: 'Giảng viên',
  student: 'Sinh viên',
};

const QuanLyUser: FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sorter, setSorter] = useState<SorterResult<AdminUser>>({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [recentPosts, setRecentPosts] = useState<PostSummary[]>([]);
  const [recentComments, setRecentComments] = useState<CommentSummary[]>([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ip3}/users/page`);
      const result = response.data?.data?.result ?? [];
      setUsers(result);
    } catch (error) {
      message.error('Không tải được danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const lowerText = searchText.trim().toLowerCase();
        if (!lowerText) return true;
        return [user.fullName, user.email, user.code || '']
          .join(' ')
          .toLowerCase()
          .includes(lowerText);
      })
      .filter((user) => {
        if (!roleFilters.length) return true;
        return roleFilters.includes(user.role);
      })
      .filter((user) => {
        if (!activeFilters.length) return true;
        return activeFilters.includes(user.isActive ? 'active' : 'inactive');
      });
  }, [users, searchText, roleFilters, activeFilters]);

  const sortedUsers = useMemo(() => {
    if (!sorter || !sorter.columnKey) return filteredUsers;
    const { columnKey, order } = sorter;
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const aValue = a[columnKey as keyof AdminUser] as any;
      const bValue = b[columnKey as keyof AdminUser] as any;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }
      return String(aValue || '').localeCompare(String(bValue || ''));
    });
    return order === 'ascend' ? sorted : sorted.reverse();
  }, [filteredUsers, sorter]);

  const openDetail = async (record: AdminUser) => {
    setSelectedUser(record);
    setDetailLoading(true);
    setDetailVisible(true);
    try {
      const [postsResponse, commentsResponse] = await Promise.all([
        axios.get(`${ip3}/posts/page`, {
          params: { author: record._id, limit: 5, includeHidden: 'true' },
        }),
        axios.get(`${ip3}/comments/page`, { params: { author: record._id, limit: 5 } }),
      ]);
      setRecentPosts(postsResponse.data?.data?.result ?? []);
      setRecentComments(commentsResponse.data?.data?.result ?? []);
    } catch {
      message.error('Không tải dữ liệu chi tiết người dùng.');
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleActive = async (record: AdminUser) => {
    try {
      await axios.put(`${ip3}/users/${record._id}/toggle-active`);
      setUsers((prev) =>
        prev.map((item) => (item._id === record._id ? { ...item, isActive: !item.isActive } : item)),
      );
      message.success(`Đã ${record.isActive ? 'khóa' : 'mở khóa'} tài khoản.`);
    } catch {
      message.error('Không đổi được trạng thái người dùng.');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`${ip3}/users/${id}`);
      setUsers((prev) => prev.filter((item) => item._id !== id));
      message.success('Đã xóa người dùng.');
    } catch {
      message.error('Xóa người dùng thất bại.');
    }
  };

  const changeRole = async (record: AdminUser, role: AdminUser['role']) => {
    try {
      await axios.put(`${ip3}/users/${record._id}`, { role });
      setUsers((prev) => prev.map((item) => (item._id === record._id ? { ...item, role } : item)));
      message.success(`Đã chuyển vai trò sang ${roleLabels[role]}.`);
    } catch {
      message.error('Không thay đổi được vai trò.');
    }
  };

  const handleTableChange = (
    _pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorterParam: SorterResult<AdminUser> | SorterResult<AdminUser>[],
    _extra: TableCurrentDataSource<AdminUser>,
  ) => {
    if (!Array.isArray(sorterParam)) {
      setSorter(sorterParam as SorterResult<AdminUser>);
    }

    const normalizeFilter = (filterValue: FilterValue | null) => {
      if (Array.isArray(filterValue)) return filterValue.map(String);
      if (filterValue) return [String(filterValue)];
      return [];
    };

    setRoleFilters(normalizeFilter(filters.role));
    setActiveFilters(normalizeFilter(filters.isActive));
  };

  const submitCreateUser = async (values: any) => {
    try {
      await axios.post(`${ip3}/users/register`, values);
      message.success('Đã thêm người dùng mới.');
      setCreateVisible(false);
      createForm.resetFields();
      loadUsers();
    } catch {
      message.error('Không tạo được người dùng mới.');
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      width: 220,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      width: 220,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Giảng viên', value: 'teacher' },
        { text: 'Sinh viên', value: 'student' },
      ],
      render: (role) => <Tag color={role === 'admin' ? 'red' : role === 'teacher' ? 'blue' : 'green'}>{roleLabels[role]}</Tag>,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      width: 180,
      render: (code) => code || '—',
    },
    {
      title: 'Trạng thái hoạt động',
      dataIndex: 'isActive',
      key: 'isActive',
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Đã khóa', value: 'inactive' },
      ],
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => toggleActive(record)}
          checkedChildren='Hoạt'
          unCheckedChildren='Khóa'
        />
      ),
    },
    {
      title: 'Điểm uy tín',
      dataIndex: 'reputation',
      key: 'reputation',
      sorter: true,
      width: 140,
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space size='middle'>
          <Tooltip title='Xem chi tiết'>
            <EyeOutlined onClick={() => openDetail(record)} style={{ cursor: 'pointer' }} />
          </Tooltip>
          <Dropdown
            overlay={
              <Menu
                onClick={({ key }) => {
                  if (key === 'delete') {
                    deleteUser(record._id);
                    return;
                  }
                  changeRole(record, key as AdminUser['role']);
                }}
                items={[
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: (
                      <Popconfirm
                        title='Bạn có chắc muốn xóa người dùng này?'
                        onConfirm={() => deleteUser(record._id)}
                        okText='Xóa'
                        cancelText='Hủy'
                      >
                        <span>Xóa</span>
                      </Popconfirm>
                    ),
                  },
                  { key: 'admin', label: 'Đổi thành Admin' },
                  { key: 'teacher', label: 'Đổi thành Giảng viên' },
                  { key: 'student', label: 'Đổi thành Sinh viên' },
                ]}
              />
            }
            placement='bottomRight'
            trigger={['click']}
          >
            <Tooltip title='Tác vụ khác'>
              <MenuOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Tooltip>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Quản lý người dùng
            </Typography.Title>
            <Typography.Text type='secondary'>Nơi quản trị tài khoản, vai trò và trạng thái hoạt động của cộng đồng EduStack.</Typography.Text>
          </div>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
            Thêm mới
          </Button>
        </div>

        <Input.Search
          placeholder='Tìm kiếm tên, email hoặc mã'
          allowClear
          enterButton={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 420, width: '100%' }}
        />

        <Table
          rowKey='_id'
          columns={columns}
          dataSource={sortedUsers}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          scroll={{ x: 980 }}
          onChange={handleTableChange}
        />
      </Space>

      <Modal visible={detailVisible} title='Thông tin người dùng' onCancel={() => setDetailVisible(false)} footer={null} width={760}>
        {selectedUser ? (
          <Spin spinning={detailLoading}>
            <Space direction='vertical' style={{ width: '100%' }} size='middle'>
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {selectedUser.fullName}
                </Typography.Title>
                <Typography.Text type='secondary'>{selectedUser.email}</Typography.Text>
                <div style={{ marginTop: 12 }}>
                  <Tag color='blue'>{roleLabels[selectedUser.role]}</Tag>
                  <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                    {selectedUser.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </Tag>
                  <Tag>Điểm uy tín: {selectedUser.reputation}</Tag>
                </div>
              </div>

              <Divider />

              <div>
                <Typography.Title level={5}>5 bài viết gần nhất</Typography.Title>
                <List
                  dataSource={recentPosts}
                  locale={{ emptyText: 'Chưa có bài viết' }}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.title}
                        description={item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                      />
                    </List.Item>
                  )}
                />
              </div>

              <div>
                <Typography.Title level={5}>5 câu trả lời gần nhất</Typography.Title>
                <List
                  dataSource={recentComments}
                  locale={{ emptyText: 'Chưa có câu trả lời' }}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.post?.title ? `Trả lời bài: ${item.post.title}` : 'Câu trả lời mới'}
                        description={
                          <>
                            <div>{item.content}</div>
                            <div style={{ marginTop: 8, color: '#999' }}>
                              {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                            </div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Space>
          </Spin>
        ) : null}
      </Modal>

      <Modal
        visible={createVisible}
        title='Thêm người dùng mới'
        onCancel={() => setCreateVisible(false)}
        onOk={() => createForm.submit()}
        okText='Lưu'
        cancelText='Hủy'
      >
        <Form form={createForm} layout='vertical' onFinish={submitCreateUser}>
          <Form.Item label='Họ tên' name='fullName' rules={[{ required: true, message: 'Nhập họ tên' }]}> 
            <Input placeholder='Nguyễn Văn A' />
          </Form.Item>
          <Form.Item label='Email' name='email' rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}> 
            <Input placeholder='example@edu.vn' />
          </Form.Item>
          <Form.Item label='Mã sinh viên / giảng viên' name='code'>
            <Input placeholder='B24DCCC237' />
          </Form.Item>
          <Form.Item label='Mật khẩu' name='password' rules={[{ required: true, message: 'Nhập mật khẩu', min: 6 }]}> 
            <Input.Password placeholder='Mật khẩu tối thiểu 6 ký tự' />
          </Form.Item>
          <Form.Item label='Vai trò' name='role' initialValue='student'>
            <Select>
              <Select.Option value='student'>Sinh viên</Select.Option>
              <Select.Option value='teacher'>Giảng viên</Select.Option>
              <Select.Option value='admin'>Quản trị viên</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='Khoa' name='faculty'>
            <Input placeholder='Khoa Công nghệ thông tin' />
          </Form.Item>
          <Form.Item label='Mã xác thực giảng viên' name='teacherCode'>
            <Input placeholder='Nhập mã bí mật nếu là giảng viên' />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default QuanLyUser;
