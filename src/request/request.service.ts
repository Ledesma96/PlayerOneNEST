import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game } from 'src/database/schemas/game.schema';
import { Request } from 'src/database/schemas/request.schema';
import { RequestDTO, ResponseRequestDTO } from './dto/request.dto';
import { RequestEntity } from './entity/request.entity';

@Injectable()
export class RequestService {
    constructor(
        @InjectModel(Request.name) private readonly RequestModel: Model<Request>,
        @InjectModel(Game.name) private readonly GameModel: Model<Game>,
    ){}

    async createRequest(data: RequestDTO): Promise<any>{
        try {
            const request = {
                ...data,
                recipient: data.recipient ? new mongoose.Types.ObjectId(data.recipient) : null,
                sender: data.sender ? new mongoose.Types.ObjectId(data.sender) : null,
                game: data.game ? new mongoose.Types.ObjectId(data.game) : null,
            };
            
            
            const newRequest = new this.RequestModel(request);
            if(!newRequest){
                throw new Error('No se pudo crear la solicitud');
            }
            const game = await this.GameModel.findById(data.game)
            game.applicants.push(data.sender)
            await game.save()
            const games = await this.GameModel.find();
            await newRequest.save();
            const requests = await this.getAllRequests(data.recipient)
            return {games, requests}
        } catch (error) {
            throw new Error(error)
        }
    }

    async getAllRequests(id: string): Promise<RequestEntity[]>{
        try {
            const idRecipient = new mongoose.Types.ObjectId(id)
            const requests = await this.RequestModel.find({recipient: idRecipient}).populate('sender')
            
            if(!requests){
                throw new Error('No hay solicitudes disponibles');
            }
            return requests
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteRequest(id: string): Promise<RequestEntity[]>{
        try {
            const deletedRequest = await this.RequestModel.findByIdAndDelete(id);
            if(!deletedRequest){
                throw new Error('No se pudo eliminar o no se encontro')
            }
            const request = await this.RequestModel.find();
            return request
        } catch (error) {
            throw new Error(error)
        }
    }

    async responseRequest(data: ResponseRequestDTO): Promise<RequestEntity[]> {
        try {
    
            // Validar entrada
            if (!data.recipient || !data.sender || !data.game) {
                throw new Error('Faltan datos obligatorios en la solicitud');
            }
    
            // Crear solicitud
            const request = {
                ...data,
                recipient: new mongoose.Types.ObjectId(data.recipient),
                sender: new mongoose.Types.ObjectId(data.sender),
            };
    
            const newRequest = await this.RequestModel.create(request);
            if (!newRequest) {
                throw new Error('No se pudo crear la solicitud');
            }
    
            // Buscar juego y verificar si el usuario ya está en la lista de invitados
            const game = await this.GameModel.findById(data.game);
            if (!game) {
                throw new Error(`El juego con ID ${data.game} no existe`);
            }
    
            const existUser = game.guests.find(guest => guest.user.toString() === data.recipient);
            if (!existUser) {
                game.guests.push({ user: request.recipient, qualified: false });
                await game.save();
            }
    
            // Consultar todas las solicitudes del destinatario
            const recipientId = new mongoose.Types.ObjectId(data.recipient);
            const requests = await this.RequestModel.find({ recipient: recipientId }).lean();
    
            return requests;
        } catch (error) {
            console.error('Error en responseRequest:', error);
            throw new Error(`Error al procesar la solicitud: ${error.message}`);
        }
    }
    

    async readRequest (requestId: string): Promise<RequestEntity[]>{
        try{
            const readRequest = await this.RequestModel.findById(requestId);
            readRequest.seen = true;
            await readRequest.save();
            const requestsSeen  = await this.RequestModel.find({recipient: readRequest.recipient})
            return requestsSeen
        } catch(error){
            throw new Error(error.message)
        }
    }
}
