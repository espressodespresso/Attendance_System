import {Hono} from "hono";
import {MongoService} from "../services/MongoService";
import {sign} from "hono/jwt";
import cookie from "cookie";

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
                console.log("401 whomp whomp");
                c.status(401);
                return c.text(":(");
            }
        }
        console.log("heree")

        //const token = c.req.header('cookie').split(" ")[1].replace("token=", '');
        const userInfo = await mongo.userInfo(token)
        console.log("hereee")

        if(userInfo !== null) {
            console.log("Found! : " + userInfo["username"])
            return c.json({ userinfo: userInfo});
        }

        console.log("hereeee")

        return c.text("hi")
    } catch {
        console.log("No cookie :(")
        c.status(500);
        return c.text(":(")
    }
})

accountRoute.post('/refresh', async (c) => {
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
                console.log("401 whomp whomp");
                c.status(401);
                return c.text(":(");
            }
        }

        console.log("w");
        console.log(refresh_token);
        console.log(body["fingerprint"]);

        const verified = await mongo.verifyRefreshToken(refresh_token, body["fingerprint"]);
        console.log("ww");
        console.log(verified);
        if(verified.valid) {
            console.log("d");
            const data = await mongo.getAccountDetailsViaRT(refresh_token);
            console.log("dd");
            console.log(data);
            const authToken = await sign(data, process.env.SECRET);
            console.log("ddd");
            const setCookieAuth = cookie.serialize("token", authToken, {
                maxAge: 900,
                httpOnly: true
            });

            console.log("www");

            c.res.headers.append('set-cookie', setCookieAuth);

            await mongo.deleteRefreshToken(refresh_token);
            refresh_token = await sign(data["username"], process.env.REFRESH_SECRET);
            const setCookieRefresh = cookie.serialize("refresh_token", refresh_token, {
                maxAge: 1800,
                httpOnly: true
            });

            console.log("wwwww");

            await mongo.storeRefreshToken(refresh_token, data["username"], body["fingerprint"]);
            c.res.headers.append('set-cookie', setCookieRefresh);

            console.log("wwwwwww");

        } else {
            return c.status(403);
        }

    } catch {
        c.status(500);
        return c.text(":(");
    }
})