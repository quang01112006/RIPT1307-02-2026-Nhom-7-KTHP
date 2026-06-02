import React, { useEffect, useState } from 'react';
import { Card, Typography, Input, Row, Col, Space, Spin, Empty, Tag as AntTag, Button, Pagination } from 'antd';
import { SearchOutlined, TagsOutlined, FileTextOutlined } from '@ant-design/icons';
import { getAllTags, getTagsPage } from '@/services/Tags';
import { useHistory } from 'umi';
import './style.less';

const { Title, Text, Paragraph } = Typography;

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tags.IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const history = useHistory();

  useEffect(() => {
    fetchTags();
  }, [page, limit]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await getTagsPage({
        page,
        limit,
        condition: searchText ? { name: new RegExp(searchText, 'i') } : undefined,
      });
      const data = res?.data?.data || res?.data;
      if (Array.isArray(data)) {
        setTags(data);
      } else if (data?.records) {
        setTags(data.records);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Lỗi khi tải tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchText(value);
    setPage(1);
    if (!value.trim()) {
      setSearchText('');
      await fetchTags();
    }
  };

  const handleTagClick = (tagId: string) => {
    // Có thể navigate đến trang chi tiết tag hoặc filter
    console.log('Tag clicked:', tagId);
  };

  const handlePaginationChange = (pageNum: number, pageSize: number) => {
    setPage(pageNum);
    setLimit(pageSize);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            <Space>
              <TagsOutlined />
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
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            style={{ borderRadius: '4px' }}
          />
        </Card>

        {/* Tags Grid */}
        <Spin spinning={loading}>
          {tags.length > 0 ? (
            <div>
              <Row gutter={[16, 16]}>
                {tags.map((tag) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={tag._id}>
                    <Card
                      hoverable
                      className="tag-card"
                      onClick={() => handleTagClick(tag._id)}
                      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <AntTag color="blue" style={{ marginBottom: 8 }}>
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
                            <FileTextOutlined style={{ color: '#1677ff' }} />
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
              {total > 0 && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    onChange={handlePaginationChange}
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
    </div>
  );
};

export default Tags;
