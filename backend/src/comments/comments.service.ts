import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(createCommentDto: any, userId: string) {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      author: userId,
    });

    const result = await createdComment.save();
    return result.populate('author', 'fullName code role');
  }

  async findByPost(postId: string) {
    return this.commentModel
      .find({ post: postId } as any)
      .populate('author', 'fullName code role')
      .sort({ createdAt: 1 }) // Bình luận cũ trước, mới sau
      .exec();
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    if (!isAdmin && String(comment.author as any) !== String(userId)) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    return this.commentModel.findByIdAndDelete(id).exec();
  }

  async update(id: string, content: string, userId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    if (String(comment.author as any) !== String(userId)) {
      throw new ForbiddenException('Bạn không có quyền sửa bình luận này');
    }

    return this.commentModel
      .findByIdAndUpdate(id, { content }, { new: true })
      .populate('author', 'fullName code role')
      .exec();
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
      }
    } else {
      if (downvotedIndex > -1) {
        comment.downvotedBy.splice(downvotedIndex, 1);
      } else {
        comment.downvotedBy.push(userId as any);
        if (upvotedIndex > -1) comment.upvotedBy.splice(upvotedIndex, 1);
      }
    }

    return comment.save();
  }
}
