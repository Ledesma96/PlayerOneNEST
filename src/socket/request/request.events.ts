import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { NotificationService } from "src/notification/notification.service";
import { RequestDTO } from "src/request/dto/request.dto";
import { RequestService } from "src/request/request.service";
import { UserService } from "src/user/user.service";
import { sendPushNotifications } from "../utils";

@Injectable()
export class RequestEvents {
    constructor(
        private readonly requestService: RequestService,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService,
    ) {}

    async createRequest(data: RequestDTO, client: Socket, server: Server, userSockets: Map<string, string>) {
        try {
            const request = await this.requestService.createRequest(data);
            
            if (!request) {
                console.log('No se pudo crear la solicitud');
                return;
            }
            const socketIdRecipient = userSockets.get(data.recipient.toString());
            const socketIdSender = userSockets.get(data.sender.toString());

            if (socketIdRecipient) {
                server.to(socketIdRecipient).emit('get-all-requests', request.requests);
            } else {
                console.log(`Recipient not connected: ${data.recipient}`);
            }

            if (socketIdSender) {
                server.to(socketIdSender).emit('update-games', request.games);
            } else {
                console.log(`Sender not connected: ${data.sender}`);
            }
            await sendPushNotifications(this.userService, this.notificationService, data.recipient, 'Nueva Solicitud', 'Tienes una nueva solicitud', { requestId: request.id })
        } catch (error) {
            console.error(error);
            client.emit('error', { message: error.message });
        }
    }

    async responseRequest(data: { request: any; idRequest: string }, client: Socket, userSockets: Map<string, string>){

        if (!data || !data.request || !data.idRequest) {
            client.emit('error', { message: 'Datos inválidos o incompletos' });
            return;
        }
    
        const { request, idRequest } = data;
    
        try {
            // Procesar la respuesta de la solicitud
            const [responseRequest, seenRequest] = await Promise.all([
                this.requestService.responseRequest(request),
                this.requestService.readRequest(idRequest)
            ]);
    
            // Si la solicitud fue aceptada, actualizar el juego para el usuario invitado
            if (request.status === 'accepted') {
                console.log(request.recipient);
                
                await this.userService.invitedGame(request.recipient, request.game);
            }
    
            // Obtener los socket IDs del remitente y destinatario
            const [socketIdSender, socketIdRecipient] = await Promise.all([
                userSockets.get(request.sender.toString()),
                userSockets.get(request.recipient.toString())
            ]);
    
            // Enviar notificaciones y actualizaciones si existen los sockets
            if (socketIdRecipient) {
                client.to(socketIdRecipient).emit('notifications', responseRequest);
            }
    
            if (socketIdSender) {
                client.to(socketIdSender).emit('get-all-requests', seenRequest);
            }
        } catch (error) {
            console.error('Error processing response:', error);
            client.emit('error', { message: 'Ocurrió un error al procesar la solicitud' });
        }
    }
}