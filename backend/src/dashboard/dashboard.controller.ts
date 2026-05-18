import {
  Controller,
  ForbiddenException,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    role: string;
    email: string;
  };
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req: RequestWithUser) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền này');
    }
    return this.dashboardService.getStats();
  }
}
