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
    const { password, email, code } = createUserDto;

    const orConditions: any[] = [{ email: email.toLowerCase() }];
    if (code) {
      orConditions.push({ code });
    }

    const isExist = await this.userModel.findOne({ $or: orConditions });

    if (isExist) {
      const field =
        isExist.email === email.toLowerCase() ? 'Email' : 'Mã SV/GV';
      throw new BadRequestException(`${field} đã tồn tại trên hệ thống!`);
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

  async findOneByLoginTerm(term: string) {
    return this.userModel
      .findOne({
        $or: [
          { email: { $regex: new RegExp(`^${term}$`, 'i') } },
          { code: { $regex: new RegExp(`^${term}$`, 'i') } },
        ],
      })
      .select('+password');
  }
}
