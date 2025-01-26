import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

class Location {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}

export class GameDTO {
    @IsString()
    title: string;
    
    @IsString()
    position: string;

    @IsOptional()
    @IsObject()
    @Type(() => Location)
    location: Location;

    date

    @IsString()
    time: string;

    @IsNumber()
    camp: number; // Corrige la `N` mayúscula en `Number` a `number`

    @IsMongoId()
    creator: mongoose.Types.ObjectId;

    @IsOptional()
    @IsString()
    status?: string; // El campo `status` puede ser opcional al momento de la creación

    @IsString()
    address: string

    @IsArray()
    @IsString({ each: true })
    applicants: string[];

    @IsString()
    gender_category: string;
}
