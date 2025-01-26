import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { Comments } from 'src/database/schemas/comments.schema';
import { GameService } from 'src/game/game.service';
import { CommentDTO } from './dto/comment.dto';
import { CommentEntity } from './entity/comments.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comments.name) private readonly CommentsModel: Model<Comments>,
        private readonly gameService: GameService,
        private readonly authService: AuthService
    ){}

    async genrateComment(data: CommentDTO[], gameId: string): Promise<void> {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("No hay datos válidos para generar comentarios.");
        }
    
        try {
            const transformedData = data.map(d => ({
                ...d,
                recipient: new mongoose.Types.ObjectId(d.recipient),
                authorId: new mongoose.Types.ObjectId(d.authorId),
            }));
            
            await Promise.all(
                transformedData.map((commentData) =>
                    this.CommentsModel.create(commentData)
                )
            );
            await this.gameService.updateGame({qualified: true}, gameId)
        } catch (error) {
            console.log(error.message);
            
            throw new Error(`Error al generar los comentarios: ${error.message}`);
        }
    }

    async getAllComments(token: string): Promise<CommentEntity[]> {
        try {
            // Verifica el token y decodifica la información
            const decoded = await this.authService.verifyToken(token);
            
            // Asegúrate de que el ID exista y sea válido
            if (!decoded?._id) {
                throw new Error('El token no contiene un ID válido.');
            }
    
            // Convierte el ID decodificado a un ObjectId
            const id = new mongoose.Types.ObjectId(decoded._id);
            
            // Busca los comentarios donde el recipient coincida con el ID
            const comments = await this.CommentsModel.find({ recipient: id })
            .populate({
                path: 'authorId',
                select: 'avatar username'
            });
            
            // Retorna los comentarios encontrados
            return comments;
        } catch (error) {
            // Lanza el error original o agrega más contexto si es necesario
            throw new Error(`Error al obtener los comentarios: ${error.message}`);
        }
    }
    

    async getCommentsUser(id: string) : Promise<CommentEntity[]>{
        try {
            const userId = new mongoose.Types.ObjectId(id);
            const comments = await this.CommentsModel.find({ recipient: userId })
            .populate({
                path: 'authorId',
                select: 'avatar username'
            });
            if(!comments){
                throw new Error('No fue posible encontrar comentarios.')
            }
            return comments
        } catch (error) {
            throw new Error(`Error al obtener los comentarios: ${error.message}`)
        }
    }
}
