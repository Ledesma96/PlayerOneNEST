import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import mongoose, { Model, PaginateModel } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { Game } from 'src/database/schemas/game.schema';
import { User } from 'src/database/schemas/user.schema';
import { UserEntity } from 'src/user/entity/user.entity';
import { GameDTO } from './dto/game.dto';
import { UpdateGameDTO } from './dto/update-game.dto';
import { GameEntity } from './entity/game.entity';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) private readonly GameModel: PaginateModel<Game>,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        private readonly authService: AuthService
    ){}
    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    private calculateDistance(lat1: number, long1: number, lat2: number, long2: number): number {
        const R = 6371;
        const latitud_distance = this.deg2rad(lat2 - lat1);
        const longitud_distance = this.deg2rad(long2 - long1);

        const a = Math.sin(latitud_distance / 2) * Math.sin(latitud_distance / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(longitud_distance / 2) * Math.sin(longitud_distance / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async createGame(data: GameDTO): Promise<{games: GameEntity[], users: UserEntity[], user: UserEntity, gameId: string}> {
        try {
            data = {
                ...data,
                creator: new mongoose.Types.ObjectId(data.creator)
            }
            const newGame = new this.GameModel(data);
            if (!newGame) {
                throw new Error('No se pudo crear el juego');
            }

            const users = await this.UserModel.find();
            
            // Encontrar al creador del juego
            const user = await this.UserModel.findById(newGame.creator)
            if (!user) {
                throw new Error('El creador no existe');
            }
            await newGame.save();
            const games = await this.GameModel.find();

            return {games, users, user, gameId: newGame._id.toString()}
        } catch (error) {
            throw new Error(error)
        }
    }

    async getAllGames(
        genderCategory: string,
        position: string,
        latitude: number,
        longitude: number,
        radius: number,
        camp: string
    ): Promise<any> {
        try {
            const filterCategory = genderCategory != 'undefined'? {gender_category: genderCategory} : null;
            const filterPosition = position != 'undefined'? {position} : null;
            const filterCamp = camp != 'undefined'? {camp: parseInt(camp)} : null;
            const filters ={
                ...filterCategory,
                ...filterPosition,
                ...filterCamp
            }
            const games = await this.GameModel.paginate(filters,{
                limit: 100,
                page: 1,
                lean: true
            });

            if (!games || games.length === 0) {
                throw new Error('No hay partidos disponibles');
            }

            if (!longitude || !latitude) return games;

            const filteredGames = games.docs.filter((game) => {
                const distance = this.calculateDistance(latitude, longitude, game.location.latitude, game.location.longitude);
                console.log(distance);
                
                return distance <= radius;
            });
            
            return filteredGames;
        } catch (error) {
            throw new Error(error.message || 'Error al obtener los partidos');
        }
    }

    async getGameById(gameId: string): Promise<GameEntity> {
        try {
            const game = await this.GameModel.findById(gameId).populate('creator');
            if(!game){
                throw new Error('El juego no fue encontrado');
            }
            return game
        } catch (error) {
            throw new Error(error)
        }
    }

    async updateGame(data: UpdateGameDTO, gameId: string): Promise<GameEntity>{
        try {
            const updateGame = await this.GameModel.findByIdAndUpdate(gameId, data);
            if(!updateGame){
                throw new Error('El juego no fue encontrado o no se pudo actualizar');
            }
            return updateGame
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteGame(gameId: string): Promise<boolean> {
        try {
            const game = await this.GameModel.findByIdAndDelete(gameId);
            if(!game){
                throw new Error('El juego no fue encontrado o no se pudo eliminar');
            }
            return true
        } catch (error) {
            throw new Error(error)
        }
    }

    async getMyGames(token: string): Promise<object>{
        try {
            const decoded = await this.authService.verifyToken(token)

            if(!decoded) throw new Error('Token invalido')

                const game = await this.GameModel.findOne({
                    creator: decoded._id,
                    qualified: false,
                    status: 'finished',
                    guests: { $exists: true, $not: { $size: 0 } }
                })
                .populate({
                    path: 'guests.user',
                    select: 'avatar nickname username _id'
                })
                .sort({ createdAt: -1 })

                if (!game) {
                    return { success: false, message: 'No se encontraron juegos' };
                }
                
                return {guests: game.guests, gameId: game._id};
                
        } catch (error) {
            throw new Error(error)
        }
    }

    async getUserGames(token?: string): Promise<GameEntity[]>{
        try {
            const decoded = await this.authService.verifyToken(token);
            
            if(!decoded) throw new Error('Token invalido');
            const id = new mongoose.Types.ObjectId(decoded._id);
            console.log(id);
            
            const games = await this.GameModel.find({
                $or: [
                    { creator: id },
                    { guests:id }
                ],
            })
            .populate({
                path: 'guests.user',
                select: 'avatar nickname username _id'
            })
            
            return games
        } catch (error) {
            throw new Error('No se pudieron obtener los juegos. Inténtelo más tarde.');
        }
    }

    @Cron('* * * * *') // Cada 30 minutos
    async changeStatusGame(): Promise<void> {
    try {
        const now = new Date(); // Fecha y hora actual
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // Fecha y hora hace una hora

        // Cambiar a "in progress" si el partido ya comenzó y pasó menos de una hora
        const inProgressResult = await this.GameModel.updateMany(
            {
                status: 'pending',
                date: { $lt: now, $gte: oneHourAgo  }, // Fecha anterior a ahora
                time: { $lte: now.toTimeString().split(' ')[0] }, // Hora igual o menor a la actual
            },
            { $set: { status: 'in progress' } }
        );

        // Cambiar a "finished" si pasó más de una hora desde el inicio
        const finishedResult = await this.GameModel.updateMany(
            {
                status: { $in: ['pending', 'in progress'] },
                date: { $lte: oneHourAgo } // Fecha/hora antes de hace una hora
            },
            { $set: { status: 'finished' } }
        );

        console.log(`Updated ${inProgressResult.modifiedCount} games to "in progress".`);
        console.log(`Updated ${finishedResult.modifiedCount} games to "finished".`);
    } catch (error) {
        console.error('Error en el cron job:', error);
    }
}



}
