import {Hono} from "hono";
import {decode} from "hono/jwt";
import {elevatedRoleAuth} from "../services/AuthService";
import {Role} from "../enums/Role.enum";
import {ServiceFactory} from "../services/ServiceFactory";
import {IRouteService} from "../services/RouteService";
import {IAccountService} from "../services/AccountService";
import {MessageUtility} from "../utilities/MessageUtility";


const routeService: IRouteService = ServiceFactory.createRouteService();
const accountService: IAccountService = ServiceFactory.createAccountService();
const messageUtility: MessageUtility = MessageUtility.getInstance();
export const accountRoute = new Hono();

accountRoute.get('/', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Exclude]}, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(messageUtility.errors.NoAuthToken)
            c.status(401);
            return c.text(messageUtility.errors.NoAuthToken);
        }

        const userInfo = await accountService.getUserInfobyAuthToken(token);
        if(userInfo !== null) {
            return c.json({ userinfo: userInfo});
        }

        console.log(messageUtility.logs.AccountRoute);
        return c.text(messageUtility.logs.AccountRoute);
    })
});

accountRoute.post('/auth', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Exclude]}, async (): Promise<Response> => {
        const body: JSON = await routeService.getBody(c);
        const refresh_token: string = routeService.getRefreshToken(c);
        if(refresh_token === null) {
            console.error(messageUtility.errors.NoRefreshToken);
            c.status(401);
            return c.text(messageUtility.errors.NoRefreshToken);
        }

        const verified = await accountService.verifyRefreshToken(refresh_token, body["fingerprint"]);
        if(verified["valid"]) {
            const data = await accountService.getUserInfobyRefreshToken(refresh_token);
            await routeService.setGenAuthToken(c, data);
            console.log(messageUtility.logs.AccountAuthRoute);
            return c.json({ url: '/refresh' })
        } else {
            c.status(403);
            return c.text(messageUtility.errors.TokenVerification);
        }
    })
})

accountRoute.get('/refresh', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        let refresh_token: string = routeService.getRefreshToken(c);
        if(refresh_token === null) {
            console.error(messageUtility.errors.NoRefreshToken);
            c.status(401);
            return c.text(messageUtility.errors.NoRefreshToken);
        }

        const data = await accountService.getUserInfobyRefreshToken(refresh_token);
        const fingerprint = decode(refresh_token).payload;
        await accountService.deleteRefreshToken(data["username"]);
        await routeService.setGenRefreshToken(c, fingerprint, data["username"]);
        console.log(messageUtility.logs.AccountRefreshRoute);
        return c.text(messageUtility.logs.AccountRefreshRoute);
    });
});

accountRoute.get('/verify/:username', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
        if(await accountService.verifyUser(routeService.getParam(c, 'username'))) {
            return c.json({ valid: true })
        }

        return c.json({ valid: false })
    });
});

accountRoute.delete('/logout', async (c) => {
   return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
       const token: string = routeService.getAuthToken(c);
       if(token === null) {
           console.error(messageUtility.errors.NoAuthToken)
           c.status(401);
           return c.text(messageUtility.errors.NoAuthToken);
       }

       let refresh_token: string = routeService.getRefreshToken(c);
       if(refresh_token === null) {
           console.error(messageUtility.errors.NoRefreshToken);
           c.status(401);
           return c.text(messageUtility.errors.NoRefreshToken);
       }

       const userInfo = await accountService.getUserInfobyAuthToken(token);
       if(await accountService.deleteRefreshToken(userInfo["username"])) {
           routeService.logoutToken(c, token, refresh_token);
           console.log(messageUtility.logs.AccountLogout);
           c.status(200);
           return c.text(messageUtility.logs.AccountLogout);
       } else {
           c.status(400);
           console.log(messageUtility.errors.APIError);
           return c.text(messageUtility.errors.APIError);
       }
   });
});

/*accountRoute.get('/update/:username', async (c) => {
   try {

   } catch {
       console.error(Errors.CodeError);
       c.status(500);
       return c.text(Errors.APIError);
   }
});*/