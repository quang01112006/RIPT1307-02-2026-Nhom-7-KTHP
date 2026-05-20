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
  page?: number;
  limit?: number;
  sort?: string;
}

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const createdPost = new this.postModel({
      ...createPostDto,
      author: userId,
    });
    return createdPost.save();
  }

  async findAll(query: PostQuery) {
    const { search, tag, page = 1, limit = 10, sort } = query;
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
        .populate('author', 'fullName email code role')
        .sort(sortOption)
        .limit(Number(limit))
        .skip(skip)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    return {
      data: {
        result: data,
        total: total,
      },
    };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'fullName code role')
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

    const upvotedIndex = post.upvotedBy.findIndex(
      (id) => String(id) === userId,
    );
    const downvotedIndex = post.downvotedBy.findIndex(
      (id) => String(id) === userId,
    );

    if (type === 'up') {
      if (upvotedIndex > -1) {
        post.upvotedBy.splice(upvotedIndex, 1);
      } else {
        post.upvotedBy.push(userId as any);
        if (downvotedIndex > -1) post.downvotedBy.splice(downvotedIndex, 1);
      }
    } else {
      if (downvotedIndex > -1) {
        post.downvotedBy.splice(downvotedIndex, 1);
      } else {
        post.downvotedBy.push(userId as any);
        if (upvotedIndex > -1) post.upvotedBy.splice(upvotedIndex, 1);
      }
    }

    return post.save();
  }
}
