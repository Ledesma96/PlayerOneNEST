import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsArray, IsBoolean, IsDate, IsMongoId, IsNumber, IsObject, IsString } from "class-validator";
import { Document, Types } from "mongoose";
import * as paginate from 'mongoose-paginate-v2';


@Schema({
    timestamps: true,
    collection:'games'
})
export class Game extends Document {

    @Prop({type: String})
    @IsString()
    title: string;
    
    @Prop({ required: true })
    @IsString()
    position: string;

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
        type: [
            {
                user: { type: Types.ObjectId, ref: 'User', required: true},
                qualified: { type: Boolean, default: false },
            },
        ],
        default: [],
    })
    @IsArray()
    guests: Array<{ user: Types.ObjectId; qualified: boolean }>;

    @Prop({ required: true })
    @IsDate()
    date: Date;

    @Prop({ required: true })
    @IsString()
    time: string;

    @Prop({ required: true, enum: ['pending', 'in progress', 'finished'], default: 'pending' })
    @IsString()
    status: string;

    @Prop({ required: true, enum: [3, 5, 6, 7, 8, 9, 10, 11] })
    @IsNumber()
    camp: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    @IsMongoId()
    creator: Types.ObjectId;

    @Prop({
        type: String
    })
    address: string

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: [String], default: []})
    @IsArray()
    @IsString({ each: true })
    applicants: string[];

    @Prop({
        type: String,
        enum: ['male', 'female', 'any', 'mixed']
    })
    @IsString()
    gender_category: string;

    @Prop({
        type: Boolean,
        default: false
    })
    @IsBoolean()
    qualified: boolean
}

const GameSchema = SchemaFactory.createForClass(Game);
GameSchema.plugin(paginate);
export default GameSchema;
