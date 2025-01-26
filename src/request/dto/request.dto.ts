import { IsBoolean, IsString } from "class-validator";

export class RequestDTO {
    @IsString()
    recipient: string;
    
    @IsString()
    game?: string;

    @IsString()
    sender: string;

    @IsString()
    message: string;

    @IsString()
    title: string;
}

export class ResponseRequestDTO extends RequestDTO {
    @IsBoolean()
    seen: boolean;

    @IsString()
    status: string;
}