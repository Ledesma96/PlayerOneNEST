import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/database/schemas/user.schema';
import { MailerService } from 'src/mailer/mailer.service';
import { UpdateUserDTO } from './DTO/updateUser.dto';
import { UserDTO } from './DTO/user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        private readonly AuthService: AuthService,
        private readonly MailerService: MailerService
    ){}

    async createUser(data: UserDTO): Promise<Boolean> {
        try {
            const user = {
                email: data.email,
                password: await this.AuthService.hashPassword(data.password)
            }
            const newUser = new this.UserModel(user);
            await newUser.save();
            if(newUser && newUser._id){
                return true
            }
            return false
        } catch (error) {
            throw new Error(error)
        }
    }

    async login(data: UserDTO): Promise<{token: string, success: boolean, response: object}> {
        try {
            const existUser = await this.UserModel.findOne({ email: data.email });
            if (!existUser) {
                throw new Error('User not found');
            }
    
            // Compara la contraseña proporcionada con la contraseña del usuario encontrado
            const matchPassword = await this.AuthService.comparePasswords(data.password, existUser.password);
            const response = {
                isProfileConfigured: existUser.isProfileConfigured,
                username: existUser.username,
                nickname: existUser.nickname,
                gender: existUser.gender,
                level: existUser.level,
                avatar: existUser.avatar,
                dominant_foot: existUser.dominant_foot,
                availability: existUser.availability,
                position: existUser.position,
                position_on_the_court: existUser.position_on_the_court,
                location: existUser.location,
                description: existUser.description,
                social: existUser.social,
                birthday: existUser.birthday,
                email: existUser.email
            }
            if (!matchPassword) {
                throw new Error('Incorrect password');
            }
    
            // Genera el token con el payload correcto
            const payload = {_id: existUser._id.toString()};
            
            const token = await this.AuthService.generateToken(payload);
            
            return {token: token, response , success: true};
        } catch (error) {
            // Lanza un error personalizado o lo registra
            throw new Error(error.message || 'An error occurred during login');
        }
    }
    
    async getUserById(userId: string): Promise<User | null> {
        try {
            const user = await this.UserModel.findById(userId);
            return user;
        } catch (error) {
            throw new Error(error);
        }
    }

    async getUserId(token: string): Promise<string>{
        try {
            const decoded = await this.AuthService.verifyToken(token);
            if(!decoded){
                throw new Error('Token invalido')
            }
            return decoded._id
        } catch (error) {
            throw new Error(error)
        }
    }

    async getUserProfile(userId: string): Promise<object>{
        try {
            const user = await this.UserModel.findById(userId);
            if(!user){
                throw new Error('El usuario no fue encontrado')
            }
            const data = {
                avatar: user.avatar,
                position_on_the_court: user.position_on_the_court,
                username: user.username,
                position: user.position,
                location: user.location,
                level: user.level,
                description: user.description,
                dominant_foot: user.dominant_foot,
                social: user.social,
                nickname: user.nickname,
                lastOnline: user.lastOnline,
                online: user.online,
            }
            return data
        } catch (error) {
            throw error
        }
    }

    async sendMailChangePassword(email: string, id:string): Promise<boolean> {
        try {
            const token = await this.AuthService.generateTokenResetPassword(id);
            const url = `http://127.0.0.1:3000/api/user/change-password/${token}`;
            const subject = 'Restablece tu contraseña - PlayerOne'
            const user = await this.UserModel.findOne({email: email})
            const children = `
            <p>Para cambiar tu contraseña, haz click en el siguiente enlace:</p>
            <a href='${url}'>Restablecer contraseña</a>
            <p>Si no has solicitado un cambio de contraseña, ignora este correo electrónico.</p>`
            const response = await this.MailerService.sendMail(email, subject, children, user.username)
            
            return response
        } catch (error) {
            throw new Error(error)
        }
    }

    async recuperatePassword(data: {email: string, password: string}, token: string): Promise<{message: string}>{
        try {
            const verifyToken = await this.AuthService.verifyTokenResetPassword(token)
            
            const user = await this.UserModel.findOne({email: data.email})
            if (!user) {
                return {message: 'Usuario no encontrado'}
            }
            if(verifyToken.userId === user._id.toString()){
                const hashedPassword = await this.AuthService.hashPassword(data.password)
                user.password = hashedPassword
                await user.save()
                return {message: 'Contraseña cambiada exitosamente'}
            }
            return {message: 'Token inválido'}
        } catch (error) {
            throw new Error(error)
        }
    }

    async changePassword(data: {email: string, password: string, newPassword: string}): Promise<Boolean> {
        try {
            const user = await this.UserModel.findOne({email: data.email});
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const matchPassword = await this.AuthService.comparePasswords(data.password, user.password);
            if (!matchPassword) {
                throw new Error('Contraseña incorrecta');
            }
            const hashedPassword = await this.AuthService.hashPassword(data.newPassword);
            user.password = hashedPassword;
            await user.save();
            return true
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateUser(token: string, data: UpdateUserDTO): Promise<User | null> {
        try {
            const decoded = await this.AuthService.verifyToken(token);
            
            const id = decoded._id
            const user = await this.UserModel.findByIdAndUpdate({_id: id}, data, { new: true, runValidators: true });
            
            if(!user){
                throw new Error('El usuario no fue encontrado o no se pudo actualizar');
            }
            return user
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        try {
            const user = await this.UserModel.findByIdAndDelete(userId);
            if(!user){
                return false
            }
            return true
        } catch (error) {
            throw new Error(error)
        }
    }

    async invitedGame(id: string, gameId: string): Promise<boolean> {
        try {
            const user = await this.UserModel.findById(id)
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const idGame = new mongoose.Types.ObjectId(gameId)
            user.invited_game.push(idGame)
            await user.save()
            return true
        } catch (error) {
            throw new Error(error)
        }
    }

    async getInvitedGame(id: string): Promise<any> {
        try {
            const user = await this.UserModel.findById(id)
            
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const populate = await user.populate('invited_game')
            return populate.invited_game
        } catch (error) {
            throw new Error(error)
        }
    }

}
