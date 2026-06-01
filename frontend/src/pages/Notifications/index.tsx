import React, { useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  List,
  Row,
  Col,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  MessageOutlined,
  ReadOutlined,
  UndoOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const typeMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  REPLY: {
    label: 'Trả lời',
    color: 'blue',
    icon: <MessageOutlined />,
  },
  UPVOTE: {
    label: 'Thích',
    color: 'volcano',
    icon: <CheckCircleOutlined />,
  },
  NEW_POST: {
    label: 'Bài mới',
    color: 'purple',
    icon: <BellOutlined />,
  },
  ACCEPTED: {
    label: 'Chấp nhận',
    color: 'green',
    icon: <CheckCircleOutlined />,
  },
  SYSTEM: {
    label: 'Hệ thống',
    color: 'default',
    icon: <BellOutlined />,
  },
};

const formatTime = (value?: string | number) => {
  if (!value) return '';
  const time = new Date(value).getTime();
  const diff = Math.max(0, Date.now() - time) / 1000;
  if (diff < 60) return `${Math.floor(diff)} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(value).toLocaleDateString('vi-VN');
};

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('unread');
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAsUnread,
    deleteModel,
    deleteAllModel,
    markAllAsReadModel,
    fetchNotifications,
  } = useModel('notifications');

  const filteredNotifications = useMemo(
    () =>
      activeTab === 'unread'
        ? notifications.filter((item: any) => !item.isRead)
        : notifications,
    [activeTab, notifications],
  );

  const openNotification = (item: any) => {
    if (item.link) {
      history.push(item.link);
    }
  };

  const headerButtonStyle = {
    borderRadius: '6px',
    height: '42px',
    padding: '0 24px',
    fontSize: '15px',
    fontWeight: 600,
  };

  const actionButtonStyle = {
    borderRadius: '6px',
    height: '38px',
    padding: '0 20px',
    fontSize: '14px',
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 20px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <div>
            <Title style={{ margin: 0 }} level={2}>Thông báo cộng đồng</Title>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Xem tất cả thông báo của bạn: lượt thích, trả lời, chấp nhận và tin hệ thống
            </Text>
          </div>
          <Space wrap>
            <Button key="refresh" type="default" style={headerButtonStyle} onClick={() => fetchNotifications()}>
              Làm mới
            </Button>
            <Button key="markAll" type="primary" style={headerButtonStyle} onClick={markAllAsReadModel} disabled={!notifications.length}>
              Đánh dấu tất cả đã đọc
            </Button>
            <Button key="deleteAll" danger style={headerButtonStyle} onClick={deleteAllModel} disabled={!notifications.length}>
              Xóa tất cả
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            bordered
            bodyStyle={{ padding: 20 }}
            style={{ borderRadius: 16, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 16 }}>
                    Tổng quan thông báo
                  </Text>
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary">
                      Bạn có{' '}
                      <Text strong>{unreadCount ?? 0}</Text>{' '}
                      thông báo chưa đọc và{' '}
                      <Text strong>{notifications?.length ?? 0}</Text>{' '}
                      thông báo tổng.
                    </Text>
                  </div>
                </div>
                <Badge count={unreadCount} showZero>
                  <BellOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                </Badge>
              </div>

              <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
                <Tabs.TabPane tab={`Chưa đọc (${notifications.filter((item: any) => !item.isRead).length})`} key="unread" />
                <Tabs.TabPane tab={`Tất cả (${notifications.length})`} key="all" />
              </Tabs>

              <div>
                <List
                  loading={loading}
                  dataSource={filteredNotifications}
                  locale={{ emptyText: <Empty description="Bạn chưa có thông báo nào" /> }}
                  renderItem={(item: any) => {
                    const typeInfo = typeMap[item.type] || typeMap.SYSTEM;
                    return (
                      <List.Item
                        style={{
                          borderRadius: 14,
                          padding: 18,
                          marginBottom: 14,
                          background: item.isRead ? '#fafafa' : '#ffffff',
                          boxShadow: item.isRead
                            ? 'none'
                            : '0 8px 20px rgba(24, 144, 255, 0.08)',
                        }}
                        actions={[
                          item.link ? (
                            <Button
                              key="open"
                              type="default"
                              style={actionButtonStyle}
                              icon={<EyeOutlined />}
                              onClick={() => openNotification(item)}
                            >
                              Xem
                            </Button>
                          ) : null,
                          item.isRead ? (
                            <Button
                              key="unread"
                              type="default"
                              style={actionButtonStyle}
                              icon={<UndoOutlined />}
                              onClick={() => markAsUnread(item._id)}
                            >
                              Đánh dấu chưa đọc
                            </Button>
                          ) : (
                            <Button
                              key="read"
                              type="default"
                              style={actionButtonStyle}
                              icon={<ReadOutlined />}
                              onClick={() => markAsRead(item._id)}
                            >
                              Đã đọc
                            </Button>
                          ),
                          <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => deleteModel(item._id)}>
                            Xóa
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar size={48} style={{ backgroundColor: typeInfo.color }}>
                              {typeInfo.icon}
                            </Avatar>
                          }
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Text strong>{item.title}</Text>
                              <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                              {!item.isRead && <Tag color="processing">Mới</Tag>}
                            </div>
                          }
                          description={
                            <div>
                              <Paragraph ellipsis={{ rows: 2, expandable: false, tooltip: item.message }} style={{ marginBottom: 8 }}>
                                {item.message}
                              </Paragraph>
                              <Space size={12}>
                                <Text type="secondary">{formatTime(item.createdAt)}</Text>
                                <Text type="secondary">Người gửi: {item.sender?.fullName || item.sender?.email || 'Hệ thống'}</Text>
                                {item.link && <Text type="secondary">Liên kết: {item.link}</Text>}
                              </Space>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            bordered
            style={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)' }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: 18 }}>
                  Chuỗi thông báo thông minh
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    Các thông báo quan trọng được hiển thị tại đây để bạn không bỏ lỡ hoạt động trong cộng đồng.
                  </Text>
                </div>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Statistic title="Chưa đọc" value={unreadCount ?? 0} valueStyle={{ color: '#fa8c16' }} />
                </Col>
                <Col span={24}>
                  <Statistic title="Tổng thông báo" value={notifications.length} />
                </Col>
              </Row>

              <div>
                <Text strong>Gợi ý sử dụng</Text>
                <ul style={{ paddingLeft: 20, marginTop: 10, color: '#6b7280' }}>
                  <li>Nhấn "Xem" để vào chi tiết câu hỏi, bình luận hoặc bài viết liên quan.</li>
                  <li>Đánh dấu là đã đọc để sắp xếp thông báo dễ dàng hơn.</li>
                  <li>Xóa thông báo cũ nếu không còn cần thiết.</li>
                </ul>
              </div>

              <Button type="default" onClick={() => history.push('/leaderboard')} block>
                Khám phá bảng xếp hạng cộng đồng
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Notifications;
