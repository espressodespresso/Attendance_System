import {Collection} from "../enums/Collection.enum";
import {setTimeout} from 'timers/promises';
import {IMongoService} from "../services/MongoService";
import {ServiceFactory} from "../services/ServiceFactory";

export class GeneralUtility {
    private static _instance: GeneralUtility = null;
    private _mongoService: IMongoService = null;

    constructor() {
        this._mongoService = ServiceFactory.createMongoService();
    }

    static getInstance(): GeneralUtility {
        if(this._instance === null) {
            this._instance = new GeneralUtility();
        }

        return this._instance;
    }


    async checkRefreshTokens() {
        let deleted: number = 0;
        const response = await this._mongoService.findall(Collection.token);
        if(response["status"]) {
            const tokens: object[] = response["result"];
            for(let i = 0; i < tokens.length; i++) {
                const tokenObj: object = tokens[i];
                const expiry: Date = tokenObj["expiry"];
                if(new Date(expiry) < new Date()) {
                    const query = { "refresh_token": tokenObj["refresh_token"] };
                    const innerResponse: object = await this._mongoService.deleteOne(query, Collection.token);
                    if(innerResponse["status"]) {
                        deleted++;
                    }
                }
            }
        }
        console.log(`Server: Cleaned up ${deleted} expired tokens`);
    }
}