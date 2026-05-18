/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments/schemas/comment.schema';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { Tag, TagDocument } from '../tags/schemas/tag.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
  ) {}

  async getStats() {
    const [totalUsers, totalPosts, totalComments, totalUnansweredPosts] =
      await Promise.all([
        this.userModel.countDocuments().exec(),
        this.postModel.countDocuments().exec(),
        this.commentModel.countDocuments().exec(),
        this.postModel.countDocuments({ isResolved: false }).exec(),
      ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const [postsByDay, commentsByDay] = await Promise.all([
      this.postModel.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      this.commentModel.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const daysInMonth = now.getDate();
    const lineChartData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const postsCount = postsByDay.find((p) => p._id === day)?.count || 0;
      const commentsCount =
        commentsByDay.find((c) => c._id === day)?.count || 0;
      return {
        date: `${day}/${now.getMonth() + 1}`,
        posts: postsCount,
        comments: commentsCount,
      };
    });

    const tagsDistribution = await this.postModel.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recentPosts = await this.postModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'fullName email')
      .select('title createdAt author')
      .exec();

    const recentUsers = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email code role createdAt')
      .exec();

    return {
      data: {
        cards: {
          totalUsers,
          totalPosts,
          totalComments,
          totalUnansweredPosts,
        },
        charts: {
          lineChart: lineChartData,
          pieChart: tagsDistribution.map((t) => ({
            tag: t._id,
            count: t.count,
          })),
        },
        recent: {
          posts: recentPosts,
          users: recentUsers,
        },
      },
    };
  }
}
