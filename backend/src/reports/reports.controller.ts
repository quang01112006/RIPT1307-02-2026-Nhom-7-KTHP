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
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReportDto: CreateReportDto, @Request() req: any) {
    return this.reportsService.create(createReportDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('page')
  findAll(@Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new Error('Forbidden');
    }
    return this.reportsService.findAll(req.query);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new Error('Forbidden');
    }
    return this.reportsService.updateStatus(id, body.status);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new Error('Forbidden');
    }
    return this.reportsService.remove(id);
  }
}
