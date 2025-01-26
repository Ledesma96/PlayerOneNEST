import { UserDTO } from "../DTO/user.dto";

export class UserEntity extends UserDTO{
    _id?
    games
    avatar
    username
    level
    dominant_foot
    availability
    position
    location
    description
    social
    online
    lastOnline
}