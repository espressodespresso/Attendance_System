import {MongoService} from "../services/MongoService";
import {Collection} from "../enums/Collection.enum";
import {setTimeout} from 'timers/promises';

export class Utils {
    private mongoService: MongoService = null;

    constructor() {
        this.mongoService = new MongoService();
    }

    async checkRefreshTokens() {
        setInterval(async () => {
            let deleted: number = 0;
            const response = await this.mongoService.findall(Collection.token);
            if(response["status"]) {
                const tokens: object[] = response["result"];
                for(let i = 0; i < tokens.length; i++) {
                    const tokenObj: object = tokens[i];
                    const expiry: Date = tokenObj["expiry"];
                    if(new Date(expiry) < new Date()) {
                        const query = { "refresh_token": tokenObj["refresh_token"] };
                        const innerResponse: object = await this.mongoService.deleteOne(query, Collection.token);
                        if(innerResponse["status"]) {
                            deleted++;
                        }
                    }
                }
            }
            console.log(`Server: Cleaned up ${deleted} expired tokens`);
        }, 30*60000);
    }

    sendResponse(response: object, errResponse: string, succResponse: string, altResponse?: string) {
        const result: object = response["result"];
        const status: boolean = response["status"];
        if(typeof altResponse !== "undefined") {
            return this.responseObj(result, altResponse, status);
        }

        if(status) {
            return this.responseObj(result, succResponse, status);
        } else {
            return this.responseObj(result, errResponse, status);
        }
    }

    sendMessageResponse(response: object, errResponse: string, succResponse: string, altResponse?: string) {
        const status: boolean = response["status"];
        if(typeof altResponse !== "undefined") {
            return this.msgResponseObj(altResponse, status);
        }

        if(status) {
            return this.msgResponseObj(succResponse, status);
        } else {
            return this.msgResponseObj(errResponse, status);
        }
    }

    private msgResponseObj(message: string, status: boolean): object {
        return {
            message: message,
            status: status
        }
    }

    private responseObj(result: object, message: string, status: boolean): object {
        return {
            result: result,
            message: message,
            status: status
        }
    }
}