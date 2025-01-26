import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatEntity } from './entity/chat.entity';

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ){}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getOrCreateChat(@Query('user1') user1: string, @Query('user2') user2: string): Promise<{success: boolean, chat?:ChatEntity}> {
        try {
            const chat = await this.chatService.getOrCreateChat(user1, user2);
            if(!chat) return {success: false}
            return {success: true, chat};
        } catch (error) {
            throw new Error(error.message)
        }
    }

    @Get('get-all-chats')
    @HttpCode(HttpStatus.OK)
    async getAllChats(@Query('id') id: string): Promise<any> {
        try {
            const chats = await this.chatService.getAllChats(id);
            return {success: true, chats};
        } catch (error) {
            throw new Error(error.message)
        }
    }
}
