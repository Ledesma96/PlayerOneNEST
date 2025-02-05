import { Injectable } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameDTO } from "src/game/dto/game.dto";
import { RequestDTO } from "src/request/dto/request.dto";
import { ConnectionEvents } from "./connection/connection.events";
import { GameEvents } from "./game/game.events";
import { MessageEvents } from "./message/message.events";
import { RequestEvents } from "./request/request.events";

@WebSocketGateway(8080, {
    cors: {
        origin: '*',
        credentials: true
    }
})
@Injectable()
export class GatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    userSockets = new Map<string, string>(); // Mapa de usuarios conectados y sus sockets
    constructor(
        private readonly gameEvents: GameEvents,
        private readonly connectionEvents: ConnectionEvents,
        private readonly requestEvents: RequestEvents,
        private readonly messageEvents: MessageEvents
    ){}
    afterInit(server: Server) {
        console.log('WebSocketService inicializado ��');
    }

    async handleConnection(client: Socket): Promise<void>{
        await this.connectionEvents.on(client, this.userSockets)
    }

    async handleDisconnect(client: Socket): Promise<void> {
        await this.connectionEvents.Off(client, this.userSockets)
    }

    @SubscribeMessage('create-game')
    async createGame(
        @MessageBody() data: GameDTO,
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        try {
            this.gameEvents.createGame(data, client, this.server, this.userSockets)
        } catch (error) {
            console.error("Error en createGame:", error);
            client.emit('error', { message: "No se pudo crear la partida" });
        }
        
    }

    @SubscribeMessage('create-request')
    async createRequest(
        @MessageBody() data: RequestDTO,
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        try {
            await this.requestEvents.createRequest(data, client, this.server, this.userSockets)
        } catch (error) {
            throw error
        }
    }

    @SubscribeMessage('respond-request')
    async responseRequest(
        @MessageBody() data: { request: any; idRequest: string },
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        try {
            await this.requestEvents.responseRequest(data, client, this.userSockets)
        } catch (error) {
            throw error
        }
    }

    @SubscribeMessage('send-message')
    async sendMessage(
        @MessageBody() data: { sender: string, receiver: string, content: string },
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        try {
            await this.messageEvents.sendMessage(data, client, this.server, this.userSockets)
        } catch (error) {
            throw error
        }
    }

    @SubscribeMessage('read-message')
    async readMessage(
        @MessageBody() data: { user1: string, user2: string },
        @ConnectedSocket() client: Socket
    ): Promise<void>{
        try {
            await this.messageEvents.readMessage(data, client, this.server, this.userSockets)
        } catch (error) {
            console.log("Error al leer los mensaje:", error);
            client.emit('error', { message: "No se pudo " });
        }
    }
}