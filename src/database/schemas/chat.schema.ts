import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsArray, IsDate } from "class-validator";
import { Document, Types } from "mongoose";

@Schema({
    timestamps: true,
    collection: 'chat'
})
export class Chat extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user1: Types.ObjectId; // Primer usuario en el chat

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user2: Types.ObjectId; // Segundo usuario en el chat

    @Prop({ type: [Types.ObjectId], ref: 'Message', default: [] })
    @IsArray()
    messages: Types.ObjectId[]; // Array de mensajes en el chat

    @Prop({ type: Date, default: Date.now })
    @IsDate()
    lastUpdated: Date; // Última vez que se actualizó el chat
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
