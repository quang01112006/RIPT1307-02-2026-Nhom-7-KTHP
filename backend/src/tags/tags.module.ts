import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from './schemas/tag.schema';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Post, PostSchema } from '../posts/schemas/post.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Tag.name, schema: TagSchema },
    { name: Post.name, schema: PostSchema },
  ])],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
