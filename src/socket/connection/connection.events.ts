import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { ChatService } from "src/chat/chat.service";
import { UserService } from "src/user/user.service";
import { getUserIdFromClient, getUserIdFromSocketId } from "../utils";

@Injectable()
export class ConnectionEvents {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly chatService: ChatService,
    ){}

    async on(client: Socket, userSockets: Map<string, string>){
        const userId = await getUserIdFromClient(client, this.authService); // Obtener el userId desde el cliente
            if (userId) {
                userSockets.set(userId.toString(), client.id);
                console.log(`Usuario conectado: ${userId} con socket ID: ${client.id}`);
                const user = await this.userService.updateOnlineUser(userId, {online: true});
                const data = {
                    online: user.online,
                    lastOnline: user.lastOnline,
                    userId: userId
                }
                const chats = await this.chatService.getAllChats(userId)
                for (const chat of chats.chats) {
                    const recipientId = chat.user1.toString() === userId ? chat.user2 : chat.user1;
                    const socketId = userSockets.get(recipientId._id.toString())
                    if (socketId) client.to(socketId).emit('connection', data);
                }
            }
    }
    
    async Off (client: Socket, userSockets: Map<string, string>){
        const userId = getUserIdFromSocketId(userSockets, client.id, );
            if (userId) {
                userSockets.delete(userId);
                console.log(`Usuario desconectado: ${userId}`);
                const user = await this.userService.updateOnlineUser(userId, {online: false})
                const data = {
                    online: user.online,
                    lastOnline: user.lastOnline,
                    userId: userId
                }
                const chats = await this.chatService.getAllChats(userId)
                for (const chat of chats.chats) {
                    const recipientId = chat.user1.toString() === userId ? chat.user2 : chat.user1;
                    const socketId = userSockets.get(recipientId._id.toString())
                    if (socketId) client.to(socketId).emit('connection', data);
                }
            }
    }
}

