/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { PostsService } from '../posts/posts.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,
    private postsService: PostsService,
    private usersService: UsersService,
    private mailService: MailService,
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

        // Gửi email thông báo
        try {
          const senderUser = await this.usersService.findOne(userId);
          const authorEmail = (post.author as any).email;
          if (authorEmail && senderUser) {
            await this.mailService.sendCommentNotificationEmail(
              authorEmail,
              post.title,
              senderUser.fullName,
              post._id.toString()
            );
          }
        } catch (mailError) {
          console.error('Lỗi gửi email thông báo bình luận:', mailError);
        }
      }

      if (createCommentDto.parent) {
        const parentComment = await this.commentModel.findById(
          createCommentDto.parent,
        );
        if (
          parentComment &&
          String((parentComment.author as any)._id) !== String(userId) &&
          String((parentComment.author as any)._id) !==
            String((post.author as any)._id)
        ) {
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

          // Gửi email thông báo cho người được reply
          try {
            const senderUser = await this.usersService.findOne(userId);
            const parentAuthor = await this.usersService.findOne((parentComment.author as any)._id);
            if (parentAuthor?.email && senderUser) {
              await this.mailService.sendCommentNotificationEmail(
                parentAuthor.email,
                post.title,
                senderUser.fullName,
                post._id.toString()
              );
            }
          } catch (mailError) {
            console.error('Lỗi gửi email thông báo phản hồi:', mailError);
          }
        }
      }
    } catch (error) {
      console.error('Lỗi tạo thông báo:', error);
    }

    const populatedResult = await result.populate(
      'author',
      'fullName code role avatar',
    );

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

    const authorId = comment.author ? comment.author.toString() : '';
    const postId = comment.post ? comment.post.toString() : '';

    if (authorId === userId) {
      throw new ForbiddenException(
        'Bạn không thể tự đánh giá bình luận của chính mình!',
      );
    }

    const upvotedIndex = comment.upvotedBy.findIndex(
      (id) => id.toString() === userId,
    );
    const downvotedIndex = comment.downvotedBy.findIndex(
      (id) => id.toString() === userId,
    );

    const userObjectId = new Types.ObjectId(userId);

    if (type === 'up') {
      if (upvotedIndex > -1) {
        comment.upvotedBy.splice(upvotedIndex, 1);
        if (authorId) this.usersService.updateReputation(authorId, -10);
      } else {
        comment.upvotedBy.push(userObjectId);
        if (authorId) this.usersService.updateReputation(authorId, 10);

        if (downvotedIndex > -1) {
          comment.downvotedBy.splice(downvotedIndex, 1);
          if (authorId) this.usersService.updateReputation(authorId, 2);
        }

        if (authorId !== userId) {
          this.notificationsService
            .create({
              recipient: authorId as unknown as Types.ObjectId,
              sender: userObjectId as unknown as Types.ObjectId,
              type: 'UPVOTE',
              targetId: postId as unknown as Types.ObjectId,
              targetType: 'Comment',
              title: 'Lượt thích mới',
              message: `Một người vừa thích bình luận của bạn.`,
              link: `/question/${postId}`,
            })
            .catch((err) => console.error('Lỗi tạo thông báo upvote:', err));
        }
      }
    } else {
      if (downvotedIndex > -1) {
        comment.downvotedBy.splice(downvotedIndex, 1);
        if (authorId) this.usersService.updateReputation(authorId, 2);
      } else {
        comment.downvotedBy.push(userObjectId);
        if (authorId) this.usersService.updateReputation(authorId, -2);

        if (upvotedIndex > -1) {
          comment.upvotedBy.splice(upvotedIndex, 1);
          if (authorId) this.usersService.updateReputation(authorId, -10);
        }
      }
    }

    await comment.save();

    const populatedComment = await comment.populate(
      'author',
      'fullName code role avatar',
    );
    this.notificationsService.broadcastUpdateComment(populatedComment);

    return populatedComment;
  }

  async toggleAccept(id: string, userId: string) {
    const comment = await this.commentModel.findById(id).populate('post');
    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    const postAuthorId =
      comment.post && (comment.post as any).author
        ? (comment.post as any).author.toString()
        : '';

    const commentAuthorId = comment.author ? comment.author.toString() : '';
    const postId = comment.post
      ? (comment.post as any)._id?.toString() || comment.post.toString()
      : '';

    if (postAuthorId !== userId) {
      throw new UnauthorizedException(
        'Chỉ tác giả bài viết mới có quyền đánh dấu câu trả lời đúng',
      );
    }

    comment.isAccepted = !comment.isAccepted;
    await comment.save();

    if (comment.isAccepted && commentAuthorId) {
      if (commentAuthorId !== userId) {
        this.usersService.updateReputation(commentAuthorId, 15);

        this.notificationsService
          .create({
            recipient: commentAuthorId as unknown as Types.ObjectId,
            sender: userId as unknown as Types.ObjectId,
            type: 'ACCEPTED',
            targetId: postId as unknown as Types.ObjectId,
            targetType: 'Comment',
            title: 'Câu trả lời được chấp nhận',
            message: `Câu trả lời của bạn đã được chọn làm giải pháp.`,
            link: `/question/${postId}`,
          })
          .catch((err) => console.error(err));
      }
    } else if (!comment.isAccepted && commentAuthorId) {
      if (commentAuthorId !== userId) {
        this.usersService.updateReputation(commentAuthorId, -15);
      }
    }

    const populatedComment = await comment.populate(
      'author',
      'fullName code role avatar',
    );
    this.notificationsService.broadcastUpdateComment(populatedComment);

    return populatedComment;
  }
}
