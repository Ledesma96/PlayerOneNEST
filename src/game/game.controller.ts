import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { GameEntity } from './entity/game.entity';
import { GameService } from './game.service';

@Controller('api/game')
export class GameController {
    constructor(
        private readonly gameService: GameService
    ){}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllGames(
        @Query('genderCategory') genderCategory: string,
        @Query('position') position: string,
        @Query('latitude') latitude: string,
        @Query('longitude') longitude: string,
        @Query('radius') radius: string,
        @Query('camp') camp: string
    ): Promise<{ success: boolean; message: string; data: GameEntity[] }> {
        try {
            // Llama al servicio con los filtros
            const data = await this.gameService.getAllGames(genderCategory, position, parseFloat(latitude), parseFloat(longitude), parseInt(radius), camp);

            return { success: true, message: 'juegos obtenidos exitosamente', data };
        } catch (error) {
            if (error.message === 'No hay juegos disponibles') {
                throw new HttpException('No hay juegos disponibles', HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Error al obtener los juegos', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('get-my-games/:token')
    @HttpCode(HttpStatus.OK)
    async getMyGames (
        @Param('token') token: string
    ): Promise<{success: boolean, message: string, game?: object}>{
        try {
            const game = await this.gameService.getMyGames(token)
            
            if (!game){
                return {success: false, message: 'Error al obtener los juegos'}
            }
            return { success: true, message: 'Juegos encontrado con exito', game }
        } catch (error) {
            if(error.messge === 'Token invalido'){
                throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
            }
            throw new HttpException('Error al obtener juegos', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get('/get-user-games')
    @HttpCode(HttpStatus.OK)
    async getUserGames(
        @Query('token') token: string
    ): Promise<{ success: boolean; message: string; data?: GameEntity[] }> {
        try {
            const data = await this.gameService.getUserGames(token)
            
            if (!data){
                return { success: false, message: 'Error al obtener los juegos'}
            }
            return { success: true, message: 'Juegos encontrados con exito', data }
        } catch (error) {
            if(error.messge === 'Token invalido'){
                throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
            }
            throw new HttpException('Error al obtener juegos', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}
