import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Post } from '../../posts/schemas/post.schema';
import { Comment } from '../../comments/schemas/comment.schema';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reporter: User;

  @Prop({ required: true, enum: ['Post', 'Comment'] })
  targetType: string;

  @Prop({ type: Types.ObjectId, required: true, refPath: 'targetType' })
  targetId: Types.ObjectId | Post | Comment;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'PENDING', enum: ['PENDING', 'RESOLVED', 'REJECTED'] })
  status: string;

  @Prop()
  adminNote: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
