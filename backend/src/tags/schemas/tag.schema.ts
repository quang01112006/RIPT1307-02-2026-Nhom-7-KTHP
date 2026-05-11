import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  postCount: number;
}
