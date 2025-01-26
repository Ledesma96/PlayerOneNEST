import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import GameSchema, { Game } from 'src/database/schemas/game.schema';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Game.name, schema: GameSchema},
      {name: User.name, schema: UserSchema}
    ]),
    AuthModule
  ],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
