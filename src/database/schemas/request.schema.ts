import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsBoolean, IsDate, IsEnum, IsMongoId, IsString } from "class-validator";
import { Document, Types } from "mongoose";

@Schema({
    timestamps: true,
    collection:'request'
})
export class Request extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @IsMongoId()
    recipient: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @IsMongoId()
    sender: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Game'})
    @IsMongoId()
    game: Types.ObjectId;

    @Prop({ required: true, enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
    @IsEnum(['pending', 'accepted', 'rejected'])
    status: string;
    
    @Prop({ default: Date.now })
    @IsDate()
    requestedAt: Date;

    @Prop({
        type: Boolean,
        default: false,
    })
    @IsBoolean()
    seen: boolean;

    @Prop({
        type: String
    })
    @IsString()
    message: string;

    @Prop({
        type: String,
    })
    @IsString()
    title: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
