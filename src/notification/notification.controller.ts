import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ){}

    @Post('/register-token')
    @HttpCode(HttpStatus.OK)
    async registerToken(
        @Body('token') token: string,
        @Body('deviceToken') deviceToken: string,
        @Body('platform') platform: string
    ): Promise<{success: boolean, message: string}> {
        try {
            const saveToken = await this.notificationService.registerToken(token, deviceToken, platform);
            return { success: true, message: saveToken };
        } catch (error) {
            throw new HttpException(
                'Error al registrar el token',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
