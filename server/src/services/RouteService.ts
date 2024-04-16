import {Errors} from "../utilities/Errors";
import {sign} from 'hono/jwt'
import {MongoService} from "./MongoService";
import {AuthService, RoleAuth} from "./AuthService";
import {decode} from "hono/dist/types/middleware/jwt";
import {Role} from "../enums/Role.enum";
import {AccountService} from "./AccountService";
const cookie = require('cookie')

export class RouteService {

    async handleErrors(c: any, ac: RoleAuth , innerFunc: (...args: any[]) => any) {
        try {
            const objResponse = new AuthService().verifyRoleAuth(ac, this.getCookiesArray(c));
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
            console.error(Errors.CodeError + "\n" + e);
            c.status(500);
            return c.text(Errors.APIError);
        }
    }

    private getCookiesArray(c: any) {
        return c.req.header('cookie').split(" ");
    }

    async getBody(c: any): Promise<JSON> {
        return JSON.parse(await c.req.text());
    }

    getParam(c: any, name: string) {
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

    async setGenAuthToken(c: any, account: object) {
        const test = await this.setGenToken(c, "token", account, process.env.SECRET, 900);
    }

    async setGenRefreshToken(c: any, fingerprint: string, username: string) {
        const token: string = await this.setGenToken(c, "refresh_token", fingerprint, process.env.REFRESH_SECRET, 1800);
        await new AccountService().storeRefreshToken(token, username, fingerprint);
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