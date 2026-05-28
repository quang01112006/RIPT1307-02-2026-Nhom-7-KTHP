import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(createReportDto: CreateReportDto, reporterId: string) {
    const report = new this.reportModel({
      ...createReportDto,
      reporter: new Types.ObjectId(reporterId),
    });
    return report.save();
  }

  async findAll(query: any = {}) {
    const { status, page = 1, limit = 10, search } = query;
    const filter: any = {};

    if (status) filter.status = status;
    if (search) filter.reason = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .populate('reporter', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip)
        .exec(),
      this.reportModel.countDocuments(filter),
    ]);

    return {
      data: {
        result: data,
        total: total,
      },
    };
  }

  async updateStatus(id: string, status: string) {
    return this.reportModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async remove(id: string) {
    return this.reportModel.findByIdAndDelete(id).exec();
  }
}
