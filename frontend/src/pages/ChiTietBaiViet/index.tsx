import { toggleAcceptComment } from '@/services/BinhLuan';
import { createReport } from '@/services/base/api';
import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import { Col, Form, Input, message, Modal, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { history, useModel, useParams } from 'umi';
import AnswerForm from './components/AnswerForm';
import BaiVietChinh from './components/BaiVietChinh';
import DanhSachBinhLuan from './components/DanhSachBinhLuan';
import SidebarPhai from './components/SidebarPhai';

const ChiTietBaiViet = () => {
	const {
		record: post,
		getByIdModel: getPostDetail,
		voteBaiVietModel,
		deleteModel: deletePostModel,
	} = useModel('baiviet');
	const {
		danhSach: dsComments,
		getCommentsByPostModel: getComments,
		voteCommentModel,
		postModel,
		putModel,
		deleteModel,
	} = useModel('binhluan');
	const { initialState, setInitialState } = useModel('@@initialState');
	const { id } = useParams<{ id: string }>();

	const [hotPosts, setHotPosts] = useState<BaiViet.IRecord[]>([]);
	const [relatedPosts, setRelatedPosts] = useState<BaiViet.IRecord[]>([]);
	const [popularTags, setPopularTags] = useState<any[]>([]);
	const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

	const [reportVisible, setReportVisible] = useState(false);
	const [reportTarget, setReportTarget] = useState<{ type: 'Post' | 'Comment'; id: string } | null>(null);
	const [reportForm] = Form.useForm();

	useEffect(() => {
		if (id) {
			getPostDetail(id);
			getComments(id);
		}
	}, [id]);

	useEffect(() => {
		if (dsComments && dsComments.length > 0) {
			const hash = window.location.hash;
			if (hash && hash.startsWith('#comment-')) {
				setTimeout(() => {
					const element = document.getElementById(hash.replace('#', ''));
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'center' });
						element.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
						setTimeout(() => {
							element.style.backgroundColor = '';
						}, 2000);
					}
				}, 500);
			}
		}
	}, [dsComments]);

	const { toggleBookmarkModel, putModel: putUserModel } = useModel('users');

	useEffect(() => {
		if (initialState?.currentUser?.bookmarks?.includes(id as string)) {
			setIsBookmarked(true);
		} else {
			setIsBookmarked(false);
		}
	}, [initialState?.currentUser, id]);

	const handleBookmarkClick = async () => {
		if (!initialState?.currentUser) {
			message.warning('Vui lòng đăng nhập để lưu bài viết!');
			return;
		}
		const success = await toggleBookmarkModel(initialState.currentUser._id, id as string, isBookmarked);
		if (success) {
			setIsBookmarked(!isBookmarked);

			// Cập nhật lại danh sách bookmarks trong initialState toàn cục
			const currentBookmarks = initialState.currentUser.bookmarks || [];
			const newBookmarks = isBookmarked ? currentBookmarks.filter((b: string) => b !== id) : [...currentBookmarks, id];

			setInitialState({
				...initialState,
				currentUser: {
					...initialState.currentUser,
					bookmarks: newBookmarks,
				},
			});
		}
	};

	useEffect(() => {
		if (!id) return;

		axios
			.get(`${ip3}/posts/page`, {
				params: { page: 1, limit: 5, sort: 'views' },
			})
			.then((res) => {
				const list: BaiViet.IRecord[] = res.data?.data?.result || [];
				// bỏ bài hiện tại
				setHotPosts(list.filter((p) => p._id !== id).slice(0, 4));
			})
			.catch((err) => console.error('Lỗi khi tải bài viết nổi bật:', err));

		if (post?.tags && post.tags.length > 0) {
			axios
				.get(`${ip3}/posts/page`, {
					params: { page: 1, limit: 5, tag: post.tags[0] },
				})
				.then((res) => {
					const list: BaiViet.IRecord[] = res.data?.data?.result || [];
					setRelatedPosts(list.filter((p) => p._id !== id).slice(0, 4));
				})
				.catch((err) => console.error('Lỗi khi tải bài viết cùng chủ đề:', err));
		} else {
			setRelatedPosts([]);
		}

		// lấy top 8 tag hot từ 20 bài mới nhất
		axios
			.get(`${ip3}/posts/page`, {
				params: { page: 1, limit: 20 },
			})
			.then((res) => {
				const list: BaiViet.IRecord[] = res.data?.data?.result || [];
				const tagCounts: { [key: string]: number } = {};
				list.forEach((p) => {
					p.tags?.forEach((t) => {
						tagCounts[t] = (tagCounts[t] || 0) + 1;
					});
				});
				const tags = Object.keys(tagCounts)
					.sort((a, b) => tagCounts[b] - tagCounts[a])
					.slice(0, 8);
				setPopularTags(tags);
			})
			.catch((err) => console.error('Lỗi khi tải danh sách tags:', err));
	}, [id, post?.tags?.[0]]);

	const userId = initialState?.currentUser?._id;
	const isAdmin = initialState?.currentUser?.role === 'admin';
	const hasUpvoted = userId ? !!post?.upvotedBy?.includes(userId) : false;
	const hasDownvoted = userId ? !!post?.downvotedBy?.includes(userId) : false;
	const postScore = (post?.upvotedBy?.length || 0) - (post?.downvotedBy?.length || 0);

	const handleVotePost = (type: 'up' | 'down') => {
		if (id) {
			voteBaiVietModel(id, type);
		}
	};

	const handleVoteComment = (commentId: string, type: 'up' | 'down') => {
		if (id) {
			voteCommentModel(commentId, type, id);
		}
	};

	const handleSubmitReply = async (content: string, parentId: string) => {
		if (id) {
			await postModel(
				{
					content: `<p>${content}</p>`,
					post: id as any,
					parent: parentId as any,
					type: 'COMMENT' as any,
				},
				() => getComments(id),
				false,
				'Thao tác thành công',
			);
		}
	};

	const handleMainAnswerSubmit = async (content: string) => {
		if (id) {
			await postModel(
				{
					content: `<p>${content}</p>`,
					post: id,
					type: 'ANSWER',
				},
				() => getComments(id),
				false,
				'Đã đăng câu trả lời!',
			);
		}
	};

	const handleScrollToAnswerForm = () => {
		const element = document.getElementById('main-answer-input');
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			element.focus();
		}
	};

	const handleEditComment = async (commentId: string, content: string) => {
		if (id) {
			await putModel(
				commentId,
				{ content: `<p>${content}</p>` },
				() => getComments(id),
				true,
				false,
				'Đã cập nhật bình luận',
			);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		if (id) {
			await deleteModel(commentId, () => getComments(id));
		}
	};

	const handleAcceptComment = async (commentId: string) => {
		if (id) {
			try {
				await toggleAcceptComment(commentId);
				message.success('Đã cập nhật trạng thái câu trả lời');
				getComments(id);
			} catch (error) {
				message.error('Có lỗi xảy ra');
			}
		}
	};

	const handleDeletePost = async () => {
		if (id) {
			await deletePostModel(id, () => {
				history.push('/dashboard');
			});
		}
	};

	const handleEditPost = () => {
		if (id) {
			history.push(`/ask?id=${id}`);
		}
	};

	const handleBanUser = async (userIdToBan: string) => {
		try {
			await putUserModel(userIdToBan, { isActive: false });
			message.success('Đã khóa tài khoản thành công!');
		} catch (error) {
			message.error('Lỗi khi khóa tài khoản');
		}
	};

	const handleReportClick = (type: 'Post' | 'Comment', targetId: string) => {
		if (!initialState?.currentUser) {
			message.warning('Vui lòng đăng nhập để sử dụng tính năng này!');
			return;
		}
		setReportTarget({ type, id: targetId });
		setReportVisible(true);
	};

	const handleReportSubmit = async () => {
		try {
			const values = await reportForm.validateFields();
			if (reportTarget) {
				await createReport({
					targetType: reportTarget.type,
					targetId: reportTarget.id,
					reason: values.reason === 'other' ? values.otherReason : values.reason,
				});
				message.success('Đã gửi báo cáo thành công. Cảm ơn bạn đã đóng góp!');
				setReportVisible(false);
				reportForm.resetFields();
			}
		} catch (error) {
			if (error && (error as any).errorFields) return;
			message.error('Gửi báo cáo thất bại!');
		}
	};

	return (
		<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 16px' }}>
			<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
				{/* bên trái */}
				<Col xs={24} lg={18}>
					<BaiVietChinh
						post={post}
						isSolved={dsComments.some((c) => c.isAccepted)}
						postScore={postScore}
						hasUpvoted={hasUpvoted}
						hasDownvoted={hasDownvoted}
						onVote={handleVotePost}
						onCommentClick={handleScrollToAnswerForm}
						isBookmarked={isBookmarked}
						onBookmarkClick={handleBookmarkClick}
						userId={userId}
						isAdmin={isAdmin}
						onDeletePost={handleDeletePost}
						onEditPost={handleEditPost}
						onBanUser={handleBanUser}
						onReport={(targetId) => handleReportClick('Post', targetId)}
					/>

					<DanhSachBinhLuan
						comments={dsComments}
						userId={userId}
						postAuthorId={post?.author?._id || (post?.author as unknown as string)}
						currentUserAvatar={initialState?.currentUser?.avatar}
						onVote={handleVoteComment}
						onSubmitReply={handleSubmitReply}
						onEdit={handleEditComment}
						onDelete={handleDeleteComment}
						onAccept={handleAcceptComment}
						onBanUser={handleBanUser}
						onReport={(targetId) => handleReportClick('Comment', targetId)}
					/>

					<AnswerForm currentUserAvatar={initialState?.currentUser?.avatar} onSubmit={handleMainAnswerSubmit} />
				</Col>

				{/* bên phải */}
				<Col xs={24} lg={6}>
					<SidebarPhai popularTags={popularTags} hotPosts={hotPosts} relatedPosts={relatedPosts} />
				</Col>
			</Row>

			<Modal
				title='Báo cáo vi phạm'
				visible={reportVisible}
				onCancel={() => {
					setReportVisible(false);
					reportForm.resetFields();
				}}
				onOk={handleReportSubmit}
				okText='Gửi báo cáo'
				cancelText='Hủy'
			>
				<Form form={reportForm} layout='vertical'>
					<Form.Item
						name='reason'
						label='Lý do báo cáo'
						rules={[{ required: true, message: 'Vui lòng chọn lý do báo cáo!' }]}
					>
						<Select placeholder='Chọn lý do...'>
							<Select.Option value='Spam, quảng cáo'>Spam, quảng cáo</Select.Option>
							<Select.Option value='Ngôn từ thù địch, chửi thề'>Ngôn từ thù địch, chửi thề</Select.Option>
							<Select.Option value='Thông tin sai lệch'>Thông tin sai lệch</Select.Option>
							<Select.Option value='Sai chuyên mục'>Sai chuyên mục</Select.Option>
							<Select.Option value='other'>Khác...</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item noStyle shouldUpdate={(prev, curr) => prev.reason !== curr.reason}>
						{({ getFieldValue }) =>
							getFieldValue('reason') === 'other' ? (
								<Form.Item name='otherReason' rules={[{ required: true, message: 'Vui lòng nhập lý do cụ thể!' }]}>
									<Input.TextArea rows={4} placeholder='Nhập chi tiết vi phạm...' />
								</Form.Item>
							) : null
						}
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ChiTietBaiViet;
