import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";

const requestService = new RequestService();

export async function createModule(module: object){
    const createModuleURL = 'http://localhost:8080/module/create';
    let body = JSON.stringify(module);
    try {
        const data = await requestService.FetchPOSTRequest(createModuleURL, body, Accept.JSON);
        const message = data["json"]["message"]
        switch (data["status"]) {
            case 200:
                // clear textboxes
                console.log(message);
                return;
            case 400:
                console.error(message);
                return;
            default:
                console.error("Unknown error");
                return;
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