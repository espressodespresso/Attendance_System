import {Hono} from "hono";
import {elevatedRoleAuth} from "../services/AuthService";
import {Role} from "../enums/Role.enum";
import {ServiceFactory} from "../services/ServiceFactory";
import {IModuleService} from "../services/ModuleService";
import {IRouteService} from "../services/RouteService";
import {IAccountService} from "../services/AccountService";
import {MessageUtility} from "../utilities/MessageUtility";

const moduleService: IModuleService = ServiceFactory.createModuleService();
const routeService: IRouteService = ServiceFactory.createRouteService();
const accountService: IAccountService = ServiceFactory.createAccountService();
const messageUtility: MessageUtility = MessageUtility.getInstance();
export const moduleRoute = new Hono();

moduleRoute.get('/userlist', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        const token: string = routeService.getAuthToken(c);
        if(token === null) {
            console.error(messageUtility.errors.NoAuthToken)
            c.status(401);
            return c.text(messageUtility.errors.NoAuthToken);
        }

        const userInfo = await accountService.getUserInfobyAuthToken(token);
        return c.json({ data: await moduleService.listModules(userInfo) });
    })
})

moduleRoute.post('/create', async (c) => {
   return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
       const body: JSON = await routeService.getBody(c);
       console.log(`here ${await routeService.getBody(c)}`);
       const moduleName = body["name"];
       const moduleLeader = body["leader"];
       if(!await moduleService.verifyModuleExists(moduleName)) {
           if(await accountService.verifyUser(moduleLeader)) {
               await moduleService.createModule(moduleName, body["enrolled"], moduleLeader, body["timetable"]);
               let users: string[] = body["enrolled"];
               users.push(moduleLeader);
               await moduleService.updateUsersModules(users, [], moduleName)
               return c.json({message: messageUtility.logs.ModuleCreation});
           } else {
               console.error(messageUtility.errors.NoModuleLeader);
               c.status(400);
               return c.json({message: messageUtility.errors.NoModuleLeader});
           }
       } else {
           console.error(messageUtility.errors.ModuleExists);
           c.status(400);
           return c.json({message: messageUtility.errors.ModuleExists});
       }
   })
});

moduleRoute.get('/list', async (c) => {
    return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
        return c.json(await moduleService.loadModules());
    });
});

moduleRoute.get('/:name', async (c) => {
   return await routeService.handleErrors(c, {authorised: [Role.All]}, async (): Promise<Response> => {
       const data = await moduleService.loadModule(routeService.getParam(c, 'name'));
       if(data !== null) {
           return c.json(JSON.stringify(data));
       }
   });
});

moduleRoute.post('/update', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
       const body: JSON = await routeService.getBody(c);
        const module_name = body["name"];
        let updatedModule = body["data"];
        const previousModule = await moduleService.loadModule(module_name);
        await moduleService.updateModule(module_name, updatedModule);

        let updatedUsers: string[] = body["data"]["enrolled"];
        updatedUsers.push(updatedModule["leader"]);
        let previousUsers: string[] = previousModule["enrolled"];
        previousUsers.push(previousModule["leader"]);

        let addModule: string[] = [];
        let removeModule: string[] = [];

        for(let i = 0; i < updatedUsers.length; i++) {
            const username = updatedUsers[i];
            if(!previousUsers.includes(username)) {
                addModule.push(username);
            }
        }

        for(let i = 0; i < previousUsers.length; i++) {
            const username = previousUsers[i];
            if(!updatedUsers.includes(username)) {
                removeModule.push(username);
            }
        }

        if(await moduleService.updateUsersModules(addModule, removeModule, module_name)) {
            const newName: string = updatedModule["name"]
            if(module_name !== newName) {
                await moduleService.updateUsersModuleName(module_name, newName);
            }
        }

        return c.text(messageUtility.logs.ModuleCreation);
    });
});



moduleRoute.delete('/delete/:name', async (c) => {
    return await routeService.handleErrors(c, elevatedRoleAuth, async (): Promise<Response> => {
       if(await moduleService.deleteModule(routeService.getParam(c, 'name'))) {
           return c.text(messageUtility.logs.ModuleDelete);
       }  else {
           c.status(400);
           return c.text(messageUtility.errors.NoModuleExists);
       }
    });
})