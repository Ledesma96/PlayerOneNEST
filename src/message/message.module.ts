import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/database/schemas/chat.schema';
import { Message, MessageSchema } from 'src/database/schemas/message.schema';
import { MessageService } from './message.service';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: Message.name, schema: MessageSchema},
      {name: Chat.name, schema: ChatSchema}
    ])
  ],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
