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

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) {}

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

  async findAll(query: any = {}) {
    const { search, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [result, total] = await Promise.all([
      this.tagModel
        .find(filter)
        .sort({ name: 1 })
        .limit(Number(limit))
        .skip(skip)
        .exec(),
      this.tagModel.countDocuments(filter),
    ]);

    return {
      data: {
        result,
        total,
      },
    };
  }

  async findAllTags() {
    const data = await this.tagModel.find().sort({ name: 1 }).exec();
    return { data };
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
