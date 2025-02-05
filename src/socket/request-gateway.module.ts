import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { ChatModule } from "src/chat/chat.module";
import GameSchema, { Game } from "src/database/schemas/game.schema";
import { Request, RequestSchema } from "src/database/schemas/request.schema";
import { User, UserSchema } from "src/database/schemas/user.schema";
import { GameModule } from "src/game/game.module";
import { MessageModule } from "src/message/message.module";
import { NotificationModule } from "src/notification/notification.module";
import { RequestModule } from "src/request/request.module";
import { UserModule } from "src/user/user.module";
import { ConnectionEvents } from "./connection/connection.events";
import { GameEvents } from "./game/game.events";
import { GatewayService } from "./gateway.service";
import { MessageEvents } from "./message/message.events";
import { RequestEvents } from "./request/request.events";

@Module({
    imports:[
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema},
            {name: Request.name, schema: RequestSchema},
            {name: Game.name, schema: GameSchema}
        ]),
        GameModule,
        AuthModule,
        RequestModule,
        MessageModule,
        ChatModule,
        UserModule,
        NotificationModule,
    ],
    providers:[
        GatewayService,
        GameEvents,
        ConnectionEvents,
        MessageEvents,
        RequestEvents
    ],
    exports: [
        GameEvents,
        ConnectionEvents,
        MessageEvents,
        RequestEvents
    ]
})

export class GatewayModule{}