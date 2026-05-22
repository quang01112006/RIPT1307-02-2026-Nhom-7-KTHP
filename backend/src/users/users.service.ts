import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { Role, User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email, code, role, teacherCode } = createUserDto;
    let assignedRole = Role.STUDENT;

    if (role === Role.TEACHER) {
      const SECRET_KEY = this.configService.get<string>('TEACHER_SECRET_KEY');
      if (teacherCode === SECRET_KEY) {
        assignedRole = Role.TEACHER;
      } else {
        throw new BadRequestException('Mã xác thực không chính xác!');
      }
    }

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
      role: assignedRole,
      password: hashedPassword,
    });
    return {
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      code: newUser.code,
      role: newUser.role,
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

  async findAll() {
    const result = await this.userModel.find().select('-password').exec();
    return {
      data: {
        result,
        total: result.length,
      },
    };
  }

  async toggleActive(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    user.isActive = !user.isActive;
    return user.save();
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async update(id: string, updateUserDto: any) {
    const { password, ...updateData } = updateUserDto as Record<string, any>;

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    return user;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    return user;
  }
}
