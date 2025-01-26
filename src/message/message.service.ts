import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Chat } from 'src/database/schemas/chat.schema';
import { Message } from 'src/database/schemas/message.schema';

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private readonly MessageModel: Model<Message>,
        @InjectModel(Chat.name) private readonly ChatModel: Model<Chat>
    ){}

    async createMessage(sender: string, receiver: string, content: string): Promise<any>{
        try {
            const newMessage = new this.MessageModel({ sender: new mongoose.Types.ObjectId(sender), receiver: new mongoose.Types.ObjectId(receiver), content});
            if(!newMessage) throw new Error('No se pudo crear mensaje')
            await newMessage.save();
            let chat = await this.ChatModel.findOne({
                $or: [
                    { user1: new mongoose.Types.ObjectId(sender), user2: new mongoose.Types.ObjectId(receiver)},
                    { user1: new mongoose.Types.ObjectId(receiver), user2: new mongoose.Types.ObjectId(sender) }
                ]
            })
            
            if(!chat) throw new Error('No se encontró chat')
            
            chat.messages.push(new mongoose.Types.ObjectId(newMessage._id.toString()));
            await chat.save();
            const data = await this.ChatModel.findById(chat._id)
            return await data.populate('messages')
        } catch (error) {
            throw new Error(error.message)
        }
    }
}
