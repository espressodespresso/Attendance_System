import fpPromise from "../index";
import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";
import {Alert} from "../enums/Alert.enum";
import {GeneralUtility} from "../utilities/GeneralUtility";

export interface IAuthService {
    verifyStatus(username: string, password: string, fingerprint: string): Promise<object>;
    getPayloadData(): Promise<object>;
    verifyUserExists(username: string): Promise<boolean>;
    getBrowserFingerprint(): Promise<string>;
    logout(): Promise<void>;
}

export class AuthService extends RequestService implements IAuthService {
    async verifyStatus(username: string, password: string, fingerprint: string): Promise<object> {
        const body = JSON.stringify({ "username": username, "password": password, "fingerprint": fingerprint });
        return await super.handleFetch(Fetch.POST, Route.login, "", Accept.JSON, body)
    }

    async getPayloadData(): Promise<object> {
        const data: object = await super.handleFetch(Fetch.GET, Route.account, "", Accept.JSON);
        if (data["status"] === 401) {
            await this.getNewAuthToken();
        }

        return data;
    }

    async verifyUserExists(username: string): Promise<boolean> {
        const body = JSON.stringify({ "username": username });
        const data: object = await super.handleFetch(Fetch.GET, Route.account, `/verify/${username}`, Accept.JSON, body);
        return data["json"]["valid"];
    }

    private async getNewAuthToken(): Promise<void> {
        let body = JSON.stringify({ "fingerprint": await this.getBrowserFingerprint() });
        const data: object = await super.handleFetch(Fetch.POST, Route.account, `/auth`, Accept.JSON, body);
        switch (data["status"]) {
            case 200:
                console.log("new auth token!");
                await this.getNewRefreshToken(data["json"]["url"]);
                break;
            case 403:
                console.error("no refresh token!");
                break
            case 500:
                console.error("somethings very wrong!")
                break;
            default:
                console.error("??????")
                break
        }
    }

    private async getNewRefreshToken(refreshURL: string): Promise<void> {
        const data: object = await super.handleFetch(Fetch.GET, Route.account, refreshURL, Accept.JSON);
        switch (data["status"]) {
            case 200:
                console.log("Retrieved a new refresh token successfully");
                break;
            case 500:
                console.log("not good");
                break;
            default:
                console.log("???");
                break;
        }
    }

    async getBrowserFingerprint(): Promise<string> {
        const fp = await fpPromise;
        const result = await fp.get();
        console.log("fingerprint: " + result.visitorId);
        return result.visitorId;
    }

    async logout(): Promise<void> {
        const data: object = await super.handleFetch(Fetch.DELETE, Route.account, '/logout', Accept.JSON);
        const utils: GeneralUtility = GeneralUtility.getInstance();
        if(data["success"]) {
            utils.generateAlert("Logging you out...", Alert.Success);
        } else {
            console.error("Unable to logout?");
            utils.generateAlert("Unable to logout", Alert.Warning);
            utils.generateAlert("", Alert.Danger);
        }
    }
}

