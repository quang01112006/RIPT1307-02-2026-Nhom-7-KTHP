import { CheckCircleOutlined, FacebookOutlined, FireOutlined, GithubOutlined, LinkedinOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Col, Row, Segmented, Space, Statistic, Tag, Tooltip, Typography, List, Spin } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Link, useModel, history } from 'umi';
import { getTagColor } from '@/utils/utils';

const { Title, Text } = Typography;

interface Props {
  user: any;
}

const OverviewTab = ({ user }: Props) => {
  const [activityType, setActivityType] = useState('questions');
  
  const { userPosts, getPostsByAuthorModel, loading: loadingPosts } = useModel('baiviet');
  const { userComments, getCommentsByAuthorModel, loading: loadingComments } = useModel('binhluan');

  useEffect(() => {
    if (user?._id) {
        if (activityType === 'questions') {
            getPostsByAuthorModel(user._id);
        } else {
            getCommentsByAuthorModel(user._id);
        }
    }
  }, [user?._id, activityType]);

  return (
    <div>
        <Card size='small' style={{ marginBottom: 24, background: '#fafafa', borderRadius: 8 }}>
            <Row gutter={16} align='middle' justify='space-around' style={{ textAlign: 'center' }}>
                <Col span={8}>
                    <Statistic
                        title={
                            <Space>
                                <FireOutlined style={{ color: '#faad14' }} />
                                <Text strong>Điểm uy tín</Text>
                            </Space>
                        }
                        value={user.reputation || 0}
                        valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={
                            <Space>
                                <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                                <Text strong>Câu hỏi đã đăng</Text>
                            </Space>
                        }
                        value={user.questionsCount || userPosts?.length || 0}
                        valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={
                            <Space>
                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                <Text strong>Câu trả lời</Text>
                            </Space>
                        }
                        value={user.answersCount || userComments?.length || 0}
                        valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                    />
                </Col>
            </Row>
        </Card>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 33.33%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card
                    size='small'
                    title='Kỹ năng / Công nghệ'
                    bordered={false}
                    style={{ background: '#f9f9f9', borderRadius: 8 }}
                >
                    {user.skills?.length > 0 ? (
                        <Space size={[0, 8]} wrap>
                            {user.skills.map((skill: string) => (
                                <Tag key={skill} color='cyan'>
                                    {skill}
                                </Tag>
                            ))}
                        </Space>
                    ) : (
                        <Text type='secondary'>Chưa cập nhật kỹ năng.</Text>
                    )}
                </Card>

                <Card
                    size='small'
                    title='Mạng xã hội'
                    bordered={false}
                    style={{ background: '#f9f9f9', borderRadius: 8 }}
                >
                    <Space size='large'>
                        <Tooltip title='GitHub'>
                            <a
                                href={user.socials?.github || '#'}
                                target={user.socials?.github ? '_blank' : '_self'}
                                rel='noreferrer'
                                style={{
                                    opacity: user.socials?.github ? 1 : 0.4,
                                    cursor: user.socials?.github ? 'pointer' : 'default',
                                    transition: 'all 0.3s',
                                }}
                            >
                                <GithubOutlined style={{ fontSize: 28, color: '#333' }} />
                            </a>
                        </Tooltip>
                        <Tooltip title='Facebook'>
                            <a
                                href={user.socials?.facebook || '#'}
                                target={user.socials?.facebook ? '_blank' : '_self'}
                                rel='noreferrer'
                                style={{
                                    opacity: user.socials?.facebook ? 1 : 0.4,
                                    cursor: user.socials?.facebook ? 'pointer' : 'default',
                                    transition: 'all 0.3s',
                                }}
                            >
                                <FacebookOutlined style={{ fontSize: 28, color: '#1877f2' }} />
                            </a>
                        </Tooltip>
                        <Tooltip title='LinkedIn'>
                            <a
                                href={user.socials?.linkedin || '#'}
                                target={user.socials?.linkedin ? '_blank' : '_self'}
                                rel='noreferrer'
                                style={{
                                    opacity: user.socials?.linkedin ? 1 : 0.4,
                                    cursor: user.socials?.linkedin ? 'pointer' : 'default',
                                    transition: 'all 0.3s',
                                }}
                            >
                                <LinkedinOutlined style={{ fontSize: 28, color: '#0a66c2' }} />
                            </a>
                        </Tooltip>
                    </Space>
                </Card>
            </div>

            <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Title level={5} style={{ margin: 0 }}>
                            Hoạt động gần đây
                        </Title>
                        <Segmented
                            options={[
                                { label: 'Câu hỏi', value: 'questions' },
                                { label: 'Câu trả lời', value: 'answers' },
                            ]}
                            value={activityType}
                            onChange={(val) => setActivityType(val as string)}
                        />
                    </div>
                    
                    <Spin spinning={activityType === 'questions' ? (loadingPosts && (!userPosts || userPosts.length === 0)) : (loadingComments && (!userComments || userComments.length === 0))}>
                        {activityType === 'questions' ? (
                            <List
                                itemLayout='vertical'
                                dataSource={userPosts?.slice(0, 5)}
                                locale={{ emptyText: 'Chưa có câu hỏi nào gần đây.' }}
                                renderItem={(item) => (
                                    <List.Item key={item._id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <Link to={`/question/${item._id}`} style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                                                {item.title}
                                            </Link>
                                        </div>
                                        <Space size='middle' style={{ marginBottom: 8 }}>
                                            {item.tags?.map((tag: string) => (
                                                <Tag 
                                                    key={tag} 
                                                    color={getTagColor(tag)}
                                                    className="hoverable-tag"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        history.push(`/tags/${encodeURIComponent(tag)}`);
                                                    }}
                                                >
                                                    {tag}
                                                </Tag>
                                            ))}
                                        </Space>
                                        <div>
                                            <Text type='secondary'>
                                                {moment(item.createdAt).format('DD/MM/YYYY HH:mm')} • {item.views || 0} lượt xem
                                            </Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <List
                                itemLayout='vertical'
                                dataSource={userComments?.slice(0, 5)}
                                locale={{ emptyText: 'Chưa có câu trả lời nào gần đây.' }}
                                renderItem={(item) => (
                                    <List.Item key={item._id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text type='secondary'>Đã trả lời bài viết: </Text>
                                            <Link to={`/question/${item.post?._id || item.post}`} style={{ fontWeight: 600 }}>
                                                {item.post?.title || 'Bài viết'}
                                            </Link>
                                        </div>
                                        <Card size='small' style={{ background: '#f9f9f9', border: 'none' }}>
                                            {/* Fix lỗi tràn ảnh bằng cách giới hạn max-width của các thẻ con */}
                                            <div 
                                                dangerouslySetInnerHTML={{ __html: item.content }} 
                                                style={{ overflow: 'hidden' }}
                                                className="rich-text-content"
                                            />
                                        </Card>
                                        <div style={{ marginTop: 8 }}>
                                            <Text type='secondary'>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        )}
                    </Spin>
                </div>
            </div>
        </div>
    </div>
  );
};

export default OverviewTab;
