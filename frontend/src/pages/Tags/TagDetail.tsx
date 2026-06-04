import { getTagColor } from '@/utils/utils';
import { CheckCircleFilled } from '@ant-design/icons';
import { Tag as AntTag, Avatar, Card, Empty, List, Pagination, Segmented, Space, Spin, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams, useModel } from 'umi';

const { Title, Text, Paragraph } = Typography;

type QuestionItem = BaiViet.IRecord & {
	answers?: number;
	commentsCount?: number;
	comments?: any[];
	isResolved?: boolean;
	status?: string;
	summary?: string;
	upvotedBy?: any[];
	downvotedBy?: any[];
	author?: {
		_id?: string;
		fullName?: string;
		name?: string;
		department?: string;
		faculty?: string;
		avatar?: string;
	};
};

const TagDetail: React.FC = () => {
	const [page, setPage] = useState(1);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [hoveredAuthorId, setHoveredAuthorId] = useState<string | null>(null);
	const [filterType, setFilterType] = useState<'newest' | 'trending' | 'unanswered'>('newest');

	const { name: encodedName } = useParams<{ name: string }>();
	const name = decodeURIComponent(encodedName || '');
	const history = useHistory();

	const { danhSach: allTags, getAllTagsModel, loading } = useModel('tags') as any;
	const baiVietModel = useModel('baiviet') as any;

	useEffect(() => {
		if (name) {
			if (!allTags || allTags.length === 0) {
				getAllTagsModel?.();
			}
			if (typeof baiVietModel?.getModel === 'function') {
				baiVietModel.getModel(undefined, undefined, undefined, 1, 1000);
			}
		}
	}, [name]);

	const tagInfo = useMemo(() => {
		if (!allTags || !name) return null;
		return allTags.find((t: Tags.IRecord) => t.name.toLowerCase() === name.toLowerCase()) || null;
	}, [allTags, name]);

	const posts = useMemo(() => {
		if (!name || !baiVietModel?.danhSach) return [];
		const candidate = Array.isArray(baiVietModel.danhSach) ? baiVietModel.danhSach : [];
		return candidate.filter((p: any) => Array.isArray(p.tags) && p.tags.includes(name)) as QuestionItem[];
	}, [baiVietModel?.danhSach, name]);

	const filteredPosts = useMemo(() => {
		let result = [...posts];
		if (filterType === 'unanswered') {
			result = result.filter((item) => {
				const answerCount = Number(item.answers ?? item.commentsCount ?? item.comments?.length ?? 0);
				return answerCount === 0;
			});
		}

		result.sort((a, b) => {
			if (filterType === 'trending') {
				const aUpvotes = Array.isArray(a.upvotedBy) ? a.upvotedBy.length : 0;
				const aDownvotes = Array.isArray(a.downvotedBy) ? a.downvotedBy.length : 0;
				const aVotes = aUpvotes - aDownvotes;

				const bUpvotes = Array.isArray(b.upvotedBy) ? b.upvotedBy.length : 0;
				const bDownvotes = Array.isArray(b.downvotedBy) ? b.downvotedBy.length : 0;
				const bVotes = bUpvotes - bDownvotes;

				const leftScore = Number(a.views ?? 0) + aVotes;
				const rightScore = Number(b.views ?? 0) + bVotes;
				return rightScore - leftScore;
			}
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		return result;
	}, [posts, filterType]);

	const handlePaginationChange = (pageNum: number) => {
		setPage(pageNum);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
			<Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
				<div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
					<Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
						<span style={{ fontSize: 32, fontWeight: 700, color: '#1f1f1f' }}>{name}</span>
					</Title>
					<Text type='secondary' style={{ fontSize: 16, lineHeight: 1.6, display: 'block', maxWidth: '800px' }}>
						{tagInfo?.description || `Khám phá các câu hỏi và bài viết liên quan đến chủ đề ${name}.`}
					</Text>
				</div>

				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
					<Text strong style={{ fontSize: 16 }}>
						{filteredPosts.length} câu hỏi
					</Text>
					<Segmented
						options={[
							{ label: 'Mới nhất', value: 'newest' },
							{ label: 'Xu hướng', value: 'trending' },
							{ label: 'Chưa trả lời', value: 'unanswered' },
						]}
						value={filterType}
						onChange={(val) => {
							setFilterType(val as 'newest' | 'trending' | 'unanswered');
							setPage(1);
						}}
						style={{ backgroundColor: '#f5f5f5', padding: 4, borderRadius: 8 }}
					/>
				</div>

				<Spin spinning={loading}>
					{filteredPosts.length > 0 ? (
						<Space direction='vertical' size='large' style={{ width: '100%' }}>
							<List
								dataSource={filteredPosts.slice((page - 1) * 10, page * 10)}
								renderItem={(record) => {
									const answerCount = Number(record.answers ?? record.commentsCount ?? record.comments?.length ?? 0);
									const isResolved = Boolean(record.isResolved ?? record.status === 'resolved');
									const authorName = record.author?.fullName || record.author?.name || 'Thành viên';
									const authorDepartment = record.author?.department || record.author?.faculty || 'Khoa/Viện chưa rõ';
									const recordTags = Array.isArray(record.tags) ? record.tags : [];
									const recordId = record._id ?? '';

									const upvotes = Array.isArray(record.upvotedBy) ? record.upvotedBy.length : 0;
									const downvotes = Array.isArray(record.downvotedBy) ? record.downvotedBy.length : 0;
									const votesCount = upvotes - downvotes;

									return (
										<div
											onClick={() => history.push(`/question/${recordId}`)}
											onMouseEnter={() => setHoveredId(recordId)}
											onMouseLeave={() => setHoveredId(null)}
											style={{
												display: 'flex',
												width: '100%',
												backgroundColor: '#ffffff',
												borderRadius: 14,
												border: `1px solid ${hoveredId === recordId ? '#0052cc' : '#e8e8e8'}`,
												boxShadow:
													hoveredId === recordId
														? '0 8px 18px rgba(0, 82, 204, 0.12)'
														: '0 1px 4px rgba(0, 0, 0, 0.06)',
												padding: 20,
												marginBottom: 16,
												cursor: 'pointer',
												gap: 20,
												transition: 'all 0.2s ease-in-out',
											}}
										>
											<div
												style={{
													width: 100,
													minWidth: 100,
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													gap: 12,
													textAlign: 'center',
												}}
											>
												<div style={{ color: '#8c8c8c', fontSize: 12 }}>
													<div style={{ fontWeight: 700, fontSize: 20, color: '#1f1f1f' }}>{votesCount}</div>
													Bình chọn
												</div>

												<div
													style={{
														width: 72,
														minHeight: 60,
														display: 'flex',
														flexDirection: 'column',
														justifyContent: 'center',
														alignItems: 'center',
														borderRadius: 10,
														border: `1px solid ${isResolved ? '#52c41a' : answerCount > 0 ? '#1890ff' : 'transparent'}`,
														backgroundColor: isResolved ? '#f6ffed' : answerCount > 0 ? '#e6f7ff' : 'transparent',
														color: isResolved ? '#52c41a' : answerCount > 0 ? '#1890ff' : '#8c8c8c',
														padding: 8,
													}}
												>
													<div style={{ fontWeight: 700, fontSize: 16 }}>{answerCount}</div>
													<div style={{ fontSize: 11 }}>{isResolved ? 'Đã giải' : 'Đáp án'}</div>
													{isResolved && <CheckCircleFilled style={{ fontSize: 12, marginTop: 4 }} />}
												</div>

												<div style={{ color: '#8c8c8c', fontSize: 12 }}>{Number(record.views ?? 0)} Lượt xem</div>
											</div>

											<div
												style={{
													flexGrow: 1,
													display: 'flex',
													flexDirection: 'column',
													justifyContent: 'space-between',
												}}
											>
												<div>
													<div
														style={{
															color: '#0052cc',
															fontWeight: 700,
															fontSize: 18,
															lineHeight: 1.4,
															marginBottom: 10,
														}}
													>
														{record.title}
													</div>

													<Paragraph
														ellipsis={{ rows: 2, expandable: false }}
														style={{ color: '#434343', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}
													>
														{String(record.summary ?? record.content ?? '').replace(/<[^>]*>?/gm, '')}
													</Paragraph>

													<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
														{recordTags.map((tag) => (
															<AntTag
																key={tag}
																color={getTagColor(tag)}
																style={{ borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}
															>
																{tag}
															</AntTag>
														))}
													</div>
												</div>

												<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
													<div
														style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
														onMouseEnter={() => setHoveredAuthorId(recordId)}
														onMouseLeave={() => setHoveredAuthorId(null)}
														onClick={(e) => {
															e.stopPropagation();
															if (record.author?._id) {
																history.push(`/profile/${record.author._id}`);
															}
														}}
													>
														<Avatar size={32} src={record.author?.avatar} style={{ backgroundColor: '#1890ff' }}>
															{String(authorName).charAt(0)}
														</Avatar>
														<div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
															<Text
																strong
																style={{
																	color: hoveredAuthorId === recordId ? '#0052cc' : '#262626',
																	fontSize: 14,
																	textDecoration: hoveredAuthorId === recordId ? 'underline' : 'none',
																	transition: 'color 0.2s ease',
																}}
															>
																{authorName}
															</Text>
															<Text type='secondary' style={{ fontSize: 12 }}>
																{authorDepartment} • {moment(record.createdAt).fromNow()}
															</Text>
														</div>
													</div>
												</div>
											</div>
										</div>
									);
								}}
							/>

							{filteredPosts.length > 10 && (
								<div style={{ textAlign: 'center', marginTop: 24 }}>
									<Pagination
										current={page}
										pageSize={10}
										total={filteredPosts.length}
										onChange={handlePaginationChange}
										showTotal={(total) => `Tổng ${total} câu hỏi`}
									/>
								</div>
							)}
						</Space>
					) : (
						<Empty description='Chưa có câu hỏi nào sử dụng thẻ này' />
					)}
				</Spin>
			</Card>
		</div>
	);
};

export default TagDetail;
