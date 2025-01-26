import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { DmsController } from './dms.controller';
import { DmsService } from './dms.service';

@Module({
  imports: [UserModule],
  providers: [DmsService],
  controllers: [DmsController]
})
export class DmsModule {}
