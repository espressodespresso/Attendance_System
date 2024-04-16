import {RequestService} from "./RequestService";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";
import {Accept} from "../enums/Accept.enum";

const requestService = new RequestService();

export async function getUserAttendanceRateData(username: string, module_name: string) {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.analytics, `/attendance/${username}/${module_name}`, Accept.JSON);
    return data["json"];
};

export async function getModuleAttendanceRateData(module_name: string) {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.analytics, `/attendance/${module_name}`, Accept.JSON);
    return data["json"];
};

export async function getModuleAverageAttendanceRateData(module_name: string) {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.analytics, `/attendance/avg/${module_name}/data`, Accept.JSON);
    return data["json"];
}

export async function getUserTableData(username: string, module_name: string) {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.analytics, `/table/${username}/${module_name}`, Accept.JSON);
    return data["json"];
}

export async function getModuleTableData(module_name: string) {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.analytics, `/table/${module_name}`, Accept.JSON);
    return data["json"];
}