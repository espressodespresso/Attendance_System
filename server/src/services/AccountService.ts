import {decode, verify} from 'hono/jwt'
import {Collection} from "../enums/Collection.enum";
import {ServiceFactory} from "./ServiceFactory";
import {IMongoService} from "./MongoService";
import {MessageUtility} from "../utilities/MessageUtility";

export interface IAccountService {
    getUserInfobyAuthToken(token: string): Promise<object>;
    getUserInfobyUsername(username: string): Promise<object>;
    getUserInfobyRefreshToken(token: string): Promise<object>;
    verifyUser(username: string): Promise<boolean>;
    updateUser(username: string, update: object): Promise<boolean>;
    storeRefreshToken(token: string, username: string, fingerprint: string): Promise<void>;
    verifyRefreshToken(token: string, fingerprint: string): Promise<object>;
    deleteRefreshToken(username: string): Promise<boolean>;
}

export class AccountService implements IAccountService {
    private _mongoService: IMongoService = null;
    private _messageUtility: MessageUtility = null;

    constructor() {
        this._mongoService = ServiceFactory.createMongoService();
        this._messageUtility = MessageUtility.getInstance();
    }

    async getUserInfobyAuthToken(token: string): Promise<object> {
        const payload = decode(token).payload;
        return await this.getUserInfo(payload["username"]);
    }

    async getUserInfobyUsername(username: string): Promise<object> {
        return await this.getUserInfo(username);
    }

    private async getUserInfo(username: string): Promise<object> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: username }
            return await this._mongoService.findOne(query, Collection.users);
        });

        if(response["status"]) {
            console.log(this._messageUtility.logs.DataRetrieval);
            return response["result"];
        } else {
            console.error(this._messageUtility.errors.InvalidAccount);
            return null;
        }
    }

    async getUserInfobyRefreshToken(token: string): Promise<object> {
        const fingerprint = decode(token).payload;
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const rftokenquery = { fingerprint: fingerprint }
            const rftokenresponse: object = await this._mongoService.findOne(rftokenquery, Collection.token);
            if(!rftokenresponse["status"]) {
                console.error(this._messageUtility.errors.TokenLocation)
                return null;
            }

            console.log(this._messageUtility.logs.TokenLocation);
            const rftokenresult = rftokenresponse["result"];
            const userquery = { username: rftokenresult["username"] };
            const userresponse: object = await this._mongoService.findOne(userquery, Collection.users);
            if(!userresponse["status"]) {
                console.error(this._messageUtility.errors.InvalidAccount);
                return null;
            }

            return userresponse;
        });

        const userresult = response["result"];
        delete userresult["password"];
        console.log(this._messageUtility.logs.DataRetrieval);
        return userresult;
    }

    async verifyUser(username: string): Promise<boolean> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: username };
            return await this._mongoService.findOne(query, Collection.users);
        });

        return response["status"]
    }

    async updateUser(username: string, update: object): Promise<boolean> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: username };
            return await this._mongoService.updateOne(query, update, Collection.users);
        });

        if(response["status"]) {
            console.log(this._messageUtility.logs.AccountUpdate);
        } else {
            console.error(this._messageUtility.errors.NoAccount);
        }

        return response["status"];
    }

    // Token Functions

    async storeRefreshToken(token: string, username: string, fingerprint: string): Promise<void> {
        const data = {
            "refresh_token": token,
            "username": username,
            "fingerprint": fingerprint,
            "expiry": new Date(new Date().getTime() + 1800000)
        };

        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            return await this._mongoService.insertOne(data, Collection.token);
        });

        if(response["status"]) {
            console.log(this._messageUtility.logs.TokenInsertion);
        } else {
            console.error(this._messageUtility.errors.StoreToken);
        }
    }

    async verifyRefreshToken(token: string, fingerprint: string): Promise<object> {
        const payload = await verify(token, process.env.REFRESH_SECRET);
        if(payload === fingerprint) {

            console.log(this._messageUtility.logs.TokenVerification);
            return {
                valid: true,
                payload: payload
            }
        } else {
            console.error(this._messageUtility.errors.TokenVerification);
            return {
                valid: false
            }
        }
    }

    async deleteRefreshToken(username: string): Promise<boolean> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: {$regex: username} };
            return await this._mongoService.deleteMany(query, Collection.token);
        });

        const status = response["status"];
        if(status) {
            console.log(this._messageUtility.logs.TokenDeletion);
        } else {
            console.error(this._messageUtility.errors.TokenDeletion);
        }

        return status;
    }
}