import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { ChatService } from "src/chat/chat.service";
import { MessageService } from "src/message/message.service";

@Injectable()
export class MessageEvents{
    constructor(
        private readonly messageService: MessageService,
        private readonly chatService: ChatService
    ){}

    async sendMessage(
        data: { sender: string, receiver: string, content: string },
        client: Socket,
        server: Server,
        userSockets: Map<string, string>
    ) {
        try {
            const chat = await this.messageService.createMessage(data.sender, data.receiver, data.content);
            const chatRoom = `chat-${chat._id}`
            if(!client.rooms.has(chatRoom)){
                client.join(chatRoom);
            }
            const socketId = userSockets.get(data.receiver.toString());
            if(socketId){
                const userSocket = server.sockets.sockets.get(socketId);
                if(userSocket){
                    userSocket.join(chatRoom)
                }
            }
            console.log(data.receiver);
            
            const updateChats = await this.chatService.getAllChats(data.receiver.toString())
            console.log(updateChats);
            
            server.to(chatRoom).emit('receive-message', chat);
            client.to(socketId).emit('update-chats', updateChats)
        } catch (error) {
            console.error(error);
            client.emit('error', { message: error.message });
        }
    }

    async readMessage(
        data: { user1: string, user2: string },
        client: Socket,
        server: Server,
        userSockets: Map<string, string>
    ) {
        try {
            const result = await this.chatService.readMessages(data.user1, data.user2);
            const chat = await this.chatService.getChat(data.user1, data.user2);
            const recipient = userSockets.get(data.user2)
            server.to(recipient).emit('read-receipt', chat)
        } catch (error) {
            console.error(error);
            client.emit('error', { message: error.message });
        }
    }
}