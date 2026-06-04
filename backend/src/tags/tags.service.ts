/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag, TagDocument } from './schemas/tag.schema';
import { Post, PostDocument } from '../posts/schemas/post.schema';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    try {
      const createdTag = new this.tagModel(createTagDto);
      return await createdTag.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Tag đã tồn tại');
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 12) {
    const result = await this.tagModel
      .find()
      .sort({ postCount: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    
    // Cập nhật postCount động từ posts collection
    const tagsWithCount = await Promise.all(
      result.map(async (tag) => {
        const count = await this.postModel.countDocuments({ tags: tag.name }).exec();
        return {
          ...tag.toObject(),
          postCount: count,
        };
      })
    );
    
    const total = await this.tagModel.countDocuments().exec();
    
    return {
      data: {
        records: tagsWithCount,
        total,
        page,
        limit,
      },
    };
  }

  async findAllTags() {
    const tags = await this.tagModel.find().sort({ name: 1 }).exec();
    
    // Cập nhật postCount động từ posts collection
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const count = await this.postModel.countDocuments({ tags: tag.name }).exec();
        return {
          ...tag.toObject(),
          postCount: count,
        };
      })
    );
    
    return { data: tagsWithCount };
  }

  async getPostsByTag(tagName: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const posts = await this.postModel
      .find({ tags: tagName })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName email code role avatar faculty department reputation')
      .exec();

    const total = await this.postModel.countDocuments({ tags: tagName }).exec();

    return {
      data: {
        result: posts,
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: string) {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) throw new NotFoundException('Không tìm thấy Tag');
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const updatedTag = await this.tagModel
      .findByIdAndUpdate(id, updateTagDto, { new: true })
      .exec();
    if (!updatedTag) throw new NotFoundException('Không tìm thấy Tag');
    return updatedTag;
  }

  async remove(id: string) {
    const result = await this.tagModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Không tìm thấy Tag');
    return result;
  }
}
