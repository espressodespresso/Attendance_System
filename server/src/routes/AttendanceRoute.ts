import {MongoService} from "../services/MongoService";
import {Hono} from "hono";
import {Errors} from "../utilities/Errors";
import {moduleRoute} from "./ModuleRoute";
import {Logs} from "../utilities/Logs";
import {decode} from "hono/jwt";
import {RouteService} from "../services/RouteService";

const mongoService = new MongoService();
const routeService = new RouteService();
export const attendanceRoute = new Hono();

attendanceRoute.get('/take/:name/:date', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        let active_code: number = await mongoService.generateAttendanceCode(routeService.getParam(c, 'name')
            , routeService.getParam(c, 'date'));
        return c.json({active_code: active_code});
    });
});

attendanceRoute.get('/end/:code', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        if(await mongoService.terminateActiveAttendance(routeService.getParam(c, 'code'))) {
            console.log("Code terminated");
            return c.text(Logs.CodeTerminated);
        }

        c.status(400);
        return c.text(Errors.CodeTerminated);
    });
});

attendanceRoute.post('/attend/:code', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(Errors.NoRefreshToken);
            c.status(401);
            return c.text(Errors.NoRefreshToken);
        }

        const username = decode(token).payload["username"];
        const response: object = await mongoService.attendActiveAttendance(
            routeService.getParam(c, 'code'), username);
        if(!response["status"]) {
            c.status(400);
            return c.json(JSON.stringify(response["message"]));
        }

        return c.json(JSON.stringify(response["message"]));
    });
});

attendanceRoute.get('/details/:name/:date', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        const data: object = await mongoService.locateAttended(
            routeService.getParam(c, 'name'), routeService.getParam(c, 'data'));
        if(data != null) {
            return c.json(JSON.stringify(data));
        }

        c.status(400);
        return c.text(Errors.LocateAttendance);
    });
});