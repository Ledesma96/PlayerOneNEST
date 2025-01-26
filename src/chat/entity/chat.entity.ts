import { ChatDTO } from "../DTO/chat.dto";

export class ChatEntity extends ChatDTO{
    _id;
    messages;
    lastUpdated: Date;
}