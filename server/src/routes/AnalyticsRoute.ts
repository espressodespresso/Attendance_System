import {Hono} from "hono";
import {RouteService} from "../services/RouteService";
import {AnalyticsService} from "../services/AnalyticsService";
import {Role} from "../enums/Role.enum";
import {elevatedRoleAuth} from "../services/AuthService";
import {Errors} from "../utilities/Errors";
import {AccountService} from "../services/AccountService";

const routeService = new RouteService()
const analyticsService = new AnalyticsService();
export const analyticsRoute = new Hono();

analyticsRoute.get('/attendance/:user/:module', async (c) => {
   return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
       const response: object = await analyticsService.getUserAttendanceRateData
       (routeService.getParam(c, 'user'), routeService.getParam(c, 'module'));
       if(response["data"] === null) {
           c.status(400);
           console.error(response["message"]);
           return c.text(response["message"]);
       }

       console.log(response["message"]);
       return c.json(JSON.stringify(response));
   });
});

analyticsRoute.get('/attendance/:module', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
        const response: object = await analyticsService.getModuleAttendanceRate(routeService.getParam(c, 'module'));
        if(response === null) {
            c.status(400);
            console.error(Errors.CodeError);
            return c.text(Errors.CodeError);
        }

        console.log(response["message"]);
        return c.json(JSON.stringify(response));
    });
});

analyticsRoute.get('/attendance/avg/:module/data', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
        const response: object = await analyticsService.getAverageAttendanceRate(routeService.getParam(c, 'module'));
        if(response === null) {
            c.status(400);
            console.error(Errors.CodeError);
            return c.text(Errors.CodeError);
        }

        console.log(response["message"]);
        return c.json(JSON.stringify(response));
    });
});

analyticsRoute.get('/table/:user/:module', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        const response: object = await analyticsService.getUserTableData(routeService.getParam(c, 'user')
            ,routeService.getParam(c, 'module'));
        if(response === null) {
            c.status(400);
            console.error(Errors.CodeError);
            return c.text(Errors.CodeError);
        }

        console.log(response["message"]);
        return c.json(JSON.stringify(response));
    });
});

analyticsRoute.get('/table/:module', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
        const response: object = await analyticsService.getModuleTableData(routeService.getParam(c, 'module'));
        if(response === null) {
            c.status(400);
            console.error(Errors.CodeError);
            return c.text(Errors.CodeError);
        }

        console.log(response["message"]);
        return c.json(JSON.stringify(response));
    });
});

analyticsRoute.get('/indextable', async(c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(Errors.NoAuthToken)
            c.status(401);
            return c.text(Errors.NoAuthToken);
        }

        const userInfo = await new AccountService().getUserInfobyAuthToken(token);
        const response: object = await analyticsService.getIndexTableData(userInfo);
        if(response === null) {
            c.status(400);
            console.error(Errors.CodeError);
            return c.text(Errors.CodeError);
        }

        console.log(response["message"]);
        return c.json(JSON.stringify(response));
    })
})