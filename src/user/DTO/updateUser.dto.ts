import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class SocialLinkDTO {
    @IsString()
    platform: string;

    @IsString()
    url: string;

    @IsBoolean()
    status: boolean;
}

class Location {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    nickname?: string

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @IsString()
    dominant_foot?: string;

    @IsOptional()
    @IsString()
    availability?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    position_on_the_court?: string

    @IsOptional()
    @IsObject()
    @Type(() => Location)
    location?: Location;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialLinkDTO)
    social?: SocialLinkDTO[];

    @IsOptional()
    @IsBoolean()
    isProfileConfigured?: boolean;

    @IsOptional()
    @IsString()
    avatar?: string;

    birthday?

    @IsOptional()
    @IsBoolean()
    online?: boolean;
}
