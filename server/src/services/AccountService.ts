import {decode, verify} from 'hono/jwt'
import {Collection} from "../enums/Collection.enum";
import {Logs} from "../utilities/Logs";
import {Errors} from "../utilities/Errors";
import {MongoService} from "./MongoService";

export class AccountService {
    private _mongoService: MongoService = null;

    constructor() {
        this._mongoService = new MongoService();
    }

    async getUserInfobyAuthToken(token: string) {
        const payload = decode(token).payload;
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: payload["username"] };
            return await this._mongoService.findOne(query, Collection.users);
        });

        if(response["status"]) {
            console.log(Logs.DataRetrieval);
            return payload;
        } else {
            console.error(Errors.InvalidAccount);
        }
    }

    async getUserInfobyUsername(username: string) {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: username }
            return await this._mongoService.findOne(query, Collection.users);
        });

        if(response["status"]) {
            console.log(Logs.DataRetrieval);
            return response["result"];
        } else {
            console.error(Errors.InvalidAccount);
        }
    }

    async getUserInfobyRefreshToken(token: string) {
        const fingerprint = decode(token).payload;
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const rftokenquery = { fingerprint: fingerprint }
            const rftokenresponse: object = await this._mongoService.findOne(rftokenquery, Collection.token);
            if(!rftokenresponse["status"]) {
                console.error(Errors.TokenLocation)
                return null;
            }

            console.log(Logs.TokenLocation);
            const rftokenresult = rftokenresponse["result"];
            const userquery = { username: rftokenresult["username"] };
            const userresponse: object = await this._mongoService.findOne(userquery, Collection.users);
            if(!userresponse["status"]) {
                console.error(Errors.InvalidAccount);
                return null;
            }

            return userresponse;
        });

        const userresult = response["result"];
        delete userresult["password"];
        console.log(Logs.DataRetrieval);
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

    async updateUser(username: string, update: object) {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: username };
            return await this._mongoService.updateOne(query, update, Collection.users);
        });

        if(response["status"]) {
            console.log(Logs.AccountUpdate);
        } else {
            console.error(Errors.NoAccount);
        }

        return response["status"];
    }

    // Token Functions

    async storeRefreshToken(token: string, username: string, fingerprint: string) {
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
            console.log(Logs.TokenInsertion);
        } else {
            console.error(Errors.StoreToken);
        }
    }

    async verifyRefreshToken(token: string, fingerprint: string) {
        const payload = await verify(token, process.env.REFRESH_SECRET);
        if(payload === fingerprint) {

            console.log(Logs.TokenVerification);
            return {
                valid: true,
                payload: payload
            }
        } else {

            console.error(Errors.TokenVerification);
            return {
                valid: false
            }
        }
    }

    async deleteRefreshToken(username: string) {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { username: {$regex: username} };
            return await this._mongoService.deleteMany(query, Collection.token);
        });

        const status = response["status"];
        if(status) {
            console.log(Logs.TokenDeletion);
        } else {
            console.error(Errors.TokenDeletion);
        }

        return status;
    }

    async deleteTokensLogout(username: string) {
        return await this.deleteRefreshToken(username);
    }
}