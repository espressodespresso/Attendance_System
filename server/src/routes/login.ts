import {Hono} from "hono";
import {Mongo, AuthState} from "../services/mongo";
import {setCookie, setSignedCookie} from "hono/dist/types/helper/cookie";
import {sign} from 'hono/jwt'
const cookie = require('cookie')

const mongo = new Mongo();
export const login = new Hono()

login.post('/', async (c) => {
    const body: JSON = JSON.parse(await c.req.text());
    const data = await mongo.login(body["username"], body["password"]);
    switch (data.authstate) {
        case AuthState.Located:
            const token = await sign(data.account, process.env.SECRET);
            console.log("hello")
            console.log(data.account);
            const setCookie = cookie.serialize("token", token, {
                maxAge: 900,
                httpOnly: true
            })

            c.res.headers.append('set-cookie', setCookie);
            //return c.text("redirecting...")
            break;
        case AuthState.InvalidPass:
            return c.text("Username or password incorrect");
        case AuthState.NotLocated:
            return c.text("Account not located")
        default:
            return c.text("Error occured")
    }
    return c.text(data.authstate.toString());
})

/*login.post('/', async (c)=> {
    const body: JSON = JSON.parse( await c.req.text());
    const username = body["username"]
    console.log(username);
    c.status(200);
    c.text("hi");
    /*switch (await mongo.login(username, body["password"])) {
        case AuthState.Located:
            const token = await sign(username, process.env.SECRET);
            const setCookie = cookie.serialize("token", token, {
                maxAge: 900,
                httpOnly: true
            })
            c.res.headers.append('set-cookie', setCookie);

            console.log("hi");
            break;
            //return c.redirect("http://localhost:63342/attendance_system/client/src/index.html")
        case AuthState.InvalidPass:
            return c.text("Username or password incorrect");
        case AuthState.NotLocated:
            return c.text("Account not located")
        default:
            return c.text("Error occured")
    }
})*/


