import React, { useEffect, useMemo, useState } from 'react';
import { history } from 'umi';
import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { FireOutlined, RiseOutlined, StarOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const getTimeAgo = (value?: string | number) => {
  if (!value) return '';
  const diff = Math.max(0, Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

const Leaderboard: React.FC = () => {
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchTopPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${ip3}/posts/page`, {
          params: { page, sort: 'views', limit: pageSize },
        });
        const result = response?.data?.data?.result || response?.data?.result || [];
        const totalResult = response?.data?.data?.total ?? response?.data?.total ?? 0;
        setTopPosts(result);
        setTotal(totalResult);
      } catch (error) {
        console.error('Lỗi khi lấy bảng xếp hạng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPosts();
  }, [page, pageSize]);

  const topAuthors = useMemo(() => {
    const map = new Map<string, any>();
    topPosts.forEach((post) => {
      const author = post.author || { _id: '', fullName: 'Người dùng ẩn' };
      if (!author._id) return;
      const existing = map.get(author._id) ?? { ...author, count: 0, views: 0 };
      existing.count += 1;
      existing.views += Number(post.views || 0);
      map.set(author._id, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [topPosts]);

  const trendingTags = useMemo(() => {
    const countMap = new Map<string, number>();
    topPosts.forEach((post) => {
      const tags = Array.isArray(post.tags) ? post.tags : [];
      tags.forEach((tag: string) => {
        countMap.set(tag, (countMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [topPosts]);

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
            <Title style={{ margin: 0 }} level={2}>Bảng xếp hạng hoạt động</Title>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Xếp hạng câu hỏi và thành viên tích cực nhất theo lượt xem và tương tác
            </Text>
          </div>
          <Space wrap>
            <Button key="notifications" type="default" style={headerButtonStyle} onClick={() => history.push('/notifications')}>
              Xem thông báo
            </Button>
            <Button key="refresh" type="primary" style={headerButtonStyle} onClick={() => window.location.reload()}>
              Cập nhật bảng xếp hạng
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Card
            bordered
            style={{ borderRadius: 16, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: 18 }}>
                  Top câu hỏi được quan tâm nhất
                </Text>
                <Paragraph type="secondary" style={{ margin: '12px 0 0' }}>
                  Dựa trên lượt xem và tương tác, những câu hỏi dưới đây đang dẫn đầu cộng đồng.
                </Paragraph>
              </div>

              <List
                loading={loading}
                dataSource={topPosts}
                locale={{ emptyText: <Empty description="Chưa có dữ liệu bảng xếp hạng" /> }}
                pagination={
                  total > pageSize
                    ? {
                        current: page,
                        pageSize,
                        total,
                        showQuickJumper: true,
                        onChange: (nextPage) => {
                          setPage(nextPage);
                        },
                        locale: { jump_to: 'Đến trang', page: '' },
                      }
                    : false
                }
                renderItem={(post: any, index) => (
                  <List.Item
                    style={{
                      borderRadius: 14,
                      padding: 18,
                      marginBottom: 14,
                      background: index < 3 ? '#fff7e6' : '#ffffff',
                      cursor: 'pointer',
                    }}
                    onClick={() => history.push(`/question/${post._id}`)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar size={48} style={{ backgroundColor: '#1677ff' }}>
                          {index + 1}
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                          <Text strong style={{ fontSize: 16, flex: 1, lineHeight: 1.4 }}>
                            {post.title}
                          </Text>
                          <Tag color="geekblue" style={{ height: 28, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {Number(post.views || 0).toLocaleString()} xem
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Space wrap>
                            <Tag color="cyan">{post.author?.fullName || post.author?.email || 'Người dùng ẩn'}</Tag>
                            <Text type="secondary">{post.author?.role || 'Người dùng'}</Text>
                            <Text type="secondary">{getTimeAgo(post.createdAt)}</Text>
                          </Space>
                          <div style={{ marginTop: 8 }}>
                            {Array.isArray(post.tags)
                              ? post.tags.slice(0, 4).map((tag: string) => (
                                  <Tag key={tag} color="default">
                                    {tag}
                                  </Tag>
                                ))
                              : null}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Card
              bordered
              style={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)' }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    Thành viên dẫn đầu
                  </Text>
                  <Paragraph type="secondary" style={{ marginTop: 8 }}>
                    Những tác giả có bài viết được xem nhiều nhất trong cộng đồng.
                  </Paragraph>
                </div>
                <List
                  itemLayout="horizontal"
                  dataSource={topAuthors}
                  locale={{ emptyText: <Empty description="Chưa có tác giả nổi bật" /> }}
                  renderItem={(author: any, index) => (
                    <List.Item
                      style={{ borderRadius: 12, padding: 14, marginBottom: 12 }}
                      onClick={() => history.push(`/profile/${author._id}`)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: '#52c41a' }}>
                            {author.fullName?.charAt(0) || 'U'}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <Text strong>{author.fullName || author.email}</Text>
                            <Tag color="gold">{index + 1}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Text type="secondary">Số bài viết hot: {author.count}</Text>
                            <Text type="secondary">Tổng lượt xem: {Number(author.views).toLocaleString()}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Space>
            </Card>

            <Card
              bordered
              style={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)' }}
              bodyStyle={{ padding: 24 }}
            >
              <Text strong style={{ fontSize: 18 }}>
                Thẻ thịnh hành
              </Text>
              <Paragraph type="secondary" style={{ marginTop: 8 }}>
                Các chủ đề được quan tâm nhiều nhất trên bảng xếp hạng.
              </Paragraph>
              <Space wrap>
                {trendingTags.length ? (
                  trendingTags.map(([tag, count]) => (
                    <Tag key={tag} color="geekblue">
                      {tag} · {count}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Chưa có thẻ nổi bật.</Text>
                )}
              </Space>
            </Card>

            <Card
              bordered
              style={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)' }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 18 }}>
                  Điểm nhanh
                </Text>
                <Statistic
                  title="Câu hỏi đang hot"
                  value={topPosts.length}
                  prefix={<FireOutlined />}
                />
                <Statistic
                  title="Tác giả nổi bật"
                  value={topAuthors.length}
                  prefix={<TeamOutlined />}
                />
                <Button type="primary" style={actionButtonStyle} icon={<RiseOutlined />} block onClick={() => history.push('/notifications')}>
                  Kiểm tra hoạt động gần đây
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Card
        bordered
        style={{ borderRadius: 16, marginTop: 24, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)' }}
        bodyStyle={{ padding: 24 }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={18}>
            <Text strong style={{ fontSize: 18 }}>
              Hướng dẫn sử dụng bảng xếp hạng
            </Text>
            <Paragraph type="secondary" style={{ marginTop: 12 }}>
              Bảng xếp hạng tổng hợp giúp bạn nhanh chóng tìm ra nội dung được quan tâm nhất, các tác giả có ảnh hưởng và chủ đề thảo luận đang nóng. Nhấp vào mỗi câu hỏi để xem chi tiết, cập nhật tương tác và tham gia trả lời.
            </Paragraph>
          </Col>
          <Col>
            <Button type="default" style={actionButtonStyle} icon={<StarOutlined />} onClick={() => history.push('/')}>
              Về trang chủ
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Leaderboard;
