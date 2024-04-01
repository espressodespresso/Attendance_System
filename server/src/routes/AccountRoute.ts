import {Hono} from "hono";
import {MongoService} from "../services/MongoService";
import {decode, sign} from "hono/jwt";
import cookie from "cookie";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";

const mongo = new MongoService();
export const accountRoute = new Hono();

accountRoute.get('/', async (c) => {
    try {
        let token: string;
        const cookies = c.req.header('cookie').split(" ");
        for(let i = 0; i < cookies.length; i++) {
            if(cookies[i].startsWith("token=")) {
                token = cookies[i].replace("token=", '');
                break;
            }

            if(i === cookies.length-1) {
                console.error(Errors.NoAuthToken)
                c.status(401);
                return c.text(":(");
            }
        }

        const userInfo = await mongo.userInfo(token)
        if(userInfo !== null) {
            return c.json({ userinfo: userInfo});
        }

        console.log(Logs.AccountRoute);
        return c.text(Logs.AccountRoute);
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
})

accountRoute.post('/auth', async (c) => {
    try {
        const body: JSON = JSON.parse(await c.req.text());
        let refresh_token: string;
        const cookies = c.req.header('cookie').split(" ");
        for(let i = 0; i < cookies.length; i++) {
            if(cookies[i].startsWith("refresh_token=")) {
                refresh_token = cookies[i].replace("refresh_token=", '');
                break;
            }

            if(i === cookies.length-1) {
                console.error(Errors.NoRefreshToken);
                c.status(401);
                return c.text(Errors.NoRefreshToken);
            }
        }

        const verified = await mongo.verifyRefreshToken(refresh_token, body["fingerprint"]);
        if(verified.valid) {
            const data = await mongo.getAccountDetailsViaRT(refresh_token);
            const authToken = await sign(data, process.env.SECRET);
            const setCookieAuth = cookie.serialize("token", authToken, {
                maxAge: 900,
                httpOnly: true,
                path: "/"
            });

            c.res.headers.append('set-cookie', setCookieAuth);
            console.log(Logs.AccountAuthRoute);
            return c.json({ url: 'http://localhost:8080/account/refresh' })
        } else {
            c.status(403);
            return c.text(Errors.TokenVerification);
        }

    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
})

accountRoute.get('/refresh', async (c) => {
    try {
        let refresh_token: string;
        const cookies = c.req.header('cookie').split(" ");
        for(let i = 0; i < cookies.length; i++) {
            if(cookies[i].startsWith("refresh_token=")) {
                refresh_token = cookies[i].replace("refresh_token=", '');
                break;
            }

            if(i === cookies.length-1) {
                console.error(Errors.NoRefreshToken);
                c.status(401);
                return c.text(Errors.NoRefreshToken);
            }
        }

        const data = await mongo.getAccountDetailsViaRT(refresh_token);
        const fingerprint = decode(refresh_token).payload;
        await mongo.deleteRefreshToken(refresh_token);
        refresh_token = await sign(fingerprint, process.env.REFRESH_SECRET);
        const setCookieRefresh = cookie.serialize("refresh_token", refresh_token, {
            maxAge: 1800,
            httpOnly: true,
            path: "/"
        });

        await mongo.storeRefreshToken(refresh_token, data["username"], fingerprint);
        c.res.headers.set('set-cookie', setCookieRefresh);
        console.log(Logs.AccountRefreshRoute);
        return c.text(Logs.AccountRefreshRoute);
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
});

accountRoute.get('/verify/:username', async (c) => {
    try {
        //const body: JSON = JSON.parse(await c.req.text());
        if(await mongo.verifyUser(c.req.param('username'))) {
            console.log("User exists");
            return c.json({ valid: true })
        }

        console.log("User doesn't exist");
        return c.json({ valid: false })
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
});

accountRoute.get('/update/:username', async (c) => {
   try {

   } catch {
       console.error(Errors.CodeError);
       c.status(500);
       return c.text(Errors.APIError);
   }
});