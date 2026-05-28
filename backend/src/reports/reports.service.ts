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

  async findAll() {
    const data = await this.reportModel
      .find()
      .populate('reporter', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
    return {
      data: {
        result: data,
        total: data.length,
      },
    };
  }

  async updateStatus(id: string, status: string) {
    return this.reportModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
