import { getUserBookmarks, toggleBookmark } from '@/services/base/api';
import { getTagColor } from '@/utils/utils';
import { CheckCircleFilled } from '@ant-design/icons';
import { Avatar, Button, List, Popconfirm, Space, Spin, Tag, Typography, message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'umi';

const { Text, Paragraph } = Typography;

interface Props {
	user: any;
}

const BookmarksTab = ({ user }: Props) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<any[]>([]);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [hoveredAuthorId, setHoveredAuthorId] = useState<string | null>(null);
	const history = useHistory();

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await getUserBookmarks(user._id);
			setData(res.data?.data?.result || []);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleUnsave = async (e: any, postId: string) => {
		e.stopPropagation();
		try {
			await toggleBookmark(user._id, postId);
			message.success('Đã bỏ lưu bài viết');
			fetchData();
		} catch (error) {
			message.error('Có lỗi xảy ra, vui lòng thử lại');
		}
	};

	useEffect(() => {
		if (user?._id) {
			fetchData();
		}
	}, [user?._id]);

	return (
		<div>
			<Spin spinning={loading}>
				<List
					dataSource={data}
					pagination={{
						pageSize: 5,
						hideOnSinglePage: true,
					}}
					locale={{ emptyText: 'Chưa có bài viết nào được lưu' }}
					renderItem={(record) => {
						const post = record as any;
						const answerCount = Number(post.answers ?? post.commentsCount ?? post.comments?.length ?? 0);
						const isResolved = Boolean(post.isResolved ?? post.status === 'resolved');
						const authorName = post.author?.fullName || post.author?.name || 'Thành viên';
						const authorDepartment = post.author?.department || post.author?.faculty || 'Khoa/Viện chưa rõ';
						const recordTags = Array.isArray(post.tags) ? post.tags : [];
						const recordId = post._id ?? '';

						const upvotes = Array.isArray(post.upvotedBy) ? post.upvotedBy.length : 0;
						const downvotes = Array.isArray(post.downvotedBy) ? post.downvotedBy.length : 0;
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
									position: 'relative'
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

									<div style={{ color: '#8c8c8c', fontSize: 12 }}>{Number(post.views ?? 0)} Lượt xem</div>
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
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
											<div
												style={{
													color: '#0052cc',
													fontWeight: 700,
													fontSize: 18,
													lineHeight: 1.4,
													marginBottom: 10,
													paddingRight: 40
												}}
											>
												{post.title}
											</div>
											
											<Popconfirm
												title="Bỏ lưu bài viết này?"
												onConfirm={(e) => handleUnsave(e, post._id)}
												onCancel={(e) => e?.stopPropagation()}
												okText="Có"
												cancelText="Không"
											>
												<Button 
													type="text" 
													onClick={(e) => e.stopPropagation()}
													icon={
														<span className="anticon" style={{ fontSize: '16px' }}>
															<svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="#1890ff">
																<path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path>
															</svg>
														</span>
													}
													style={{ color: '#1890ff', fontWeight: 500, padding: 4 }}
												>
													Đã lưu
												</Button>
											</Popconfirm>
										</div>

										<Paragraph
											ellipsis={{ rows: 2, expandable: false }}
											style={{ color: '#434343', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}
										>
											{String(post.summary ?? post.content ?? '').replace(/<[^>]*>?/gm, '')}
										</Paragraph>

										<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
											{recordTags.map((tag: string) => (
												<Tag
													key={tag}
													color={getTagColor(tag)}
													style={{ borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}
												>
													{tag}
												</Tag>
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
												if (post.author?._id) {
													history.push(`/profile/${post.author._id}`);
												}
											}}
										>
											<Avatar size={32} src={post.author?.avatar} style={{ backgroundColor: '#1890ff' }}>
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
													{authorDepartment} • {moment(post.createdAt).fromNow()}
												</Text>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					}}
				/>
			</Spin>
		</div>
	);
};

export default BookmarksTab;
