import { Types } from "mongoose";
import { NotificationService } from "src/notification/notification.service";
import { UserService } from "src/user/user.service";

const deg2rad = (deg: number): number =>{
    return deg * (Math.PI / 180);
}

export const calculateDistance = (lat1: number, long1: number, lat2: number, long2: number): number =>{
    const R = 6371;
    const latitud_distance = deg2rad(lat2 - lat1);
    const longitud_distance = deg2rad(long2 - long1);

    const a = Math.sin(latitud_distance / 2) * Math.sin(latitud_distance / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(longitud_distance / 2) * Math.sin(longitud_distance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function sendPushNotifications(
    userService: UserService,
    notificationService: NotificationService,
    userId: string,
    title: string,
    message: string,
    data: {},
): Promise<void> {
    try {
        const user = await userService.getUserById(userId);
        if (user.online) return;

        const id = new Types.ObjectId(userId);
        await notificationService.sendNotification(id, title, message, data);
    } catch (error) {
        throw error;
    }
}

import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

/**
 * Obtiene el userId desde el socket (usando un token de autenticación)
 */
export async function getUserIdFromClient(
    client: Socket,
    authService: AuthService
): Promise<string | undefined> {
    try {
        const token = client.handshake.query.token as string;
        
        if (!token || typeof token !== 'string') {
            console.error('Token no proporcionado en el handshake');
            return undefined;
        }

        const clientId = await authService.verifyToken(token);
        
        if (!clientId) {
            console.error('Token inválido o expirado');
            return undefined;
        }

        return clientId._id;
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return undefined;
    }
}

/**
 * Obtiene el userId a partir de un socketId
 * @param userSockets - Mapa que asocia userId con socketId
 * @param socketId - ID del socket a buscar
 * @returns El userId si se encuentra, undefined si no
 */
export function getUserIdFromSocketId(
    userSockets: Map<string, string>,
    socketId: string
): string | undefined {
    for (const [userId, id] of userSockets.entries()) {
        if (id === socketId) return userId;
    }
    return undefined;
}

