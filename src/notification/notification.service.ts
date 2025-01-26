import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model, Types } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { DeviceToken } from 'src/database/schemas/diviceToken.schema';

@Injectable()
export class NotificationService {

    createNotification = async(message: {}) => {
        return await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        })
    }

    constructor(
        @InjectModel(DeviceToken.name) private readonly DiviceModel: Model<DeviceToken>,
        private readonly AuthService: AuthService
    ){}

    async registerToken(token: string, deviceToken: string, platform: string): Promise<string> {
        try {
            const id = await this.AuthService.verifyToken(token);
            if (!id) throw new Error('Token inválido');
    
            const userId = new Types.ObjectId(id);
    
            // Buscar un documento único
            let existUser = await this.DiviceModel.findOne({ user: userId });
    
            if (!existUser) {
                // Si no existe, crear uno nuevo
                existUser = await this.DiviceModel.create({
                    user: userId,
                    expo_push_token: [deviceToken], // Crear con el token inicial como un array
                    platform, // Crear con el tipo de dispositivo como un string
                });
            } else {
                // Si existe, evitar duplicados en los tokens
                if (!existUser.expo_push_token.includes(deviceToken)) {
                    existUser.expo_push_token.push(deviceToken); // Agregar el nuevo token
                    await existUser.save(); // Guardar los cambios
                }
            }
            return 'Token guardado exitosamente'
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async sendNotificationToUser(
        userId: Types.ObjectId,
        title: string,
        message: string,
        data: any = {}
    ): Promise<void> {
        const userTokens = await this.DiviceModel.findOne({ user: userId });
    
        if (!userTokens || userTokens.expo_push_token.length === 0) {
            console.warn(`No se encontraron tokens para el usuario: ${userId}`);
            return;
        }
    
        for (const token of userTokens.expo_push_token) {
            try {
                const notification = {
                    to: token,
                    sound: userTokens.platform === 'ios' ? 'default' : undefined,
                    title,
                    body: message,
                    data,
                };
    
                await this.createNotification(notification);
            } catch (error) {
                console.error(`Error enviando al token: ${token}`, error);
    
                // Eliminar el token si es inválido
                if (error.response?.data?.error === 'DeviceNotRegistered') {
                    console.log(`Eliminando token inválido: ${token}`);
                    userTokens.expo_push_token = userTokens.expo_push_token.filter(
                        (t) => t !== token,
                    );
                    await userTokens.save();
                }
            }
        }
    }
    
    
}
