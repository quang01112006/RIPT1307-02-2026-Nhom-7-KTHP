import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    role: string;
    email: string;
  };
}
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: RequestWithUser) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (req.user.role !== 'admin' && req.user._id !== id)
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.role !== 'admin' && req.user._id !== id) {
      throw new ForbiddenException(
        'Bạn không có quyền sửa thông tin người này',
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return this.usersService.findOne(req.user._id);
  }
}
