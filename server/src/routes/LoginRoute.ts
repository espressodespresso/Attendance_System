import {Hono} from "hono";
import {MongoService} from "../services/MongoService";
import {sign} from 'hono/jwt'
import {AuthState} from "../enums/AuthState.enum";
import {Logs} from "../utilities/Logs";
import {Errors} from "../utilities/Errors";
import {RouteService} from "../services/RouteService";
import {Role} from "../enums/Role.enum";
import {AuthService} from "../services/AuthService";
const cookie = require('cookie')

const routeService = new RouteService();
export const loginRoute = new Hono()

loginRoute.post('/', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Exclude]},async (): Promise<Response> => {
        const body: JSON = await routeService.getBody(c);
        const data = await new AuthService().login(body["username"], body["password"]);
        switch (data.authstate) {
            case AuthState.Located:
                await routeService.setGenAuthToken(c, data.account);
                await routeService.setGenRefreshToken(c, body["fingerprint"], body["username"]);
                break;
            case AuthState.InvalidPass:
                c.status(401);
                return c.text(Errors.InvalidPassword);
            case AuthState.NotLocated:
                c.status(401);
                return c.text(Errors.InvalidAccount);
            default:
                console.error(Errors.CodeError);
                return c.text(Errors.APIError);
        }

        return c.text(Logs.Login);
    });

    //console.log(response["headers"].includes("text/plain"));

});