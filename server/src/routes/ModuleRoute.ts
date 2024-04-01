import {MongoService} from "../services/MongoService";
import {Hono} from "hono";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";
import {updateUsersModules} from "../services/ModuleService";

const mongo = new MongoService();
export const moduleRoute = new Hono();

moduleRoute.post('/create', async (c) => {
   try {
       const body: JSON = JSON.parse(await c.req.text());
       const moduleName = body["name"];
       const moduleLeader = body["leader"];
       if(!await mongo.verifyModuleExists(moduleName)) {
           if(await mongo.verifyUser(moduleLeader)) {
               await mongo.createModule(moduleName, body["enrolled"], moduleLeader, body["timetable"]);
               let users: string[] = body["enrolled"];
               users.push(moduleLeader);
               if(await updateUsersModules(users, [], moduleName)) {
                   console.log("Updated all");
               } else {
                   console.error("Unsuccessfully updated all");
               }
               return c.json({message: Logs.ModuleCreation});
           } else {
               console.error(Errors.NoModuleLeader);
               c.status(400);
               return c.json({message: Errors.NoModuleLeader});
           }
       } else {
           console.error(Errors.ModuleExists);
           c.status(400);
           return c.json({message: Errors.ModuleExists});
       }
   } catch {
       console.error(Errors.CodeError);
       c.status(500);
       return c.text(Errors.APIError);
   }
});

moduleRoute.get('/list', async (c) => {
   try {
       return c.json(await mongo.loadModules());
   } catch {
       console.error(Errors.CodeError);
       c.status(500);
       return c.text(Errors.APIError);
   }
});

moduleRoute.post('/update', async (c) => {
    try {
        const body: JSON = JSON.parse(await c.req.text());
        const module_name = body["name"];
        const previousModule = await mongo.loadModule(module_name);
        let updatedModule = body["data"];
        await mongo.updateModule(module_name, updatedModule);

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

        if(await updateUsersModules(addModule, removeModule, module_name)) {
            console.log("Updated all");
        } else {
            console.error("Unsuccessfully updated all");
        }
        return c.text(Logs.ModuleCreation);
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
});



moduleRoute.delete('delete/:name', async (c) => {
    try {
        console.log(c.req.param('name'));
        if(await mongo.deleteModule(c.req.param('name'))) {
            return c.text(Logs.ModuleDelete);
        } else {
            c.status(400);
            return c.text(Errors.NoModuleExists);
        }
    } catch {
        console.error(Errors.CodeError);
        c.status(500);
        return c.text(Errors.APIError);
    }
})