import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNumber, IsString } from "class-validator";
import mongoose, { Document } from "mongoose";

@Schema({
    collection: 'comments',
    timestamps: true
})

export class Comments extends Document{
    @Prop({
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    })
    authorId: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    })
    recipient: mongoose.Types.ObjectId

    @Prop({
        type: String,
        required: true
    })
    @IsString()
    comment: string;

    @Prop({
        type: Number,
        min: 1,
        max: 5,
        required: true
    })
    @IsNumber()
    score: number;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments)