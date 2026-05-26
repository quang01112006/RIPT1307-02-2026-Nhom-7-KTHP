import { Col, Row, message } from 'antd';
import { useEffect, useState } from 'react';
import { useModel, useParams, history } from 'umi';
import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import AnswerForm from './components/AnswerForm';
import BaiVietChinh from './components/BaiVietChinh';
import DanhSachBinhLuan from './components/DanhSachBinhLuan';
import SidebarPhai from './components/SidebarPhai';

const ChiTietBaiViet = () => {
	const { record: post, getByIdModel: getPostDetail, voteBaiVietModel, deleteModel: deletePostModel } = useModel('baiviet');
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
	const [popularTags, setPopularTags] = useState<string[]>([]);
	const [isBookmarked, setIsBookmarked] = useState(false);

	useEffect(() => {
		if (id) {
			getPostDetail(id);
			getComments(id);
		}
	}, [id]);

	const { toggleBookmarkModel } = useModel('users');

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
			const newBookmarks = isBookmarked
				? currentBookmarks.filter((b: string) => b !== id)
				: [...currentBookmarks, id];
				
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
	const isAdmin = initialState?.currentUser?.role === 'ADMIN';
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

	const handleDeletePost = async () => {
		if (id) {
			await deletePostModel(id, () => {
				message.success('Đã xóa bài viết thành công!');
				history.push('/dashboard');
			});
		}
	};

	const handleEditPost = () => {
		if (id) {
			history.push(`/ask?id=${id}`);
		}
	};

	return (
		<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 16px' }}>
			<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
				{/* bên trái */}
				<Col xs={24} lg={18}>
					<BaiVietChinh
						post={post}
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
					/>

					<DanhSachBinhLuan
						comments={dsComments}
						userId={userId}
						currentUserAvatar={initialState?.currentUser?.avatar}
						onVote={handleVoteComment}
						onSubmitReply={handleSubmitReply}
						onEdit={handleEditComment}
						onDelete={handleDeleteComment}
					/>

					<AnswerForm currentUserAvatar={initialState?.currentUser?.avatar} onSubmit={handleMainAnswerSubmit} />
				</Col>

				{/* bên phải */}
				<Col xs={24} lg={6}>
					<SidebarPhai
						popularTags={popularTags}
						hotPosts={hotPosts}
						relatedPosts={relatedPosts}
					/>
				</Col>
			</Row>
		</div>
	);
};

export default ChiTietBaiViet;
