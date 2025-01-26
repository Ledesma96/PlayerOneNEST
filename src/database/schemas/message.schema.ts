import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
    timestamps: true,
    collection: 'message'
})
export class Message extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sender: Types.ObjectId; // Usuario que envía el mensaje

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    receiver: Types.ObjectId; // Usuario que recibe el mensaje

    @Prop({ required: true })
    content: string; // Contenido del mensaje

    @Prop({ type: Date, default: Date.now })
    sentAt: Date; // Hora en la que se envió el mensaje

    @Prop({type: Boolean, default: false})
    seen: boolean; // Bandera para indicar si el mensaje ha sido visto por el receptor
}

export const MessageSchema = SchemaFactory.createForClass(Message);
