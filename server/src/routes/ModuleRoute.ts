import {MongoService} from "../services/MongoService";
import {Hono} from "hono";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";

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