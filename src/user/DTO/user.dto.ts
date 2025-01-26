import { IsNotEmpty, IsString } from "class-validator";

export class UserDTO {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}