import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
    timestamps: true,
    collection: 'diviceToken'
})

export class DeviceToken extends Document{
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    })
    user: Types.ObjectId;

    @Prop({
        type: [String],
        required: true
    })
    expo_push_token: string[]

    @Prop({
        type: String,
        enum: ['android', 'ios'],
        required: true,
    })
    platform: string;
}

export const DiviceSchema = SchemaFactory.createForClass(DeviceToken)