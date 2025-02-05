import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly saltRounds = 10

    constructor(
        private readonly jwtService: JwtService
    ){}

    async hashPassword (password: string): Promise<string>{
        const salt = await bcrypt.genSalt(this.saltRounds)
        const hash = await bcrypt.hash(password, salt);
        return hash
    }

    async comparePasswords (password: string, hashedPassword: string): Promise<boolean>{
        return await bcrypt.compare(password, hashedPassword)
    }

    async generateToken(payload: { _id: string}): Promise<string> {
        const token = await this.jwtService.signAsync(payload)
        return token
    }

    async generateTokenResetPassword (userId: string): Promise<string> {
        const token = await this.jwtService.signAsync(
            {
                userId,
                purpose: 'password_reset',
                expiresId: '15m'
            }
        )
        return token
    }

    async verifyTokenResetPassword (token: string): Promise<any> {
        try {
            const decoded = await this.jwtService.verifyAsync(token)
            if(decoded.purpose !== 'password_reset'){
                throw new Error('Token con propósito inválido');
            }
            return decoded
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
        
    }

    async verifyToken(token: string): Promise<{ _id: string }> {
        try {
            const decoded = await this.jwtService.verifyAsync(token)
            return decoded as { _id: string };
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }
}
