import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { GameDTO } from "src/game/dto/game.dto";
import { GameService } from "src/game/game.service";
import { NotificationService } from "src/notification/notification.service";
import { calculateDistance } from "../utils";

@Injectable()
export class GameEvents {
    constructor(
        private readonly gameService: GameService,
        private readonly notificationService: NotificationService,
    ) {}

    async createGame( data: GameDTO, client: Socket, server: Server, userSockets: Map<string, string>): Promise<void>{
            try {
                const { games, users, user, gameId } = await this.gameService.createGame(data);
        
                // Crear un canal único para el juego
                const gameRoom = `game-${gameId}`;
                client.join(gameRoom);
        
                const usersDisconnected = users.filter(user => user.online === false )
                
                // Obtener usuarios desconectados y cercanos al creador del juego
                const nearbyUsers = usersDisconnected.filter(u =>
                    calculateDistance(
                        user.location.latitude,
                        user.location.longitude,
                        u.location.latitude,
                        u.location.longitude
                    ) <= 2
                );
        
                // Filtrar los juegos cercanos para cada usuario
                nearbyUsers.forEach(async u => {
                    const socketId = userSockets.get(u._id.toString()); // Obtener socket del usuario
                    if (socketId) {
                        const userSocket = server.sockets.sockets.get(socketId); // Obtener socket activo
                        if (userSocket) {
                            userSocket.join(gameRoom); // Añadir usuario al canal
        
                            // Juegos cercanos para este usuario
                            const userGames = games.filter(game =>
                                calculateDistance(
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
                            server.to(userSocket.id).emit('send-games', userGames.reverse());
                        }
                    }
                });
        
                // Emitir juegos al creador
                const creatorGames = games.filter(game =>
                    calculateDistance(
                        game.location.latitude,
                        game.location.longitude,
                        user.location.latitude,
                        user.location.longitude
                    ) <= 2
                );
                server.to(client.id).emit('send-games', creatorGames.reverse());
        
            } catch (error) {
                console.error(error);
                client.emit('error', { message: error.message });
            }
        }
}

