import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { GameEntity } from 'src/game/entity/game.entity';
import { UpdateUserDTO } from './DTO/updateUser.dto';
import { UserDTO } from './DTO/user.dto';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ){}

    @Post('/create-user')
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() data: UserDTO): Promise<{ success: boolean; message: string }> {
        try {
            const user = {
                email: data.email.toLowerCase().trim(),
                password: data.password.trim(),
            }
            await this.userService.createUser(user);
            return { success: true, message: 'Usuario creado exitosamente' };
        } catch (error) {
            throw new HttpException(
                'Error al crear el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() data: UserDTO): Promise<{ success: boolean; message: string; token: string, data: object }> {
        try {
            data.email.toLowerCase().trim();
            data.password.trim();
            const response = await this.userService.login(data);
            return { success: true, message: 'Login exitoso', token: response.token, data: response };
        } catch (error) {
            throw new HttpException(
                'Error al iniciar sesión',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('/get-user-by-id/:id')
    @HttpCode(HttpStatus.OK)
    async getUserById(@Param('id') id: string): Promise<{ success: boolean; user: UserEntity | null }> {
        try {
            const user = await this.userService.getUserById(id);
            return { success: true, user };
        } catch (error) {
            throw new HttpException(
                'Error al obtener el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('/get-user-by-id-profile/:id')
    @HttpCode(HttpStatus.OK)
    async getUserProfile(@Param('id') id: string): Promise<{ success: boolean; user: object }> {
        try {
            const user = await this.userService.getUserProfile(id);
            return { success: true, user };
        } catch (error) {
            throw new HttpException(
                'Error al obtener el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('/send-mail-change-password')
    @HttpCode(HttpStatus.OK)
    async sendMailChangePassword(@Body() data: {email: string, _id: string}): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.userService.sendMailChangePassword(data.email, data._id)
            if(response){
                return { success: true, message: 'Correo de cambio de contraseña enviado' };
            }
            return { success: false, message: 'Usuario no encontrado' };
        } catch (error) {
            throw new HttpException(
                'Error al enviar el correo de cambio de contraseña',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('/recuperate-password/:token')
    @HttpCode(HttpStatus.OK)
    async recuperatePassword(@Body() data: UserDTO, @Param('token') token: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.userService.recuperatePassword(data, token)
            if(response.message !== 'Token inválido'){
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message };
        } catch (error) {
            throw new HttpException(
                'Error al cambiar la contraseña',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Put('/change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(@Body() data: {email: string, password: string, newPassword: string}): Promise<{ success: boolean; message: string }> {
        console.log(data);
        
        try {
            const response = await this.userService.changePassword(data);
            if(response){
                return { success: true, message: 'Contraseña cambiada exitosamente' };
            }
            return { success: false, message: 'Usuario no encontrado' };
        } catch (error) {
            throw new HttpException(
                'Error al cambiar la contraseña',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('/get-user-id/:token')
    @HttpCode(HttpStatus.OK)
    async getUserId(@Param('token') token: string): Promise<{ success: boolean; id: string }> {
        try {
            const response = await this.userService.getUserId(token);
            return { success: true, id: response}
        } catch (error) {
            if(error.message !== 'Token inválido'){
                throw new HttpException(
                    'Error al obtener el id del usuario',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            throw new HttpException(
                'Token inválido',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    @Put('/update-user/:token')
    @HttpCode(HttpStatus.OK)
    async updateUser(@Param('token') token: string, @Body() data: UpdateUserDTO): Promise<{ success: boolean; user: UserEntity | null }> {
        try {
            const user = await this.userService.updateUser(token, data);
            return { success: true, user };
        } catch (error) {
            if(error.message === 'El usuario no fue encontrado o no se pudo actualizar'){
                throw new HttpException(
                    'Usuario no encontrado o no se pudo actualizar',
                    HttpStatus.NOT_FOUND,
                );
            }
            throw new HttpException(
                'Error al actualizar el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete('/delete-user/:id')
    @HttpCode(HttpStatus.OK)
    async deleteUser(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.userService.deleteUser(id)
            if (!response) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }
    
            return { success: true, message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            throw new HttpException(
                'Error al eliminar el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('/get-invited-game')
    @HttpCode(HttpStatus.OK)
    async getInvitedGame(@Query('id') id: string): Promise<{ success: boolean; games: GameEntity[] | null }> {
        console.log(id);
        
        try {
            const games = await this.userService.getInvitedGame(id);
            return { success: true, games };
        } catch (error) {
            throw new HttpException(
                'Error al obtener las invitaciones',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}