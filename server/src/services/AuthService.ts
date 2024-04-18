import {Role} from "../enums/Role.enum";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";
import {decode} from 'hono/jwt'
import {MongoService} from "./MongoService";
import {Collection} from "../enums/Collection.enum";
import {AuthState} from "../enums/AuthState.enum";
import {Utils} from "../utilities/Utils";

export interface RoleAuth {
    authorised: Role[]
}

export const elevatedRoleAuth: RoleAuth = {
    authorised: [Role.Lecturer, Role.IT, Role.AdministrativeFM]
}

export class AuthService {
    private _mongoService: MongoService = null;

    constructor() {
        this._mongoService = new MongoService();
    }

    async login(username: string, password: string) {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: username };
            return await this._mongoService.findOne(query, Collection.users);
        });
        // Clears refresh tokens
        await new Utils().checkRefreshTokens();

        let obj = {
            authstate: undefined,
            account: undefined
        };
        if(response["status"]) {
            let account = response["result"];
            if(account["password"] === password) {
                console.log(Logs.Login);
                delete account["password"]
                obj.authstate = AuthState.Located;
                obj.account = account;
                return obj;
            } else {
                console.error(Errors.InvalidPassword);
                obj.authstate = AuthState.InvalidPass;
                return obj;
            }
        } else {
            console.error(Errors.InvalidAccount)
            obj.authstate = AuthState.NotLocated;
            return obj;
        }
    }

    verifyRoleAuth(roleAuth: RoleAuth, cookies: string[]): object {
        if(roleAuth.authorised.includes(Role.Exclude)) {
            return this.objResponse(200, Logs.Authorised);
        }

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

        if(roleAuth.authorised.includes(decode(token).payload["role"])
            || roleAuth.authorised.includes(Role.All)) {
            return this.objResponse(200, Logs.Authorised);
        }

        return this.objResponse(403, Errors.NotAuthorised);
    }

    private objResponse(status: number, message: string): object {
        return {
            status: status,
            message: message
        }
    }
}