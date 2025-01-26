import { IsNumber, IsOptional, IsString } from "class-validator";

export class CommentDTO {
    @IsString()
    authorId: string;

    @IsString()
    recipient: string;

    @IsNumber()
    score: number;

    @IsString()
    @IsOptional()
    commented?: string
}