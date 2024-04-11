import {Role} from "../enums/Role.enum";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";
import {decode} from 'hono/jwt'

export interface RoleAuth {
    authorised: Role[]
}

export class AuthService {
    verifyRoleAuth(roleAuth: RoleAuth, cookies: string[]): object {
        let token: string = null;
        for(let i = 0; i < cookies.length; i++) {
            if(cookies[i].startsWith("token=")) {
                token = cookies[i].replace("token=", '');
                break;
            }
        }

        if(token === null) {
            console.error(Errors.NoAuthToken);
            return this.objResponse(401, Errors.NoAuthToken);
        }

        if(roleAuth.authorised.includes(decode(token).payload["role"])) {
            return this.objResponse(200, Logs.Authorised);
        }

        return this.objResponse(404, Errors.NotAuthorised);
    }

    private objResponse(status: number, message: string): object {
        return {
            status: status,
            message: message
        }
    }
}