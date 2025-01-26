import { IsArray } from "class-validator";
import mongoose from "mongoose";
import { GameDTO } from "../dto/game.dto";

export class GameEntity extends GameDTO {
    _id

    @IsArray()
    guests: Array<{ user: mongoose.Types.ObjectId; qualified: boolean }>;

    createdAt: Date;
}
