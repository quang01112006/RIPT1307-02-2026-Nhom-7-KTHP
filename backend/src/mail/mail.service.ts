import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER || 'youremail@gmail.com',
        pass: (process.env.MAIL_PASS || 'yourpassword').replace(/\s+/g, ''), // Xóa dấu cách nếu có
      },
      tls: {
        rejectUnauthorized: false,
      },

      family: 4,
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

  // Template gửi email thông báo khi có bình luận mới
  async sendCommentNotificationEmail(
    to: string,
    postTitle: string,
    commenterName: string,
    postId: string,
  ) {
    const subject = 'Có người vừa bình luận vào bài viết của bạn - EduStack';
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:8000';
    const postUrl = `${baseUrl}/question/${postId}`;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; background-color: #f8fafc; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin-bottom: 4px; font-size: 26px;">EduStack</h2>
          <p style="color: #64748b; margin-top: 0; font-size: 14px;">Bạn có một thông báo mới</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
          <h3 style="color: #1e293b; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Bình luận mới!</h3>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Chào bạn,</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            <strong>${commenterName}</strong> vừa để lại một bình luận trong bài viết 
            <span style="color: #2563eb; font-style: italic;">"${postTitle}"</span> của bạn.
          </p>
          
          <div style="text-align: center; margin: 35px 0 20px;">
            <a href="${postUrl}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);">
              Xem bình luận ngay
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 30px; text-align: center;">
            Tiếp tục chia sẻ và lan tỏa tri thức cùng cộng đồng EduStack nhé!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
          <p>Email này được gửi tự động từ hệ thống EduStack. Vui lòng không trả lời.</p>
          <p>© 2026 EduStack. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }
}
