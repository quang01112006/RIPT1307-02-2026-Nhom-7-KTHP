import React, { useEffect, useState } from 'react';
import { Card, Typography, Input, Row, Col, Space, Spin, Empty, Tag as AntTag, Button, Pagination, Drawer, List, Avatar } from 'antd';
import { SearchOutlined, TagsOutlined, FileTextOutlined } from '@ant-design/icons';
import { getAllTags, getPostsByTag } from '@/services/Tags';
import { getTagColor } from '@/utils/utils';
import { useHistory } from 'umi';
import moment from 'moment';
import './style.less';

const { Title, Text, Paragraph } = Typography;

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tags.IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  
  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tags.IRecord | null>(null);
  const [posts, setPosts] = useState<BaiViet.IRecord[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  
  const history = useHistory();

  useEffect(() => {
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    setLoading(true);
    try {
      const res = await getAllTags();
      const data = res?.data?.data || [];
      const filtered = searchText 
        ? data.filter((t: Tags.IRecord) => t.name.toLowerCase().includes(searchText.toLowerCase()))
        : data;
      setTags(filtered);
      setTotal(filtered.length);
    } catch (error) {
      console.error('Lỗi khi tải tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  useEffect(() => {
    fetchAllTags();
  }, [searchText]);

  const handleTagClick = async (tag: Tags.IRecord) => {
    if (drawerVisible && selectedTag?._id === tag._id) {
      return; // Không làm gì nếu cùng tag đang mở
    }
    setSelectedTag(tag);
    setDrawerVisible(true);
    setPostsPage(1);
    setPosts([]); // Clear posts cũ
    await fetchPosts(tag.name, 1);
  };

  const fetchPosts = async (tagName: string, pageNum: number) => {
    setPostsLoading(true);
    try {
      const res = await getPostsByTag(tagName, pageNum, 10);
      const data = res?.data?.data;
      console.log('Posts response:', data);
      
      if (data?.result && Array.isArray(data.result)) {
        setPosts(data.result);
        setPostsTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setPosts(data);
        setPostsTotal(data.length);
      } else {
        setPosts([]);
        setPostsTotal(0);
      }
    } catch (error) {
      console.error('Lỗi khi tải bài viết:', error);
      setPosts([]);
      setPostsTotal(0);
    } finally {
      setPostsLoading(false);
    }
  };

  const handlePostClick = (postId: string) => {
    window.open(`/question/${postId}`, '_blank');
  };

  const handlePostsPaginationChange = (pageNum: number) => {
    setPostsPage(pageNum);
    if (selectedTag) {
      fetchPosts(selectedTag.name, pageNum);
    }
  };

  const displayedTags = tags.slice((page - 1) * limit, page * limit);

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            <Space>
              Danh sách Thẻ từ khóa
            </Space>
          </Title>
          <Text type="secondary">
            Khám phá các thẻ từ khóa phổ biến và tìm các câu hỏi liên quan
          </Text>
        </div>

        {/* Search */}
        <Card style={{ backgroundColor: '#fafafa' }}>
          <Input
            placeholder="Tìm kiếm thẻ từ khóa..."
            prefix={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ borderRadius: '4px' }}
          />
        </Card>

        {/* Tags Grid */}
        <Spin spinning={loading}>
          {tags.length > 0 ? (
            <div>
              <Row gutter={[16, 16]}>
                {displayedTags.map((tag) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={tag._id}>
                    <Card
                      hoverable
                      className="tag-card"
                      onClick={() => handleTagClick(tag)}
                      loading={drawerVisible && selectedTag?._id === tag._id && postsLoading}
                      style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: drawerVisible && selectedTag?._id === tag._id && postsLoading ? 'not-allowed' : 'pointer', opacity: drawerVisible && selectedTag?._id === tag._id && postsLoading ? 0.6 : 1 }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <AntTag color={getTagColor(tag.name)}>
                            {tag.name}
                          </AntTag>
                        </div>
                        
                        {tag.description && (
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: 12, minHeight: 40 }}
                          >
                            {tag.description}
                          </Paragraph>
                        )}

                        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 'auto' }}>
                          <Space>
                            <FileTextOutlined style={{ color: getTagColor(tag.name) }} />
                            <Text strong>{tag.postCount || 0}</Text>
                            <Text type="secondary">câu hỏi</Text>
                          </Space>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {total > limit && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    onChange={(p, s) => { setPage(p); setLimit(s); }}
                    showSizeChanger
                    showTotal={(total) => `Tổng ${total} thẻ`}
                  />
                </div>
              )}
            </div>
          ) : (
            <Empty description="Không tìm thấy thẻ từ khóa nào" />
          )}
        </Spin>
      </Space>

      {/* Drawer Posts */}
      <Drawer
        title={
          <Space>
            <AntTag color={getTagColor(selectedTag?.name || '')}>
              {selectedTag?.name}
            </AntTag>
            <Text>{postsTotal} câu hỏi</Text>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={600}
      >
        <Spin spinning={postsLoading}>
          {posts.length > 0 ? (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <List
                dataSource={posts}
                renderItem={(post) => (
                  <List.Item
                    onClick={() => handlePostClick(post._id)}
                    style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={post.author?.avatar}
                          style={{ backgroundColor: '#1677ff' }}
                        />
                      }
                      title={
                        <a style={{ color: '#1677ff', fontWeight: 600 }}>
                          {post.title}
                        </a>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {post.author?.fullName} • {moment(post.createdAt).fromNow()}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            👁 {post.views || 0} lượt xem
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />

              {postsTotal > 10 && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Pagination
                    current={postsPage}
                    pageSize={10}
                    total={postsTotal}
                    onChange={handlePostsPaginationChange}
                  />
                </div>
              )}
            </Space>
          ) : (
            <Empty description="Không có câu hỏi cho tag này" />
          )}
        </Spin>
      </Drawer>
    </div>
  );
};

export default Tags;