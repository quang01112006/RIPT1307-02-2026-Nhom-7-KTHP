/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    // req.user được tạo ra bởi JwtAuthGuard sau khi giải mã token
    return this.postsService.create(createPostDto, req.user._id);
  }

  @Get('page')
  findAll(@Query() query: any) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    const isAdmin = req.user.role === 'admin';
    return this.postsService.update(id, updatePostDto, req.user._id, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === 'admin';
    return this.postsService.remove(id, req.user._id, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/vote')
  toggleVote(
    @Param('id') id: string,
    @Body('type') type: 'up' | 'down',
    @Request() req: any,
  ) {
    return this.postsService.toggleVote(id, req.user._id, type);
  }
}
