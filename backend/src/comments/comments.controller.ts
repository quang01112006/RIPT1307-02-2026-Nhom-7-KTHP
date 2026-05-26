/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommentDto: any, @Request() req: any) {
    return this.commentsService.create(createCommentDto, req.user._id);
  }

  @Get('post/:postId/page')
  findAllByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Get('author/:authorId/page')
  findAllByAuthor(@Param('authorId') authorId: string) {
    return this.commentsService.findByAuthor(authorId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAdmin = req.user.role === 'admin';
    return this.commentsService.remove(id, req.user._id, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.commentsService.update(id, content, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/vote')
  toggleVote(
    @Param('id') id: string,
    @Body('type') type: 'up' | 'down',
    @Request() req: any,
  ) {
    return this.commentsService.toggleVote(id, req.user._id as string, type);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/accept')
  toggleAccept(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.commentsService.toggleAccept(id, req.user._id as string);
  }
}
