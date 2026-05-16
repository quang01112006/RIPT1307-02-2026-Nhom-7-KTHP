import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  postCount: number;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
