import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(term: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByLoginTerm(term);
    const errorMessage = 'Tài khoản hoặc mật khẩu không chính xác!';

    if (!user) {
      throw new UnauthorizedException(errorMessage);
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
}
