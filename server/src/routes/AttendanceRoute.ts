import {Hono} from "hono";
import {decode} from "hono/jwt";
import {Role} from "../enums/Role.enum";
import {elevatedRoleAuth} from "../services/AuthService";
import {ServiceFactory} from "../services/ServiceFactory";
import {IAttendanceService} from "../services/AttendanceService";
import {IRouteService} from "../services/RouteService";
import {MessageUtility} from "../utilities/MessageUtility";

const attendanceService: IAttendanceService = ServiceFactory.createAttendanceService();
const routeService: IRouteService = ServiceFactory.createRouteService();
const messageUtility: MessageUtility = MessageUtility.getInstance();
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
            return c.text(messageUtility.logs.CodeTerminated);
        }

        c.status(400);
        return c.text(messageUtility.errors.CodeTerminated);
    });
});

attendanceRoute.post('/attend/:code', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Student]}, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(messageUtility.errors.NoRefreshToken);
            c.status(401);
            return c.text(messageUtility.errors.NoRefreshToken);
        }

        const username = decode(token).payload["username"];
        const response: object = await attendanceService.attendActiveAttendance(
            routeService.getParam(c, 'code'), username);
        if(!JSON.stringify(response["status"])) {
            c.status(400);
            return c.json(JSON.stringify(response));
        }

        return c.json(JSON.stringify(response));
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
        return c.text(messageUtility.errors.LocateAttendance);
    });
});