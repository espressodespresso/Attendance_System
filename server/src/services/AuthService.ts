import {Role} from "../enums/Role.enum";
import {decode} from 'hono/jwt'
import {Collection} from "../enums/Collection.enum";
import {AuthState} from "../enums/AuthState.enum";
import {GeneralUtility} from "../utilities/GeneralUtility";
import {ServiceFactory} from "./ServiceFactory";
import {IMongoService} from "./MongoService";
import {MessageUtility} from "../utilities/MessageUtility";

export interface IAuthService {
    login(username: string, password: string): Promise<object>;
    verifyRoleAuth(roleAuth: RoleAuth, cookies: string[]): object;
}

export interface RoleAuth {
    authorised: Role[]
}

export const elevatedRoleAuth: RoleAuth = {
    authorised: [Role.Lecturer, Role.IT, Role.AdministrativeFM]
}

export class AuthService implements IAuthService {
    private _mongoService: IMongoService = null;
    private _messageUtility: MessageUtility = null;

    constructor() {
        this._mongoService = ServiceFactory.createMongoService();
        this._messageUtility = MessageUtility.getInstance();
    }

    async login(username: string, password: string): Promise<object> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: username };
            return await this._mongoService.findOne(query, Collection.users);
        });
        // Clears refresh tokens
        await GeneralUtility.getInstance().checkRefreshTokens();

        let obj = {
            authstate: undefined,
            account: undefined
        };
        if(response["status"]) {
            let account = response["result"];
            if(account["password"] === password) {
                console.log(this._messageUtility.logs.Login);
                delete account["password"]
                obj.authstate = AuthState.Located;
                obj.account = account;
                return obj;
            } else {
                console.error(this._messageUtility.errors.InvalidPassword);
                obj.authstate = AuthState.InvalidPass;
                return obj;
            }
        } else {
            console.error(this._messageUtility.errors.InvalidAccount)
            obj.authstate = AuthState.NotLocated;
            return obj;
        }
    }

    verifyRoleAuth(roleAuth: RoleAuth, cookies: string[]): object {
        if(roleAuth.authorised.includes(Role.Exclude)) {
            return this.objResponse(200, this._messageUtility.logs.Authorised);
        }

        let token: string = null;
        for(let i = 0; i < cookies.length; i++) {
            if(cookies[i].startsWith("token=")) {
                token = cookies[i].replace("token=", '');
                break;
            }
        }

        if(token === null) {
            console.error(this._messageUtility.errors.NoAuthToken);
            return this.objResponse(401, this._messageUtility.errors.NoAuthToken);
        }

        if(roleAuth.authorised.includes(decode(token).payload["role"])
            || roleAuth.authorised.includes(Role.All)) {
            return this.objResponse(200, this._messageUtility.logs.Authorised);
        }

        return this.objResponse(403, this._messageUtility.errors.NotAuthorised);
    }

    private objResponse(status: number, message: string): object {
        return {
            status: status,
            message: message
        }
    }
}