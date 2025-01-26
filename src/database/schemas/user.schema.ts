import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsArray, IsDate, IsObject, IsString } from "class-validator";
import mongoose, { Document } from "mongoose";

@Schema({
    timestamps: true,
    collection: 'user'
})

export class User extends Document {
    @Prop({
        type: String,
        required: true,
        unique: true
    })
    @IsString()
    email: string

    @Prop({
        type: String,
        required: true
    })
    @IsString()
    password: string

    @Prop({
        type: [{ type: mongoose.Types.ObjectId, ref: 'Game' }],
        default: []
    })
    @IsArray()
    games: mongoose.Types.ObjectId[]

    @Prop({
        type: String,
        default:`https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`
    })
    @IsString()
    avatar: string

    @Prop({
        type: String,
        default: null
    })
    @IsString()
    username: string

    @Prop({
        type: String,
    })
    @IsString()
    notification_token: string

    @Prop({
        type: String,
        default: null
    })
    @IsString()
    nickname: string

    @Prop({
        type: String,
    })
    @IsString()
    level: string

    @Prop({
        type: String,
    })
    @IsString()
    dominant_foot: string

    @Prop({
        type: String,
    })
    @IsString()
    availability:string

    @Prop({
        type: String,
    })
    @IsString()
    position:string

    @Prop({
        type: String,
    })
    @IsString()
    position_on_the_court: string

    @Prop({
        type: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    })
    @IsObject()
    location: {
        latitude: number;
        longitude: number;
    };

    @Prop({
        type: String,
    })
    @IsString()
    description: string

    @Prop({
        type: [
            {
                platform: { type: String, enum: ['facebook', 'twitter', 'instagram', 'tiktok'] },
                url: { type: String, required: true },
                status: { type: Boolean, default: true }
            }
        ],
        default: []
    })
    @IsArray()
    social: {
        platform: string;
        url: string;
        status: boolean;
    }[];

    @Prop({ type: [mongoose.Types.ObjectId], ref: 'Chat', default: [] })
    @IsArray()
    chats: mongoose.Types.ObjectId[];
    

    @Prop({
        type: [{ type: mongoose.Types.ObjectId, ref: 'Request' }],
        default: []
    })
    @IsArray()
    requests: mongoose.Types.ObjectId[];

    @Prop({ type: Boolean, default: false })
    isProfileConfigured: boolean;

    @Prop({ type: String, default: null })
    @IsString()
    gender: string

    @Prop({ type: Boolean, default: false })
    @IsString()
    online: boolean;

    @Prop({ type: Date, default: Date.now })
    @IsDate()
    lastOnline: Date;

    @Prop({ type: Date })
    @IsDate()
    birthday: Date

    @Prop({ type: [mongoose.Types.ObjectId], ref: 'Game', default: [] })
    @IsArray()
    invited_game: mongoose.Types.ObjectId[];
}

export const schema = SchemaFactory.createForClass(User);
export const UserSchema = schema;