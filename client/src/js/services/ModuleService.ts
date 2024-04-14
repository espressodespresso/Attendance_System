import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";

const requestService = new RequestService();

export async function createModule(module: object): Promise<boolean> {
    const body = JSON.stringify(module);
    const data: object = await requestService.handleFetch(Fetch.POST, Route.module, "/create", Accept.JSON, body);
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

export async function loadModules(): Promise<object[]> {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.module, "/list", Accept.JSON);
    return data["json"];
}

export async function loadModule(moduleName: string) {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.module, `/${moduleName}`, Accept.JSON);
    return data["json"];
}

export async function updateModule(moduleName: string, data: object) {
    const body = {
        name: moduleName,
        data: data
    }
    await requestService.handleFetch(Fetch.POST, Route.module, "/update", Accept.JSON, JSON.stringify(body));
}

export async function deleteModule(moduleName: string): Promise<boolean> {
    const data: object = await requestService.handleFetch(Fetch.DELETE, Route.module, `/delete/${moduleName}`)
    return data["success"];
}