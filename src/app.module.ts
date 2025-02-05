import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CommentModule } from './comment/comment.module';
import { DatabaseModule } from './database/database.module';
import { DmsModule } from './dms/dms.module';
import { GameModule } from './game/game.module';
import { MailerModule } from './mailer/mailer.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { RequestModule } from './request/request.module';
import { GatewayModule } from './socket/request-gateway.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    DatabaseModule,
    MailerModule,
    GameModule,
    RequestModule,
    GatewayModule,
    ChatModule,
    MessageModule,
    DmsModule,
    CommentModule,
    ScheduleModule.forRoot(),
    NotificationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
