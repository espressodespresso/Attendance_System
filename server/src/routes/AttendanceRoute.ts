import {MongoService} from "../services/MongoService";
import {Hono} from "hono";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";
import {decode} from "hono/jwt";
import {RouteService} from "../services/RouteService";
import {Role} from "../enums/Role.enum";
import {elevatedRoleAuth} from "../services/AuthService";
import {AttendanceService} from "../services/AttendanceService";

const attendanceService = new AttendanceService();
const routeService = new RouteService();
export const attendanceRoute = new Hono();

attendanceRoute.get('/take/:name/:date', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
        let active_code: number = await attendanceService.generateAttendanceCode(routeService.getParam(c, 'name')
            , routeService.getParam(c, 'date'));
        return c.json({active_code: active_code});
    });
});

attendanceRoute.get('/end/:code', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
        if(await attendanceService.terminateActiveAttendance(routeService.getParam(c, 'code'))) {
            console.log("Code terminated");
            return c.text(Logs.CodeTerminated);
        }

        c.status(400);
        return c.text(Errors.CodeTerminated);
    });
});

attendanceRoute.post('/attend/:code', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Student]}, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(Errors.NoRefreshToken);
            c.status(401);
            return c.text(Errors.NoRefreshToken);
        }

        const username = decode(token).payload["username"];
        const response: object = await attendanceService.attendActiveAttendance(
            routeService.getParam(c, 'code'), username);
        if(!response["status"]) {
            c.status(400);
            return c.json(JSON.stringify(response["message"]));
        }

        return c.json(JSON.stringify(response["message"]));
    });
});

attendanceRoute.get('/details/:name/:date', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        const data: object = await attendanceService.locateAttended(
            routeService.getParam(c, 'name'), routeService.getParam(c, 'data'));
        if(data != null) {
            return c.json(JSON.stringify(data));
        }

        c.status(400);
        return c.text(Errors.LocateAttendance);
    });
});