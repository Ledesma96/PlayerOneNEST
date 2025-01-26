import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Put,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DmsService } from './dms.service';

@Controller('dms')
export class DmsController {
    constructor(private readonly dmsService: DmsService) {}
    @Put('/file')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({
                        maxSize: 10 * 1024 * 1024, // 10MB
                        message: 'File is too large. Max file size is 10MB',
                    }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
        @Body('isPublic') isPublic: string,
        @Body('token') token: string
    ) {
        console.log(file);
        
        const isPublicBool = isPublic === 'true' ? true : false;
        return this.dmsService.uploadSingleFile({ file, isPublic: isPublicBool }, token);
    }
    @Get(':key')
    async getFileUrl(@Param('key') key: string) {
        return this.dmsService.getFileUrl(key);
    }
    @Get('/signed-url/:key')
    async getSingedUrl(@Param('key') key: string) {
        return this.dmsService.getPresignedSignedUrl(key);
    }
}