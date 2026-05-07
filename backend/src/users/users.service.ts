import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email } = createUserDto;

    const isEmailExist = await this.userModel.findOne({ email });
    if (isEmailExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại trên hệ thống!`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return {
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      code: newUser.code,
    };
  }
}
