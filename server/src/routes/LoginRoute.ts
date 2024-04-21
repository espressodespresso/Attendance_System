import {Hono} from "hono";
import {AuthState} from "../enums/AuthState.enum";
import {Role} from "../enums/Role.enum";
import {ServiceFactory} from "../services/ServiceFactory";
import {IRouteService} from "../services/RouteService";
import {MessageUtility} from "../utilities/MessageUtility";
const cookie = require('cookie')

const routeService: IRouteService = ServiceFactory.createRouteService();
const messageUtility: MessageUtility = MessageUtility.getInstance();
export const loginRoute = new Hono()

loginRoute.post('/', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Exclude]},async (): Promise<Response> => {
        const body: JSON = await routeService.getBody(c);
        const data = await ServiceFactory.createAuthService().login(body["username"], body["password"]);
        switch (data["authstate"]) {
            case AuthState.Located:
                await routeService.setGenAuthToken(c, data["account"]);
                await routeService.setGenRefreshToken(c, body["fingerprint"], body["username"]);
                break;
            case AuthState.InvalidPass:
                c.status(401);
                return c.text(messageUtility.errors.InvalidPassword);
            case AuthState.NotLocated:
                c.status(401);
                return c.text(messageUtility.errors.InvalidAccount);
            default:
                console.error(messageUtility.errors.CodeError);
                return c.text(messageUtility.errors.APIError);
        }

        return c.text(messageUtility.logs.Login);
    });
});