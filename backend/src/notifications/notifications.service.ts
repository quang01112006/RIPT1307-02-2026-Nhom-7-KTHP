import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsGateway } from './notifications.gateway';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(data: any) {
    const notification = new this.notificationModel(data);
    await notification.populate('sender', 'fullName avatar');

    const senderName = (notification.sender as any)?.fullName;
    if (senderName) {
      if (notification.message.startsWith('Đã có người ')) {
        notification.message = notification.message.replace('Đã có người ', `${senderName} đã `);
      } else if (notification.message.startsWith('Một người vừa ')) {
        notification.message = notification.message.replace('Một người vừa ', `${senderName} vừa `);
      }
    }

    await notification.save();

    this.notificationsGateway.sendNotificationToUser(
      data.recipient,
      notification,
    );

    return notification;
  }

  broadcastComment(comment: any) {
    this.notificationsGateway.broadcastComment(comment);
  }

  broadcastUpdateComment(comment: any) {
    this.notificationsGateway.broadcastUpdateComment(comment);
  }

  broadcastDeleteComment(commentId: string) {
    this.notificationsGateway.broadcastDeleteComment(commentId);
  }

  async findByUser(userId: string) {
    const result = await this.notificationModel
      .find({ recipient: userId as any })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: -1 })
      .exec();
    return {
      data: {
        result,
        total: result.length,
      },
    };
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
  }

  async markAsUnread(id: string) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: false },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { recipient: userId as any, isRead: false },
      { isRead: true },
    );
  }

  async delete(id: string) {
    return this.notificationModel.findByIdAndDelete(id);
  }

  async deleteAll(userId: string) {
    return this.notificationModel.deleteMany({ recipient: userId as any });
  }
}
