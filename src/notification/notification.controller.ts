import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('api/notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ){}

    @Post('/register-token')
    @HttpCode(HttpStatus.OK)
    async registerToken(
        @Body() body: { token: string; deviceToken: string; platform: string }
    ): Promise<{ success: boolean; message: string }> {
        const { token, deviceToken, platform } = body;
        console.log('Body parameters:', typeof(token), typeof(deviceToken), typeof(platform));
        try {
            const saveToken = await this.notificationService.registerToken(token, deviceToken, platform);
            return { success: true, message: saveToken };
        } catch (error) {
            console.log(error.message);
            
            throw new HttpException(
                'Error al registrar el token',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('/send-notification')
    @HttpCode(HttpStatus.OK)
    async sendNotification(
        @Body() body: { token: string; title: string; message: string; data: any }
    ): Promise<{ success: boolean; message: string }> {
        const { token, title, message, data } = body;
        console.log('Body parameters:', typeof(token), typeof(title), typeof(message), typeof(data));
        
        try {
            await this.notificationService.sendNotificationToUser(token, title, message, data);
            return { success: true, message: 'Notificación enviada exitosamente' };
        } catch (error) {
            console.log(error.message);
            
            throw new HttpException(
                'Error al enviar la notificación',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
