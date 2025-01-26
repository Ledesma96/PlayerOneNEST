import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CommentEntity{
    _id
    @IsMongoId()
    authorId: mongoose.Types.ObjectId;

    @IsMongoId()
    recipient: mongoose.Types.ObjectId;

    @IsNumber()
    score: number;

    @IsString()
    @IsOptional()
    commented?: string
}
