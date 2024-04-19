import {Hono} from "hono";
import {decode} from "hono/jwt";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";
import {RouteService} from "../services/RouteService";
import {elevatedRoleAuth} from "../services/AuthService";
import {Role} from "../enums/Role.enum";
import {AccountService} from "../services/AccountService";


const routeService = new RouteService();
const accountService = new AccountService();
export const accountRoute = new Hono();

accountRoute.get('/', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Exclude]}, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(Errors.NoAuthToken)
            c.status(401);
            return c.text(Errors.NoAuthToken);
        }

        const userInfo = await accountService.getUserInfobyAuthToken(token);
        if(userInfo !== null) {
            return c.json({ userinfo: userInfo});
        }

        console.log(Logs.AccountRoute);
        return c.text(Logs.AccountRoute);
    })
});

accountRoute.post('/auth', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.Exclude]}, async (): Promise<Response> => {
        const body: JSON = await routeService.getBody(c);
        const refresh_token: string = routeService.getRefreshToken(c);
        if(refresh_token === null) {
            console.error(Errors.NoRefreshToken);
            c.status(401);
            return c.text(Errors.NoRefreshToken);
        }

        const verified = await accountService.verifyRefreshToken(refresh_token, body["fingerprint"]);
        if(verified.valid) {
            const data = await accountService.getUserInfobyRefreshToken(refresh_token);
            await routeService.setGenAuthToken(c, data);
            console.log(Logs.AccountAuthRoute);
            return c.json({ url: '/refresh' })
        } else {
            c.status(403);
            return c.text(Errors.TokenVerification);
        }
    })
})

accountRoute.get('/refresh', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        let refresh_token: string = routeService.getRefreshToken(c);
        if(refresh_token === null) {
            console.error(Errors.NoRefreshToken);
            c.status(401);
            return c.text(Errors.NoRefreshToken);
        }

        const data = await accountService.getUserInfobyRefreshToken(refresh_token);
        const fingerprint = decode(refresh_token).payload;
        await accountService.deleteRefreshToken(data["username"]);
        await routeService.setGenRefreshToken(c, fingerprint, data["username"]);
        console.log(Logs.AccountRefreshRoute);
        return c.text(Logs.AccountRefreshRoute);
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
           console.error(Errors.NoAuthToken)
           c.status(401);
           return c.text(Errors.NoAuthToken);
       }

       let refresh_token: string = routeService.getRefreshToken(c);
       if(refresh_token === null) {
           console.error(Errors.NoRefreshToken);
           c.status(401);
           return c.text(Errors.NoRefreshToken);
       }

       const userInfo = await accountService.getUserInfobyAuthToken(token);
       if(await accountService.deleteTokensLogout(userInfo["username"])) {
           routeService.logoutToken(c, token, refresh_token);
           console.log(Logs.AccountLogout);
           c.status(200);
           return c.text(Logs.AccountLogout);
       } else {
           c.status(400);
           console.log(Errors.APIError);
           return c.text(Errors.APIError);
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