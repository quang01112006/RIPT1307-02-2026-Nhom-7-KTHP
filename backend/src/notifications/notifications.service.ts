import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: any) {
    return new this.notificationModel(data).save();
  }

  async findByUser(userId: string) {
    return this.notificationModel
      .find({ recipient: userId as any })
      .sort({ createdAt: -1 })
      .populate('sender', 'fullName avatar')
      .exec();
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
  }
}
