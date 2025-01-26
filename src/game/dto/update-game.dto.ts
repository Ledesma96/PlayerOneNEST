import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateGameDTO {
    @IsString()
    @IsOptional()
    position?: string

    @IsString()
    @IsOptional()
    location?: string

    @IsOptional()
    date?

    @IsString()
    @IsOptional()
    time?: string
    
    @IsNumber()
    @IsOptional()
    camp?: number

    @IsBoolean()
    @IsOptional()
    qualified?: boolean
}