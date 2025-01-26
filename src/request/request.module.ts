import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import GameSchema, { Game } from 'src/database/schemas/game.schema';
import { Request, RequestSchema } from 'src/database/schemas/request.schema';
import { GameModule } from 'src/game/game.module';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Request.name, schema: RequestSchema},
      {name: Game.name, schema: GameSchema}
    ]),
    GameModule
  ],
  providers: [RequestService],
  controllers: [RequestController],
  exports: [RequestService]
})
export class RequestModule {}
