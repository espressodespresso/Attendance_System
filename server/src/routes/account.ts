import {Hono} from "hono";
import {Mongo, AuthState} from "../services/mongo";

const mongo = new Mongo();
export const account = new Hono();

export enum Role{
    Student,
    Lecturer,
    AdministrativeFM,
    IT
}

account.get('/', async (c) => {
    try {
        const token = c.req.header('cookie').split(" ")[1].replace("token=", '');
        const userInfo = await mongo.userInfo(token)
        if(userInfo !== null) {
            console.log("Found! : " + userInfo["username"])
            return c.json({ username: userInfo});
        }

        return c.text("hi")
    } catch {
        console.log("No cookie :(")
        c.status(500);
        return c.text(":(")
    }

    //return c.redirect("/attendance_system/client/src/login.html");
})