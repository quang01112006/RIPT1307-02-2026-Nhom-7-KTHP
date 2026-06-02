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
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const [postsByDay, commentsByDay] = await Promise.all([
      this.postModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: now } } },
        {
          $group: {
            _id: { $dateToString: { format: '%d/%m', date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' } },
            count: { $sum: 1 },
          },
        },
      ]),
      this.commentModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: now } } },
        {
          $group: {
            _id: { $dateToString: { format: '%d/%m', date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const lineChartData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const postsCount = postsByDay.find((p) => p._id === dateKey)?.count || 0;
      const commentsCount = commentsByDay.find((c) => c._id === dateKey)?.count || 0;
      
      return {
        date: `${d.getDate()}/${d.getMonth() + 1}`,
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
      .populate('author', 'fullName email avatar')
      .select('title createdAt author')
      .exec();

    const recentUsers = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email code role avatar createdAt')
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
