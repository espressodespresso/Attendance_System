import {MongoService} from "../services/MongoService";
import {Hono} from "hono";
import {Errors} from "../utilities/Errors";
import {moduleRoute} from "./ModuleRoute";
import {Logs} from "../utilities/Logs";
import {decode} from "hono/dist/types/middleware/jwt";

const mongo = new MongoService();
export const attendanceRoute = new Hono();

function getParam(c, name: string) {
    return c.req.param(name);
}

attendanceRoute.get('/take/:name/:date', async (c) => {
    try{
        let active_code: number = await mongo.generateAttendanceCode(getParam(c, 'name')
            , getParam(c, 'date'));
        return c.json({active_code: active_code});
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
});

attendanceRoute.get('/end/:code', async (c) => {
    try{
        if(await mongo.terminateActiveAttendance(getParam(c, 'code'))) {
            return c.text(Logs.CodeTerminated);
        }

        c.status(400);
        return c.text(Errors.CodeTerminated);
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
});

attendanceRoute.post('/attend/:code', async (c) => {
    try{
        let token: string;
        const cookies = c.req.header('cookie').split(" ");
        for(let i = 0; i < cookies.length; i++) {
            if(cookies[i].startsWith("token=")) {
                token = cookies[i].replace("token=", '');
                break;
            }
        }
        const username = decode(token).payload["username"];
        const response: object = await mongo.attendActiveAttendance(getParam(c, 'code'), username);
        if(!response["status"]) {
            c.status(400);
            return c.json(JSON.stringify(response));
        }

        return c.json(JSON.stringify(response));
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
});

attendanceRoute.get('/details/:name/:date', async (c) => {
    try{
        const data: object = await mongo.locateAttended(getParam(c, 'name'), getParam(c, 'data'));
        if(data != null) {
            return c.json(JSON.stringify(data));
        }

        c.status(400);
        return c.text(Errors.LocateAttendance);
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
});