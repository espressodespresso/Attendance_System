import {Hono} from "hono";
import {decode, sign} from "hono/jwt";
import cookie from "cookie";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";
import {MongoService} from "../services/MongoService";
import {RouteService} from "../services/RouteService";

const mongoService = new MongoService();
const routeService = new RouteService();
export const accountRoute = new Hono();

accountRoute.get('/', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(Errors.NoAuthToken)
            c.status(401);
            return c.text(Errors.NoAuthToken);
        }

        const userInfo = await mongoService.userInfo(token);
        if(userInfo !== null) {
            return c.json({ userinfo: userInfo});
        }

        console.log(Logs.AccountRoute);
        return c.text(Logs.AccountRoute);
    })
});

accountRoute.post('/auth', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        const body: JSON = await routeService.getBody(c);
        const refresh_token: string = routeService.getRefreshToken(c);
        if(refresh_token === null) {
            console.error(Errors.NoRefreshToken);
            c.status(401);
            return c.text(Errors.NoRefreshToken);
        }

        const verified = await mongoService.verifyRefreshToken(refresh_token, body["fingerprint"]);
        if(verified.valid) {
            const data = await mongoService.getAccountDetailsViaRT(refresh_token);
            await routeService.setGenAuthToken(c, data);
            console.log(Logs.AccountAuthRoute);
            return c.json({ url: 'http://localhost:8080/account/refresh' })
        } else {
            c.status(403);
            return c.text(Errors.TokenVerification);
        }
    })
})

accountRoute.get('/refresh', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        let refresh_token: string = routeService.getRefreshToken(c);
        if(refresh_token === null) {
            console.error(Errors.NoRefreshToken);
            c.status(401);
            return c.text(Errors.NoRefreshToken);
        }

        const data = await mongoService.getAccountDetailsViaRT(refresh_token);
        const fingerprint = decode(refresh_token).payload;
        await mongoService.deleteRefreshToken(refresh_token);
        await routeService.setGenRefreshToken(c, fingerprint, data["username"]);
        console.log(Logs.AccountRefreshRoute);
        return c.text(Logs.AccountRefreshRoute);
    });
});

accountRoute.get('/verify/:username', async (c) => {
    return await routeService.handleErrors(c, async (): Promise<Response> => {
        if(await mongoService.verifyUser(routeService.getParam(c, 'username'))) {
            return c.json({ valid: true })
        }

        return c.json({ valid: false })
    })
});

/*accountRoute.get('/update/:username', async (c) => {
   try {

   } catch {
       console.error(Errors.CodeError);
       c.status(500);
       return c.text(Errors.APIError);
   }
});*/