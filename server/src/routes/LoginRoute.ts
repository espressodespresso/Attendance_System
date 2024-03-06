import {Hono} from "hono";
import {MongoService} from "../services/MongoService";
import {sign} from 'hono/jwt'
import {AuthState} from "../enums/AuthState.enum";
import {Logs} from "../utilities/Logs";
import {Errors} from "../utilities/Errors";
const cookie = require('cookie')

const mongo = new MongoService();
export const loginRoute = new Hono()

loginRoute.post('/', async (c) => {
    const body: JSON = JSON.parse(await c.req.text());
    const data = await mongo.login(body["username"], body["password"]);
    switch (data.authstate) {
        case AuthState.Located:
            const authToken = await sign(data.account, process.env.SECRET);
            console.log(data.account);
            const setCookieAuth = cookie.serialize("token", authToken, {
                maxAge: 900,
                httpOnly: true
            });

            c.res.headers.append('set-cookie', setCookieAuth);

            const refreshToken = await sign(body["fingerprint"], process.env.REFRESH_SECRET);
            const setCookieRefresh = cookie.serialize("refresh_token", refreshToken, {
                maxAge: 1800,
                httpOnly: true
            });

            await mongo.storeRefreshToken(refreshToken, body["username"], body["fingerprint"]);
            c.res.headers.append('set-cookie', setCookieRefresh);

            //return c.text("redirecting...")
            break;
        case AuthState.InvalidPass:
            c.status(401);
            return c.text(Errors.InvalidPassword);
        case AuthState.NotLocated:
            c.status(401);
            return c.text(Errors.InvalidAccount);
        default:
            console.error(Errors.CodeError);
            return c.text(Errors.APIError);
    }

    return c.text(Logs.Login);
})