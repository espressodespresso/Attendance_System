import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";

export interface IModuleService {
    createModule(module: object): Promise<boolean>;
    loadModules(): Promise<object[]>;
    loadModule(moduleName: string): Promise<object>;
    updateModule(moduleName: string, data: object): Promise<void>;
    deleteModule(moduleName: string): Promise<boolean>;
    moduleList(): Promise<object[]>;
}

export class ModuleService extends RequestService implements IModuleService {
    async createModule(module: object): Promise<boolean> {
        const body = JSON.stringify(module);
        const data: object = await super.handleFetch(Fetch.POST, Route.module, "/create", Accept.JSON, body);
        const message = data["json"]["message"]
        switch (data["status"]) {
            case 200:
                // clear textboxes
                console.log(message);
                return true;
            case 400:
                console.error(message);
                return false;
            default:
                console.error("Unknown error");
                return false;
        }
    }

    async loadModules(): Promise<object[]> {
        const data: object = await super.handleFetch(Fetch.GET, Route.module, "/list", Accept.JSON);
        return data["json"];
    }

    async loadModule(moduleName: string): Promise<object> {
        const data: object = await super.handleFetch(Fetch.GET, Route.module, `/${moduleName}`, Accept.JSON);
        return JSON.parse(data["json"]);
    }

    async updateModule(moduleName: string, data: object): Promise<void> {
        const body = {
            name: moduleName,
            data: data
        }

        await super.handleFetch(Fetch.POST, Route.module, "/update", Accept.JSON, JSON.stringify(body));
    }

    async deleteModule(moduleName: string): Promise<boolean> {
        const data: object = await super.handleFetch(Fetch.DELETE, Route.module, `/delete/${moduleName}`)
        return data["success"];
    }

    async moduleList(): Promise<object[]> {
        const data: object = await super.handleFetch(Fetch.GET, Route.module, "/userlist", Accept.JSON);
        return data["json"]["data"];
    }
}