import {
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DmsService {
    private client: S3Client;
    private bucketName = this.configService.get('S3_BUCKET_NAME');
    
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ) {
        const s3_region = this.configService.get('S3_REGION');
    
        if (!s3_region) {
        throw new Error('S3_REGION not found in environment variables');
        }
    
        this.client = new S3Client({
        region: s3_region,
        credentials: {
            accessKeyId: this.configService.get('S3_ACCESS_KEY'),
            secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
        },
        forcePathStyle: true,
        });
    
    }

    async uploadSingleFile({
        file,
        isPublic = true,
    }: {
        file: Express.Multer.File;
        isPublic: boolean;
    },
    token: string) {
        try {
            const key = `${uuidv4()}`;
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    originalName: file.originalname,
                },
        });
            const uploadResult = await this.client.send(command);
            
            const object = {
                url: isPublic
                ? (await this.getFileUrl(key)).url
                : (await this.getPresignedSignedUrl(key)).url,
                key,
                isPublic,
            };
            const avatar = object.url
            const updateUser = await this.userService.updateUser(token, {avatar})
            
            return object;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getFileUrl(key: string) {
        return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
    }

    async getPresignedSignedUrl(key: string) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const url = await getSignedUrl(this.client, command, {
                expiresIn: 60 * 60 * 24, // 24 hours
            });
            return { url };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}