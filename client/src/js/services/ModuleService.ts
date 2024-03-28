import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";

const requestService = new RequestService();

export async function createModule(module: object): Promise<boolean> {
    const createModuleURL = 'http://localhost:8080/module/create';
    let body = JSON.stringify(module);
    try {
        const data = await requestService.FetchPOSTRequest(createModuleURL, body, Accept.JSON);
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
    } catch (e) {
        console.error("No Tokens");
    }
}

export async function loadModules(): Promise<object[]> {
    const loadModulesURL = 'http://localhost:8080/module/list';
    try {
        const data = await requestService.FetchGETRequest(loadModulesURL, Accept.JSON);
        return data["json"];

    } catch (e) {
        console.error("No Tokens");
    }
}

export async function updateModule(moduleName: string, data: object) {
    const updateModuleURL = 'http://localhost:8080/module/update';
    try {
        const body = {
            name: moduleName,
            data: data
        }
        await requestService.FetchPOSTRequest(updateModuleURL, JSON.stringify(body), Accept.JSON);
        console.log("Success");
    } catch (e) {
        console.error("No Tokens");
    }
}

export async function deleteModule(moduleName: string): Promise<boolean> {
    const deleteModuleURL = 'http://localhost:8080/module/delete/' + moduleName;
    try {
        const result = await requestService.FetchDELETERequest(deleteModuleURL);
        if(result) {
            console.log("Success");
        } else {
            console.error("Error while deleting module");
        }

        return result;
    } catch (e) {
        console.error("No Tokens");
    }
}