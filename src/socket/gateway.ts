import { InjectModel } from '@nestjs/mongoose';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';
import { Request } from 'src/database/schemas/request.schema';
import { User } from 'src/database/schemas/user.schema';
import { GameDTO } from 'src/game/dto/game.dto';
import { GameService } from 'src/game/game.service';
import { MessageService } from 'src/message/message.service';
import { NotificationService } from 'src/notification/notification.service';
import { RequestDTO } from 'src/request/dto/request.dto';
import { RequestService } from 'src/request/request.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway(8080, {
    cors: {
        origin: '*',
        credentials: true
    }
})

export class Gateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    // Mapa para almacenar los sockets de los usuarios conectados
    private userSockets = new Map<string, string>(); // <userId, socketId>

    afterInit(server: Server) {
        console.log('arranca socket');
    }

    async handleConnection(client: Socket): Promise<void> {
        const userId = await this.getUserIdFromClient(client); // Obtener el userId desde el cliente
        if (userId) {
            this.userSockets.set(userId.toString(), client.id);
            console.log(`Usuario conectado: ${userId} con socket ID: ${client.id}`);
            const user = await this.UserModel.findById(userId);
            user.online = true;
            user.save();
            const data = {
                online: user.online,
                lastOnline: user.lastOnline,
                userId: userId
            }
            const chats = await this.chatService.getAllChats(userId)
            for (const chat of chats.chats) {
                const recipientId = chat.user1.toString() === userId ? chat.user2 : chat.user1;
                const socketId = this.userSockets.get(recipientId._id.toString())
                if (socketId) client.to(socketId).emit('connection', data);
            }
        }
    }

    async handleDisconnect(client: Socket): Promise<void> {
        const userId = this.getUserIdFromSocketId(client.id);
        if (userId) {
            this.userSockets.delete(userId);
            console.log(`Usuario desconectado: ${userId}`);
            const user = await this.UserModel.findById(userId);
            user.online = false;
            user.lastOnline = new Date();
            user.save();
            const data = {
                online: user.online,
                lastOnline: user.lastOnline,
                userId: userId
            }
            const chats = await this.chatService.getAllChats(userId)
            for (const chat of chats.chats) {
                const recipientId = chat.user1.toString() === userId ? chat.user2 : chat.user1;
                const socketId = this.userSockets.get(recipientId._id.toString())
                if (socketId) client.to(socketId).emit('connection', data);
            }
        }
    }

    constructor(
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        @InjectModel(Request.name) private readonly RequestModel: Model<Request>,
        private readonly gameService: GameService,
        private readonly authService: AuthService,
        private readonly requestService: RequestService,
        private readonly messageService: MessageService,
        private readonly chatService: ChatService,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService
    ) { }

    // Función auxiliar para convertir grados a radianes
    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    private calculateDistance(lat1: number, long1: number, lat2: number, long2: number): number {
        const R = 6371;
        const latitud_distance = this.deg2rad(lat2 - lat1);
        const longitud_distance = this.deg2rad(long2 - long1);

        const a = Math.sin(latitud_distance / 2) * Math.sin(latitud_distance / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(longitud_distance / 2) * Math.sin(longitud_distance / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Obtener userId desde el cliente (ejemplo: token o parámetro de conexión)
    private async getUserIdFromClient(client: Socket): Promise<string | undefined> {
        try {
            // Obtén el token desde la consulta del handshake
            const token = client.handshake.query.token as string;  // Asegúrate de que el token es el valor correct
            
            if (!token) {
                console.error('Token no proporcionado en el handshake');
                return undefined;
            }

            // Verifica el token y obtiene el userId
            const clientId = await this.authService.verifyToken(token);
            
            if (!clientId) {
                console.error('Token inválido o expirado');
                return undefined;
            }

            return clientId._id;  // Devuelve el userId si la verificación fue exitosa
        } catch (error) {
            console.error('Error al verificar el token:', error);
            return undefined;
        }
    }

    // Obtener userId usando socketId
    private getUserIdFromSocketId(socketId: string): string | undefined {
        for (const [userId, id] of this.userSockets.entries()) {
            if (id === socketId) return userId;
        }
        return undefined;
    }

    @SubscribeMessage('create-game')
async createGame(
    @MessageBody() data: GameDTO,
    @ConnectedSocket() client: Socket
): Promise<void> {
    try {
        const { games, users, user, gameId } = await this.gameService.createGame(data);

        // Crear un canal único para el juego
        const gameRoom = `game-${gameId}`;
        client.join(gameRoom);

        // Obtener usuarios cercanos al creador del juego
        const nearbyUsers = users.filter(u =>
            this.calculateDistance(
                user.location.latitude,
                user.location.longitude,
                u.location.latitude,
                u.location.longitude
            ) <= 2
        );

        // Filtrar los juegos cercanos para cada usuario
        nearbyUsers.forEach(async u => {
            const socketId = this.userSockets.get(u._id.toString()); // Obtener socket del usuario
            if (socketId) {
                const userSocket = this.server.sockets.sockets.get(socketId); // Obtener socket activo
                if (userSocket) {
                    userSocket.join(gameRoom); // Añadir usuario al canal

                    // Juegos cercanos para este usuario
                    const userGames = games.filter(game =>
                        this.calculateDistance(
                            game.location.latitude,
                            game.location.longitude,
                            u.location.latitude,
                            u.location.longitude
                        ) <= 2
                    );
                    this.notificationService.sendNotification(
                        u._id,
                        'Nueva solicitud de partida',
                        'Tienes una nueva solicitud de partida cercana a ti.',
                        {
                            action: 'Nuevo', url: 'https://yourdomain.com/promo'
                        }
                    );

                    // Emitir los juegos cercanos al usuario
                    this.server.to(userSocket.id).emit('send-games', userGames.reverse());
                }
            }
        });

        // Emitir juegos al creador
        const creatorGames = games.filter(game =>
            this.calculateDistance(
                game.location.latitude,
                game.location.longitude,
                user.location.latitude,
                user.location.longitude
            ) <= 2
        );
        this.server.to(client.id).emit('send-games', creatorGames.reverse());

    } catch (error) {
        console.error(error);
        client.emit('error', { message: error.message });
    }
}


    @SubscribeMessage('create-request')
    async createRequest(
        @MessageBody() data: RequestDTO,
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        try {
            const request = await this.requestService.createRequest(data);
            
            if (!request) {
                console.log('No se pudo crear la solicitud');
                return;
            }
            const socketIdRecipient = this.userSockets.get(data.recipient.toString());
            const socketIdSender = this.userSockets.get(data.sender.toString());

            if (socketIdRecipient) {
                this.server.to(socketIdRecipient).emit('get-all-requests', request.requests);
            } else {
                console.log(`Recipient not connected: ${data.recipient}`);
            }

            if (socketIdSender) {
                this.server.to(socketIdSender).emit('update-games', request.games);
            } else {
                console.log(`Sender not connected: ${data.sender}`);
            }

        } catch (error) {
            console.error(error);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('respond-request')
async responseRequest(
    @MessageBody() data: { request: any; idRequest: string },
    @ConnectedSocket() client: Socket
): Promise<void> {
    // Validación de datos de entrada
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
            this.userSockets.get(request.sender.toString()),
            this.userSockets.get(request.recipient.toString())
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


    @SubscribeMessage('send-message')
    async sendMessage(
        @MessageBody() data: { sender: string, receiver: string, content: string },
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        try {
            const chat = await this.messageService.createMessage(data.sender, data.receiver, data.content);
            const chatRoom = `chat-${chat._id}`
            if(!client.rooms.has(chatRoom)){
                client.join(chatRoom);
            }
            const socketId = this.userSockets.get(data.receiver.toString());
            if(socketId){
                const userSocket = this.server.sockets.sockets.get(socketId);
                if(userSocket){
                    userSocket.join(chatRoom)
                }
            }
            console.log(data.receiver);
            
            const updateChats = await this.chatService.getAllChats(data.receiver.toString())
            console.log(updateChats);
            
            this.server.to(chatRoom).emit('receive-message', chat);
            client.to(socketId).emit('update-chats', updateChats)
        } catch (error) {
            console.error(error);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('read-message')
    async readMessage(
        @MessageBody() data: { user1: string, user2: string },
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        try {
            const result = await this.chatService.readMessages(data.user1, data.user2);
            const chat = await this.chatService.getChat(data.user1, data.user2);
            const recipient = this.userSockets.get(data.user2)
            this.server.to(recipient).emit('read-receipt', chat)
        } catch (error) {
            console.error(error);
            client.emit('error', { message: error.message });
        }
    }
}