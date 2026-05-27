import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Role {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ trim: true, required: true })
  fullName: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ default: Role.STUDENT, type: String, enum: Role })
  role: Role;

  @Prop({ default: true })
  isActive: boolean; // Xác định acc bị khóa hay không

  @Prop()
  faculty: string; // Khoa (để sau này lọc bài đăng/giảng viên theo khoa)

  @Prop({ default: 0 })
  reputation: number; // Điểm uy tín (để làm tính năng Vote)

  @Prop({ unique: true, trim: true, sparse: true })
  code?: string; // Mã sv hoặc mã gv

  @Prop()
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ type: Object, default: {} })
  socials: Record<string, string>;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [{ type: String, ref: 'Post' }], default: [] })
  bookmarks: string[];

  @Prop()
  otpCode?: string;

  @Prop()
  otpExpires?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
