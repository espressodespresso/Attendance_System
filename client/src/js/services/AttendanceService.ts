import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";

const requestService = new RequestService();

export async function generateAttendanceCode(module_name: string, date: Date): Promise<number> {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.attendance, `/take/${module_name}/${date}`, Accept.JSON);
    return data["json"]["active_code"];
}

export async function terminateAttendanceCode(active_code: number): Promise<boolean> {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.attendance, `/end/${active_code}`, Accept.JSON)
    if(data["status"] === 200) {
        return true;
    }

    return false;
}

export async function attendActiveAttendance(active_code: number): Promise<object> {
    return await requestService.handleFetch(Fetch.POST, Route.attendance, `/attend/${active_code}`, Accept.JSON, "");
}

export async function locateAttendedDetails(module_name: string, date: Date): Promise<object> {
    return await requestService.handleFetch(Fetch.GET, Route.attendance, `/details/${module_name}/${date}`, Accept.JSON);
}