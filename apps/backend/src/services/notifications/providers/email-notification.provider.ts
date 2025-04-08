import nodemailer from 'nodemailer';
import { UserService } from '../../user/adapters/input/user.service';
import { Notification } from '../../../domain/entities/notification.entity';
import { INotificationProvider } from './notification-provider.interface';

export class EmailNotificationProvider implements INotificationProvider {
  private transporter: nodemailer.Transporter;

  constructor(private readonly userService: UserService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async send(notification: Notification): Promise<void> {
    const user = await this.getUserEmail(notification.user_id);
    if (!user?.email) {
      throw new Error('User email not found');
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@system.com',
      to: user.email,
      subject: notification.title,
      text: notification.content,
      html: this.generateHtmlContent(notification)
    });
  }

  canHandle(notification: Notification): boolean {
    return notification.type === 'email';
  }

  private async getUserEmail(userId: string): Promise<{ email: string } | null> {
    const user = await this.userService.findById(userId);
    if (!user) return null;
    return { email: user.email };
  }

  private generateHtmlContent(notification: Notification): string {
    // TODO: Implementar plantilla HTML más elaborada
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #333;">${notification.title}</h1>
        <div style="color: #666; line-height: 1.6;">
          ${notification.content}
        </div>
      </div>
    `;
  }
}
