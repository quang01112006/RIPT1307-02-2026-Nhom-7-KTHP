import { Col, Row } from 'antd';
import { useEffect } from 'react';
import { useModel, useParams } from 'umi';
import BaiVietChinh from './components/BaiVietChinh';
import DanhSachBinhLuan from './components/DanhSachBinhLuan';

const ChiTietBaiViet = () => {
	const { record: post, getByIdModel: getPostDetail, voteBaiVietModel } = useModel('baiviet');
	const {
		danhSach: dsComments,
		getCommentsByPostModel: getComments,
		voteCommentModel,
		postModel,
	} = useModel('binhluan');
	const { initialState } = useModel('@@initialState');
	const { id } = useParams<{ id: string }>();

	useEffect(() => {
		if (id) {
			getPostDetail(id);
			getComments(id);
		}
	}, [id]);

	const userId = initialState?.currentUser?._id;
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

	return (
		<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
			{/*====== Cột bên trái =======*/}
			<Col xs={24} lg={18}>
				<BaiVietChinh
					post={post}
					postScore={postScore}
					hasUpvoted={hasUpvoted}
					hasDownvoted={hasDownvoted}
					onVote={handleVotePost}
				/>

				<DanhSachBinhLuan
					comments={dsComments}
					userId={userId}
					currentUserAvatar={initialState?.currentUser?.avatar}
					onVote={handleVoteComment}
					onSubmitReply={handleSubmitReply}
				/>
			</Col>

			{/*====== Cột bên phải =======*/}
			<Col xs={24} lg={6}>
				đây là bên phải
			</Col>
		</Row>
	);
};

export default ChiTietBaiViet;
