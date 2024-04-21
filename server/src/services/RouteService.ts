import {sign} from 'hono/jwt'
import {AuthService, RoleAuth} from "./AuthService";
import {ServiceFactory} from "./ServiceFactory";
import {MessageUtility} from "../utilities/MessageUtility";

const cookie = require('cookie')

export interface IRouteService {
    handleErrors(c: any, ac: RoleAuth , innerFunc: (...args: any[]) => any): Promise<any>;
    getBody(c: any): Promise<JSON>;
    getParam(c: any, name: string): any;
    getAuthToken(c: any): string;
    getRefreshToken(c: any): string;
    setGenAuthToken(c: any, account: object): Promise<void>;
    setGenRefreshToken(c: any, fingerprint: string, username: string): Promise<void>
    logoutToken(c: any, token: string, refresh_token: string): void;
}

export class RouteService implements IRouteService{
    private _messageUtility: MessageUtility = null;

    constructor() {
        this._messageUtility = MessageUtility.getInstance();
    }

    async handleErrors(c: any, ac: RoleAuth , innerFunc: (...args: any[]) => any): Promise<any> {
        try {
            const objResponse = ServiceFactory.createAuthService().verifyRoleAuth(ac, this.getCookiesArray(c));
            switch (objResponse["status"]) {
                case 200:
                    return innerFunc();
                case 401:
                    c.status(401);
                    break;
                case 403:
                    c.status(403);
                    break;
            }

            console.error(objResponse["message"]);
            return c.text(objResponse["message"]);
        } catch (e) {
            console.error(this._messageUtility.errors.CodeError + "\n" + e);
            c.status(500);
            return c.text(this._messageUtility.errors.APIError);
        }
    }

    private getCookiesArray(c: any): string[] {
        return c.req.header('cookie').split(" ");
    }

    async getBody(c: any): Promise<JSON> {
        return JSON.parse(await c.req.text());
    }

    getParam(c: any, name: string): any {
        return c.req.param(name);
    }

    getAuthToken(c: any): string {
        return this.getCookieByString(c, "token");
    }

    getRefreshToken(c: any): string {
        return this.getCookieByString(c, "refresh_token");
    }

    private getCookieByString(c: any, name: string): string {
        const cookies: string[] = c.req.header('cookie').split(" ");
        for(let i = 0; i < cookies.length; i++) {

            if(cookies[i].startsWith(`${name}=`)) {
                return cookies[i].replace(`${name}=`, '');
            }
        }

        return null;
    }

    async setGenAuthToken(c: any, account: object): Promise<void> {
        const test = await this.setGenToken(c, "token", account, process.env.SECRET, 900);
    }

    async setGenRefreshToken(c: any, fingerprint: string, username: string): Promise<void> {
        const token: string = await this.setGenToken(c, "refresh_token", fingerprint, process.env.REFRESH_SECRET, 1800);
        await ServiceFactory.createAccountService().storeRefreshToken(token, username, fingerprint);
    }

    logoutToken(c: any, token: string, refresh_token: string): void {
        this.setLogoutToken(c, token, "token");
        this.setLogoutToken(c, refresh_token, "refresh_token");
    }

    private setLogoutToken(c: any, token: string, name: string): void {
        const setCookie = cookie.serialize(name, token, {
            maxAge: 0,
            httpOnly: true,
            path: "/"
        });

        c.res.headers.append('set-cookie', setCookie);
    }

    private async setGenToken(c: any, name: string ,data: any, secret: string, age: number): Promise<string> {
        const token = await sign(data, secret);
        const setCookie = cookie.serialize(name, token, {
            maxAge: age,
            httpOnly: true,
            path: "/"
        });

        c.res.headers.append('set-cookie', setCookie);

        return token;
    }
}