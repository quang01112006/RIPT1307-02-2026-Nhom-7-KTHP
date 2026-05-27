import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Mặc định dùng Gmail
      auth: {
        user: process.env.MAIL_USER || 'youremail@gmail.com', // Cấu hình trong .env
        pass: process.env.MAIL_PASS || 'yourpassword',
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"EduStack Team" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  // Template gửi mã OTP Khôi phục mật khẩu
  async sendOtpEmail(to: string, otp: string) {
    const subject = 'Mã xác thực khôi phục mật khẩu - EduStack';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f7f6; max-width: 600px; margin: 0 auto; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #102a43; margin-bottom: 5px;">EduStack</h2>
          <p style="color: #64748b; margin-top: 0;">Cộng đồng chia sẻ tri thức</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h3 style="color: #102a43; margin-top: 0;">Yêu cầu khôi phục mật khẩu</h3>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Chào bạn,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Dưới đây là mã xác thực OTP của bạn:</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; text-align: center; padding: 15px; border-radius: 6px; margin: 25px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #16a34a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
          <p>© 2026 EduStack. All rights reserved.</p>
        </div>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}
