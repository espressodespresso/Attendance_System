import {MongoService} from "../services/MongoService";
import {Collection} from "../enums/Collection.enum";
import {setTimeout} from 'timers/promises';

export class Utils {
    private mongoService: MongoService = null;

    constructor() {
        this.mongoService = new MongoService;
        (async () => {
            await this.checkRefreshTokens();
        })();
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
}