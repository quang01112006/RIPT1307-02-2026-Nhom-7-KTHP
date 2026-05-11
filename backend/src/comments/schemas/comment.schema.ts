import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Post } from '../../posts/schemas/post.schema';
import { User } from '../../users/schemas/user.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  post: Post;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null })
  parent: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: ['ANSWER', 'COMMENT'], default: 'COMMENT' })
  type: string;

  @Prop({ default: false })
  isAccepted: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  upvotedBy: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  downvotedBy: mongoose.Types.ObjectId[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
