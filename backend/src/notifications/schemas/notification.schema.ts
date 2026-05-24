import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  recipient: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: User;

  @Prop({
    required: true,
    enum: ['REPLY', 'UPVOTE', 'NEW_POST', 'ACCEPTED', 'SYSTEM'],
  })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  targetId: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: ['Post', 'Comment', 'User'] })
  targetType: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  link: string;

  @Prop({ default: false, index: true })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
