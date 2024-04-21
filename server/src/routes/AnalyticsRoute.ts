import {Hono} from "hono";
import {Role} from "../enums/Role.enum";
import {elevatedRoleAuth} from "../services/AuthService";
import {ServiceFactory} from "../services/ServiceFactory";
import {IRouteService} from "../services/RouteService";
import {IAnalyticsService} from "../services/AnalyticsService";
import {MessageUtility} from "../utilities/MessageUtility";


const routeService: IRouteService = ServiceFactory.createRouteService();
const analyticsService: IAnalyticsService = ServiceFactory.createAnalyticsService();
const messageUtility: MessageUtility = MessageUtility.getInstance();
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
            console.error(messageUtility.errors.CodeError);
            return c.text(messageUtility.errors.CodeError);
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
            console.error(messageUtility.errors.CodeError);
            return c.text(messageUtility.errors.CodeError);
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
            console.error(messageUtility.errors.CodeError);
            return c.text(messageUtility.errors.CodeError);
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
            console.error(messageUtility.errors.CodeError);
            return c.text(messageUtility.errors.CodeError);
        }

        console.log(response["message"]);
        return c.json(JSON.stringify(response));
    });
});

analyticsRoute.get('/indextable', async(c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(messageUtility.errors.NoAuthToken)
            c.status(401);
            return c.text(messageUtility.errors.NoAuthToken);
        }

        const userInfo = await ServiceFactory.createAccountService().getUserInfobyAuthToken(token);
        const response: object = await analyticsService.getIndexTableData(userInfo);
        if(response === null) {
            c.status(400);
            console.error(messageUtility.errors.CodeError);
            return c.text(messageUtility.errors.CodeError);
        }

        console.log(response["message"]);
        return c.json(JSON.stringify(response));
    })
})