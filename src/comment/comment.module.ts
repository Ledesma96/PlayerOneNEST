import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Comments, CommentsSchema } from 'src/database/schemas/comments.schema';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: Comments.name, schema: CommentsSchema},
    ]),
    UserModule,
    GameModule,
    AuthModule
  ],
  providers: [CommentService],
  controllers: [CommentController]
})
export class CommentModule {}
