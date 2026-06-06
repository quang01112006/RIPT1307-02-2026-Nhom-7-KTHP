import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(term: string, pass: string): Promise<any> {
    const cleanTerm = term?.trim();
    const user = await this.usersService.findOneByLoginTerm(cleanTerm);
    const errorMessage = 'Tài khoản hoặc mật khẩu không chính xác!';

    if (!user) {
      throw new UnauthorizedException(errorMessage);
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa bởi Quản trị viên!');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user.toObject();
      return result;
    }
    throw new UnauthorizedException(errorMessage);
  }

  async login(user: User & { _id: string }) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        code: user.code,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);

    await this.usersService.updateOtp(user._id.toString(), otp, expires);
    const isSent = await this.mailService.sendOtpEmail(email, otp);
    if (!isSent) {
      throw new BadRequestException('Không thể gửi email OTP, vui lòng thử lại sau.');
    }

    return { message: 'Đã gửi mã OTP đến email của bạn' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.usersService.updatePasswordAndClearOtp(
      user._id.toString(),
      hashedPassword,
    );

    return { message: 'Đổi mật khẩu thành công' };
  }
}
