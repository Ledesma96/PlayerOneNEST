import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDTO } from './dto/comment.dto';
import { CommentEntity } from './entity/comments.entity';

@Controller('api/comment')
export class CommentController {
    constructor(
        private readonly commentService: CommentService
    ){}

    @Post('/generate-comment')
    @HttpCode(HttpStatus.OK)
    async genrateComment(
        @Body('data') data: CommentDTO[],
        @Query('gameId') gameId: string
    ): Promise<void>{
        try {
            await this.commentService.genrateComment(data, gameId)
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get('/get-all-comments')
    @HttpCode(HttpStatus.OK)
    async getAllComments(
        @Query('token') token: string
    ): Promise<CommentEntity[]>{
        try {
            const comments = await this.commentService.getAllComments(token)
            return comments
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
    
    @Get('/get-comments-users')
    @HttpCode(HttpStatus.OK)
    async getCommentsUser(
        @Query('id') id: string
    ): Promise<CommentEntity[]>{
        try {
            const comments = await this.commentService.getCommentsUser(id)
            return comments
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
