import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Chat } from 'src/database/schemas/chat.schema';
import { Message } from 'src/database/schemas/message.schema';
import { User } from 'src/database/schemas/user.schema';
import { ChatEntity } from './entity/chat.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly ChatModel: Model<Chat>,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        @InjectModel(Message.name) private readonly MessageModel: Model<Message>
    ){}

    async getOrCreateChat(user1: string, user2: string): Promise<ChatEntity>{
        try {
            let chat = await this.ChatModel.findOne({
                $or: [
                    { user1: new mongoose.Types.ObjectId(user1), user2: new mongoose.Types.ObjectId(user2)},
                    { user1: new mongoose.Types.ObjectId(user2), user2: new mongoose.Types.ObjectId(user1) }
                ]
            })
            
            if(!chat){
                chat = new this.ChatModel({user1: new mongoose.Types.ObjectId(user1), user2: new mongoose.Types.ObjectId(user2)})
                await chat.save();
                const [sender, receiver] = await Promise.all([
                    this.UserModel.findById(user1),
                    this.UserModel.findById(user2),
                ]);
                const chatId = new mongoose.Types.ObjectId(chat._id.toString());
                sender.chats.push(chatId);
                receiver.chats.push(chatId);
                await Promise.all([sender.save(), receiver.save()]);
            }
            return await chat.populate('messages')

        } catch (error) {
            throw new Error(error)
        }
    }

    async getChat(user1: string, user2: string): Promise<ChatEntity>{
        try {
            let chat = await this.ChatModel.findOne({
                $or: [
                    { user1: new mongoose.Types.ObjectId(user1), user2: new mongoose.Types.ObjectId(user2)},
                    { user1: new mongoose.Types.ObjectId(user2), user2: new mongoose.Types.ObjectId(user1) }
                ]
            })
            if(!chat) return
            if(chat.messages.length > 0) return await chat.populate('messages')
            return
        } catch (error) {
            throw new Error(error)
        }
    }

    async readMessages(user1: string, user2: string) {
        try {
            const chat = await this.ChatModel.findOne({
                $or: [
                    { user1: new mongoose.Types.ObjectId(user1), user2: new mongoose.Types.ObjectId(user2) },
                    { user1: new mongoose.Types.ObjectId(user2), user2: new mongoose.Types.ObjectId(user1) }
                ]
            });
    
            if (chat) {
                // Actualizar directamente los mensajes de 'user2' que no han sido marcados como 'seen'
                const result = await this.MessageModel.updateMany(
                    {
                        sender: new mongoose.Types.ObjectId(user2),
                        receiver: new mongoose.Types.ObjectId(user1),
                        seen: { $ne: true } // Filtrar mensajes no vistos
                    },
                    { $set: { seen: true } } // Actualizar la propiedad 'seen'
                );
    
            }
    
        } catch (error) {
            console.error('Error al leer los mensajes', error);
            throw error;
        }
    }
    
    async getAllChats(id): Promise<any> {
        try {
            const chats = await this.UserModel.findById(id)
            .populate({
                path:  'chats',
                populate:[
                    {path: 'messages'},
                    {path: 'user1', select: 'username avatar lastOnline'},
                    {path: 'user2', select: 'username avatar lastOnline'}
                ]
            })
            
            return chats
        } catch (error) {
            throw new Error(error)
        }
    }
}
