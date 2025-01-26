import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { RequestDTO } from './dto/request.dto';
import { RequestEntity } from './entity/request.entity';
import { RequestService } from './request.service';

@Controller('api/request')
export class RequestController {
    constructor(
        private readonly requestService: RequestService
    ){}

    @Post('/create-request')
    @HttpCode(HttpStatus.OK)
    async createRequest(@Body() data:RequestDTO): Promise<{success: boolean, message: string}> {
        try {
            const request = await this.requestService.createRequest(data);
            if(request){
                return { success: true, message: 'Solicitud creada exitosamente' };
            } else {
                throw new Error('No se pudo crear la solicitud');
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    @Get('/get-all-requests/:id')
    @HttpCode(HttpStatus.OK)
    async getAllRequests(@Param('id') id:string): Promise<{success: boolean, message: string, requests?: RequestEntity[]}> {
        try {
            const requests = await this.requestService.getAllRequests(id);
            if(requests.length > 0){
                return { success: true, message: 'Solicitudes obtenidas exitosamente', requests };
            } else {
                return {success: false, message: 'No hay solicitudes disponibles'};
            }
        } catch (error) {
            if(error.message === 'No hay solicitudes disponibles'){
                throw new HttpException(
                    'No hay solicitudes disponibles',
                    HttpStatus.NOT_FOUND
                )
            }
            throw new HttpException(
                'Error al obtener las solicitudes',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete('/delete-request/:id')
    @HttpCode(HttpStatus.OK)
    async deleteRequest(@Param('id') id: string): Promise<{success: boolean, message: string, data:     RequestEntity[]}> {
        try{
            const requests = await this.requestService.deleteRequest(id);
            return {success: true, message: 'Producto eliminado con exito', data: requests}
        } catch (error){
            if(error.message === 'No se pudo eliminar o no se encontro'){
                throw new HttpException(
                    'No se pudo eliminar la solicitud',
                    HttpStatus.NOT_FOUND
                )
            }
            throw new HttpException(
                'error en el servidor',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
