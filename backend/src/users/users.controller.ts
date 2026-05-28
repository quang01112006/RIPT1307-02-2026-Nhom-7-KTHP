import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

import { Role } from './schemas/user.schema';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    role: Role;
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
  @Get('page')
  findAll(@Request() req: RequestWithUser, @Query() query: any) {
    if (req.user.role !== Role.ADMIN)
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  toggleActive(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (req.user.role !== Role.ADMIN)
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (req.user.role !== Role.ADMIN && req.user._id !== id)
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.role !== Role.ADMIN && req.user._id !== id) {
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

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin công khai của 1 user',
  })
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmarks/:postId')
  @ApiOperation({ summary: 'Lưu hoặc bỏ lưu bài viết' })
  toggleBookmark(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Request() req: RequestWithUser,
  ) {
    if (req.user._id !== id)
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.toggleBookmark(id, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/bookmarks')
  @ApiOperation({ summary: 'Lấy danh sách bài viết đã lưu' })
  getBookmarks(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (req.user._id !== id)
      throw new ForbiddenException('Thao tác không được phép');
    return this.usersService.getBookmarks(id);
  }
}
