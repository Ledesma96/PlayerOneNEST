import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/database/schemas/chat.schema';
import { Message, MessageSchema } from 'src/database/schemas/message.schema';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Chat.name, schema: ChatSchema},
      {name: User.name, schema: UserSchema},
      {name: Message.name, schema: MessageSchema}
    ]),
  ],
  exports: [ChatService],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
