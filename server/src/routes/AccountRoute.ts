import {Hono} from "hono";
import {MongoService} from "../services/MongoService";

const mongo = new MongoService();
export const accountRoute = new Hono();

accountRoute.get('/', async (c) => {
    try {
        const token = c.req.header('cookie').split(" ")[1].replace("token=", '');
        const userInfo = await mongo.userInfo(token)
        if(userInfo !== null) {
            console.log("Found! : " + userInfo["username"])
            return c.json({ userinfo: userInfo});
        }

        return c.text("hi")
    } catch {
        console.log("No cookie :(")
        c.status(500);
        return c.text(":(")
    }
})