/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostsService } from 'src/posts/posts.service';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,
    private postsService: PostsService,
  ) {}

  async create(createCommentDto: any, userId: string) {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      author: userId,
    });

    const result = await createdComment.save();

    try {
      const post = await this.postsService.findOne(createCommentDto.post);
      if (String((post.author as any)._id) !== String(userId)) {
        await this.notificationsService.create({
          recipient: (post.author as any)._id,
          sender: userId,
          type: 'REPLY',
          targetId: post._id,
          targetType: 'Post',
          title: 'Bình luận mới',
          message: `Đã có người trả lời câu hỏi "${post.title}" của bạn.`,
          link: `/question/${post._id}`,
        });
      }

      if (createCommentDto.parent) {
        const parentComment = await this.commentModel.findById(createCommentDto.parent);
        if (parentComment && String((parentComment.author as any)._id) !== String(userId) && String((parentComment.author as any)._id) !== String((post.author as any)._id)) {
          await this.notificationsService.create({
            recipient: (parentComment.author as any)._id,
            sender: userId,
            type: 'REPLY',
            targetId: post._id,
            targetType: 'Comment',
            title: 'Phản hồi mới',
            message: `Đã có người phản hồi bình luận của bạn trong câu hỏi "${post.title}".`,
            link: `/question/${post._id}`,
          });
        }
      }
    } catch (error) {
      console.error('Lỗi tạo thông báo:', error);
    }

    const populatedResult = await result.populate('author', 'fullName code role avatar');
    
    // Broadcast comment tới toàn mạng
    this.notificationsService.broadcastComment(populatedResult);

    return populatedResult;
  }

  async findByPost(postId: string) {
    const data = await this.commentModel
      .find({ post: postId as any })
      .populate('author', 'fullName email code role avatar')
      .sort({ createdAt: -1 })
      .exec();

    return {
      data: {
        result: data,
        total: data.length,
      },
    };
  }

  async findByAuthor(authorId: string) {
    const data = await this.commentModel
      .find({ author: authorId as any, type: 'ANSWER' })
      .populate('author', 'fullName email code role avatar')
      .populate('post', 'title') // Lấy thêm tiêu đề bài viết
      .sort({ createdAt: -1 })
      .exec();

    return {
      data: {
        result: data,
        total: data.length,
      },
    };
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    if (!isAdmin && String(comment.author as any) !== String(userId)) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    await this.commentModel.findByIdAndDelete(id).exec();
    this.notificationsService.broadcastDeleteComment(id);
    return comment;
  }

  async update(id: string, content: string, userId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    if (String(comment.author as any) !== String(userId)) {
      throw new ForbiddenException('Bạn không có quyền sửa bình luận này');
    }

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(id, { content }, { new: true })
      .populate('author', 'fullName code role avatar')
      .exec();
    
    this.notificationsService.broadcastUpdateComment(updatedComment);
    return updatedComment;
  }

  async toggleVote(commentId: string, userId: string, type: 'up' | 'down') {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    const upvotedIndex = comment.upvotedBy.findIndex(
      (id) => String(id) === userId,
    );
    const downvotedIndex = comment.downvotedBy.findIndex(
      (id) => String(id) === userId,
    );

    if (type === 'up') {
      if (upvotedIndex > -1) {
        comment.upvotedBy.splice(upvotedIndex, 1);
      } else {
        comment.upvotedBy.push(userId as any);
        if (downvotedIndex > -1) comment.downvotedBy.splice(downvotedIndex, 1);
        
        if (String(comment.author) !== String(userId)) {
          this.notificationsService.create({
            recipient: comment.author as any,
            sender: userId as any,
            type: 'UPVOTE',
            targetId: comment.post as any, // Link to the post
            targetType: 'Comment',
            title: 'Lượt thích mới',
            message: `Một người vừa thích bình luận của bạn.`,
            link: `/question/${comment.post}`,
          }).catch(err => console.error('Lỗi tạo thông báo upvote:', err));
        }
      }
    } else {
      if (downvotedIndex > -1) {
        comment.downvotedBy.splice(downvotedIndex, 1);
      } else {
        comment.downvotedBy.push(userId as any);
        if (upvotedIndex > -1) comment.upvotedBy.splice(upvotedIndex, 1);
      }
    }

    await comment.save();
    
    const populatedComment = await comment.populate('author', 'fullName code role avatar');
    this.notificationsService.broadcastUpdateComment(populatedComment);
    
    return populatedComment;
  }
}
