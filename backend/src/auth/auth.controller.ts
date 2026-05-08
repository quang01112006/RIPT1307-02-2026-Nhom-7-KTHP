import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.identifier,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Tài khoản hoặc mật khẩu không chính xác!',
      );
    }

    return this.authService.login(user);
  }
}
