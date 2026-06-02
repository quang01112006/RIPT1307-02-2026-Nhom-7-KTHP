import React, { useEffect, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Dropdown,
  Empty,
  Menu,
  Pagination,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  LikeOutlined,
  MessageOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

const typeMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  REPLY: {
    label: 'Trả lời',
    color: 'blue',
    icon: <MessageOutlined />,
  },
  UPVOTE: {
    label: 'Thích',
    color: '#eb2f96',
    icon: <LikeOutlined />,
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

const getIconByType = (type: string) => {
  switch (type) {
    case 'UPVOTE':
      return <LikeOutlined style={{ color: '#eb2f96' }} />;
    case 'REPLY':
      return <MessageOutlined style={{ color: '#1890ff' }} />;
    case 'ACCEPTED':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    default:
      return <BellOutlined style={{ color: '#1890ff' }} />;
  }
};

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('unread');
  const [page, setPage] = useState<number>(1);
  const pageSize = 8;
  const {
    notifications,
    loading,
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

  const paginatedNotifications = useMemo(
    () =>
      filteredNotifications.slice((page - 1) * pageSize, page * pageSize),
    [filteredNotifications, page, pageSize],
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
    if (page > maxPage) {
      setPage(1);
    }
  }, [filteredNotifications, pageSize, page]);

  const openNotification = (item: any) => {
    if (!item.isRead) {
      markAsRead(item._id);
    }
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

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 20px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div>
          <Title style={{ margin: 0 }} level={2}>Thông báo cộng đồng</Title>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            Xem tất cả thông báo của bạn: lượt thích, trả lời, chấp nhận và tin hệ thống
          </Text>
        </div>
        <Space wrap>
          <Button type="default" style={headerButtonStyle} onClick={() => fetchNotifications()}>
            Làm mới
          </Button>
          <Button type="primary" style={headerButtonStyle} onClick={markAllAsReadModel} disabled={!notifications.length}>
            Đánh dấu tất cả đã đọc
          </Button>
          <Button danger style={headerButtonStyle} onClick={deleteAllModel} disabled={!notifications.length}>
            Xóa tất cả
          </Button>
        </Space>
      </div>

      <Card
        bordered
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 16, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div>
            <Text strong style={{ fontSize: '18px' }}>
              Thông báo
            </Text>
          </div>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="readAll"
                  icon={<CheckOutlined />}
                  onClick={markAllAsReadModel}
                  disabled={!notifications.length}
                >
                  Đánh dấu tất cả đã đọc
                </Menu.Item>
                <Menu.Item
                  key="deleteAll"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={deleteAllModel}
                  disabled={!notifications.length}
                >
                  Xóa tất cả thông báo
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button type="text" shape="circle" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
          <Button
            type={activeTab === 'all' ? 'primary' : 'default'}
            shape="round"
            onClick={() => setActiveTab('all')}
            style={{
              fontWeight: 600,
              border: 'none',
              backgroundColor: activeTab === 'all' ? '#e6f7ff' : 'transparent',
              color: activeTab === 'all' ? '#1890ff' : '#050505',
              boxShadow: 'none',
            }}
          >
            Tất cả ({notifications.length})
          </Button>
          <Button
            type={activeTab === 'unread' ? 'primary' : 'default'}
            shape="round"
            onClick={() => setActiveTab('unread')}
            style={{
              fontWeight: 600,
              border: 'none',
              backgroundColor: activeTab === 'unread' ? '#e6f7ff' : 'transparent',
              color: activeTab === 'unread' ? '#1890ff' : '#050505',
              boxShadow: 'none',
            }}
          >
            Chưa đọc ({notifications.filter((item: any) => !item.isRead).length})
          </Button>
        </div>

        <Divider style={{ margin: 0 }} />

        <div style={{ padding: '16px 20px' }}>
          {filteredNotifications.length === 0 ? (
            <Empty
              description={
                activeTab === 'unread'
                  ? 'Bạn không có thông báo chưa đọc'
                  : 'Bạn chưa có thông báo nào'
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Text type="secondary">Đang tải...</Text>
                </div>
              ) : (
                paginatedNotifications.map((item: any) => {
                  const typeInfo = typeMap[item.type] || typeMap.SYSTEM;
                  return (
                    <div
                      key={item._id}
                      style={{
                        borderRadius: 12,
                        padding: '16px',
                        marginBottom: '12px',
                        background: item.isRead ? '#ffffff' : '#f6f8ff',
                        boxShadow: item.isRead ? 'none' : '0 2px 8px rgba(24, 144, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '1px solid transparent',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = item.isRead ? '#fafafa' : '#eef5ff';
                        e.currentTarget.style.borderColor = '#d9e8ff';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = item.isRead ? '#ffffff' : '#f6f8ff';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = item.isRead ? 'none' : '0 2px 8px rgba(24, 144, 255, 0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <Badge
                          count={getIconByType(item.type)}
                          style={{
                            backgroundColor: '#fff',
                            boxShadow: '0 0 0 1px #d9d9d9 inset',
                            color: typeInfo.color,
                            transform: 'translate(10%, 10%)',
                          }}
                          offset={[-4, 4]}
                        >
                          <Avatar
                            size={48}
                            src={item.sender?.avatar}
                            style={{
                              backgroundColor: typeof typeInfo.color === 'string' && typeInfo.color.startsWith('#') 
                                ? typeInfo.color 
                                : '#1890ff',
                            }}
                            icon={!item.sender?.avatar && getIconByType(item.type)}
                          />
                        </Badge>

                        <div
                          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                          onClick={() => openNotification(item)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text
                              strong
                              style={{
                                fontSize: '14.5px',
                                lineHeight: '1.4',
                                fontWeight: item.isRead ? 400 : 600,
                                color: item.isRead ? '#8c8c8c' : '#000',
                              }}
                            >
                              {item.title}
                            </Text>
                            {!item.isRead && (
                              <div
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  backgroundColor: '#1890ff',
                                  flexShrink: 0,
                                  marginLeft: 8,
                                }}
                              />
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                            <Tag
                              color={typeInfo.color}
                              style={{
                                margin: 0,
                                fontSize: '12px',
                                height: 'auto',
                                padding: '2px 8px',
                              }}
                            >
                              {typeInfo.label}
                            </Tag>
                            {!item.isRead && (
                              <Tag
                                color="processing"
                                style={{
                                  margin: 0,
                                  fontSize: '12px',
                                  height: 'auto',
                                  padding: '2px 8px',
                                }}
                              >
                                Mới
                              </Tag>
                            )}
                          </div>

                          <Text
                            style={{
                              fontSize: '13.5px',
                              color: item.isRead ? '#8c8c8c' : '#595959',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              marginBottom: 8,
                            }}
                          >
                            {item.message}
                          </Text>

                          <Text
                            type="secondary"
                            style={{
                              fontSize: '12px',
                              display: 'block',
                              fontWeight: item.isRead ? 400 : 500,
                              color: item.isRead ? '#8c8c8c' : '#1890ff',
                            }}
                          >
                            {moment(item.createdAt).fromNow()}
                          </Text>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                            overlay={
                              <Menu
                                onClick={(e) => {
                                  if (e.key === 'read') markAsRead(item._id);
                                  if (e.key === 'unread') markAsUnread(item._id);
                                  if (e.key === 'delete') deleteModel(item._id);
                                }}
                              >
                                {!item.isRead ? (
                                  <Menu.Item key="read" icon={<CheckOutlined />}>
                                    Đánh dấu đã đọc
                                  </Menu.Item>
                                ) : (
                                  <Menu.Item key="unread" icon={<MessageOutlined />}>
                                    Đánh dấu chưa đọc
                                  </Menu.Item>
                                )}
                                <Menu.Item key="delete" danger icon={<DeleteOutlined />}>
                                  Xóa thông báo
                                </Menu.Item>
                              </Menu>
                            }
                            trigger={['click']}
                          >
                            <Button
                              type="text"
                              shape="circle"
                              icon={<MoreOutlined style={{ fontSize: 18 }} />}
                            />
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {filteredNotifications.length > pageSize && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 0' }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={filteredNotifications.length}
                    showQuickJumper
                    onChange={(nextPage) => {
                      setPage(nextPage);
                    }}
                    locale={{ jump_to: 'Đến trang', page: '' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
