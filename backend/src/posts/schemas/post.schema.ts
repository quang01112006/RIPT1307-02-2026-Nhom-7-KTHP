import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  upvotes: number;

  @Prop({ default: 0 })
  downvotes: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
