import { getAllTags } from '@/services/Tags';
import { getTagColor } from '@/utils/utils';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { Tag as AntTag, Card, Col, Empty, Input, Pagination, Row, Space, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory, useModel } from 'umi';
import './style.less';

const { Title, Text, Paragraph } = Typography;

const Tags: React.FC = () => {
	const [tags, setTags] = useState<Tags.IRecord[]>([]);
	const [searchText, setSearchText] = useState('');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(12);
	const [total, setTotal] = useState(0);

	const history = useHistory();

	const tagsModel = useModel('tags') as any;
	const { danhSach: allTags, getAllTagsModel, loading } = tagsModel ?? {};

	useEffect(() => {
		getAllTagsModel?.();
	}, []);

	useEffect(() => {
		const safeAllTags = allTags || [];
		const filtered = searchText
			? safeAllTags.filter((t: Tags.IRecord) => t.name.toLowerCase().includes(searchText.toLowerCase()))
			: safeAllTags;
		setTags(filtered);
		setTotal(filtered.length);
		setPage(1);
	}, [searchText, allTags]);

	const handleSearch = (value: string) => {
		setSearchText(value);
	};

	const handleTagClick = (tag: Tags.IRecord) => {
		history.push(`/tags/${encodeURIComponent(tag.name)}`);
	};

	const displayedTags = tags.slice((page - 1) * limit, page * limit);

	return (
		<div style={{ padding: '24px' }}>
			<Space direction='vertical' size='large' style={{ width: '100%' }}>
				{/* Header */}
				<div>
					<Title level={2} style={{ marginBottom: 8 }}>
						<Space>Danh sách Thẻ từ khóa</Space>
					</Title>
					<Text type='secondary'>Khám phá các thẻ từ khóa phổ biến và tìm các câu hỏi liên quan</Text>
				</div>

				{/* Search */}
				<Card style={{ backgroundColor: '#fafafa' }}>
					<Input
						placeholder='Tìm kiếm thẻ từ khóa...'
						prefix={<SearchOutlined />}
						size='large'
						value={searchText}
						onChange={(e) => handleSearch(e.target.value)}
						style={{ borderRadius: '4px' }}
					/>
				</Card>

				{/* Tags Grid */}
				<Spin spinning={loading && tags.length === 0}>
					{tags.length > 0 ? (
						<div>
							<Row gutter={[16, 16]}>
								{displayedTags.map((tag) => (
									<Col xs={24} sm={12} md={8} lg={6} key={tag._id}>
										<Card
											hoverable
											className='tag-card'
											onClick={() => handleTagClick(tag)}
											style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
										>
											<Space direction='vertical' size='small' style={{ width: '100%' }}>
												<div>
													<AntTag color={getTagColor(tag.name)}>{tag.name}</AntTag>
												</div>

												{tag.description && (
													<Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12, minHeight: 40 }}>
														{tag.description}
													</Paragraph>
												)}

												<div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 'auto' }}>
													<Space>
														<FileTextOutlined style={{ color: getTagColor(tag.name) }} />
														<Text strong>{tag.postCount || 0}</Text>
														<Text type='secondary'>câu hỏi</Text>
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
										onChange={(p, s) => {
											setPage(p);
											setLimit(s);
											window.scrollTo({ top: 0, behavior: 'smooth' });
										}}
										showSizeChanger
										showTotal={(total) => `Tổng ${total} thẻ`}
									/>
								</div>
							)}
						</div>
					) : (
						<Empty description='Không tìm thấy thẻ từ khóa nào' />
					)}
				</Spin>
			</Space>
		</div>
	);
};

export default Tags;
