import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostDocument } from './schemas/post.schema';

interface PostQuery {
  search?: string;
  tag?: string;
  author?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

import { Comment, CommentDocument } from '../comments/schemas/comment.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const createdPost = new this.postModel({
      ...createPostDto,
      author: userId,
    });
    return createdPost.save();
  }

  async findAll(query: PostQuery): Promise<any> {
    const { search, tag, author, page = 1, limit = 10, sort } = query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    if (author) {
      filter.author = author;
    }

    const skip = (page - 1) * limit;

    // sort theo query
    const sortOption: any = {};
    if (sort === 'views') {
      sortOption.views = -1;
    } else {
      sortOption.createdAt = -1;
    }

    const [data, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'fullName email code role avatar faculty department reputation')
        .sort(sortOption)
        .limit(Number(limit))
        .skip(skip)
        .lean()
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    // Count answers for each post
    const resultWithAnswers = await Promise.all(
      data.map(async (post) => {
        const answersCount = await this.commentModel.countDocuments({ post: post._id });
        return {
          ...post,
          answers: answersCount,
          commentsCount: answersCount,
        };
      })
    );

    return {
      data: {
        result: resultWithAnswers,
        total: total,
      },
    };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'fullName email code role avatar faculty department reputation')
      .exec();

    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  async update(
    id: string,
    updatePostDto: Record<string, any>,
    userId: string,
    isAdmin: boolean,
  ) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    if (!isAdmin && String(post.author as any) !== String(userId)) {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }

    const { title, content, tags, files } = updatePostDto;

    return this.postModel
      .findByIdAndUpdate(id, { title, content, tags, files }, { new: true })
      .exec();
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    if (!isAdmin && String(post.author as any) !== String(userId)) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    return this.postModel.findByIdAndDelete(id).exec();
  }

  async toggleVote(postId: string, userId: string, type: 'up' | 'down') {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    if (String(post.author) === String(userId)) {
      throw new ForbiddenException(
        'Bạn không thể tự đánh giá bài viết của chính mình!',
      );
    }

    const upvotedIndex = post.upvotedBy.findIndex(
      (id) => String(id) === userId,
    );
    const downvotedIndex = post.downvotedBy.findIndex(
      (id) => String(id) === userId,
    );

    if (type === 'up') {
      if (upvotedIndex > -1) {
        post.upvotedBy.splice(upvotedIndex, 1);
        if (post.author)
          this.usersService.updateReputation(String(post.author), -10); // Rút lại upvote
      } else {
        post.upvotedBy.push(userId as any);
        if (post.author)
          this.usersService.updateReputation(String(post.author), 10); // Thêm upvote

        if (downvotedIndex > -1) {
          post.downvotedBy.splice(downvotedIndex, 1);
          if (post.author)
            this.usersService.updateReputation(String(post.author), 2); // Rút lại downvote cũ
        }

        if (String(post.author) !== String(userId)) {
          this.notificationsService
            .create({
              recipient: post.author,
              sender: userId,
              type: 'UPVOTE',
              targetId: post._id,
              targetType: 'Post',
              title: 'Lượt thích mới',
              message: `Một người vừa thích câu hỏi "${post.title}" của bạn.`,
              link: `/question/${post._id}`,
            })
            .catch((err) => console.error('Lỗi tạo thông báo upvote:', err));
        }
      }
    } else {
      if (downvotedIndex > -1) {
        post.downvotedBy.splice(downvotedIndex, 1);
        if (post.author)
          this.usersService.updateReputation(String(post.author), 2); // Rút lại downvote
      } else {
        post.downvotedBy.push(userId as any);
        if (post.author)
          this.usersService.updateReputation(String(post.author), -2); // Bị downvote

        if (upvotedIndex > -1) {
          post.upvotedBy.splice(upvotedIndex, 1);
          if (post.author)
            this.usersService.updateReputation(String(post.author), -10); // Mất upvote cũ
        }
      }
    }

    return post.save();
  }

  async updateResolvedStatus(postId: string, isResolved: boolean) {
    return this.postModel
      .findByIdAndUpdate(postId, { isResolved }, { new: true })
      .exec();
  }
}
