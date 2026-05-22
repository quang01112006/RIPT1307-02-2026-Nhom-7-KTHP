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
  Form,
  InputNumber,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';

interface TagItem {
  _id: string;
  name: string;
  description?: string;
  postCount?: number;
  createdAt?: string;
}

const QuanLyTag: FC = () => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ip3}/tags/page`);
      const result = response.data?.data?.result ?? [];
      setTags(result);
    } catch {
      message.error('Không tải được danh sách tag.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      const lowerText = searchText.trim().toLowerCase();
      if (!lowerText) return true;
      return [tag.name, tag.description || '']
        .join(' ')
        .toLowerCase()
        .includes(lowerText);
    });
  }, [tags, searchText]);

  const openEdit = (record: TagItem) => {
    setEditing(record);
    form.setFieldsValue({ name: record.name, description: record.description });
    setModalVisible(true);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const submitTag = async (values: any) => {
    try {
      if (editing) {
        await axios.put(`${ip3}/tags/${editing._id}`, values);
        message.success('Đã cập nhật tag.');
      } else {
        await axios.post(`${ip3}/tags`, values);
        message.success('Đã tạo tag mới.');
      }
      setModalVisible(false);
      loadTags();
    } catch {
      message.error('Lưu tag thất bại.');
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await axios.delete(`${ip3}/tags/${id}`);
      setTags((prev) => prev.filter((item) => item._id !== id));
      message.success('Đã xóa tag.');
    } catch {
      message.error('Xóa tag thất bại.');
    }
  };

  const columns: ColumnsType<TagItem> = [
    {
      title: 'Tên Tag',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 220,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || 'Không có mô tả',
    },
    {
      title: 'Số bài viết',
      dataIndex: 'postCount',
      key: 'postCount',
      sorter: (a, b) => (a.postCount || 0) - (b.postCount || 0),
      width: 140,
      render: (value) => <Tag color='cyan'>{value ?? 0}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size='middle'>
          <Tooltip title='Sửa tag'>
            <Button type='text' icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title='Xóa tag'>
            <Popconfirm
              title='Bạn có chắc muốn xóa tag này?'
              onConfirm={() => deleteTag(record._id)}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Quản lý Tag
            </Typography.Title>
            <Typography.Text type='secondary'>Quản lý chủ đề học thuật cho diễn đàn Q&A.</Typography.Text>
          </div>
          <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
            Thêm mới
          </Button>
        </div>

        <Input.Search
          placeholder='Tìm tên hoặc mô tả tag'
          allowClear
          enterButton={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 420, width: '100%' }}
        />

        <Table
          rowKey='_id'
          columns={columns}
          dataSource={filteredTags}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          scroll={{ x: 860 }}
        />
      </Space>

      <Modal
        visible={modalVisible}
        title={editing ? 'Cập nhật Tag' : 'Thêm Tag mới'}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText='Lưu'
        cancelText='Hủy'
      >
        <Form form={form} layout='vertical' onFinish={submitTag}>
          <Form.Item name='name' label='Tên Tag' rules={[{ required: true, message: 'Nhập tên tag' }]}> 
            <Input placeholder='Ví dụ: React, MongoDB, Lập trình hàm' />
          </Form.Item>
          <Form.Item name='description' label='Mô tả'>
            <Input.TextArea rows={4} placeholder='Mô tả ngắn gọn về chủ đề này' />
          </Form.Item>
          <Form.Item name='postCount' label='Số bài viết' rules={[{ type: 'number', min: 0 }]}> 
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default QuanLyTag;
