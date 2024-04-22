import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";

export interface IAttendanceService {
    generateAttendanceCode(module_name: string, date: Date): Promise<number>;
    terminateAttendanceCode(active_code: number): Promise<boolean>;
    attendActiveAttendance(active_code: number): Promise<object>;
    locateAttendedDetails(module_name: string, date: Date): Promise<object>
}

export class AttendanceService extends RequestService implements IAttendanceService {
    async generateAttendanceCode(module_name: string, date: Date): Promise<number> {
        const data: object = await super.handleFetch(Fetch.GET, Route.attendance, `/take/${module_name}/${date}`, Accept.JSON);
        return data["json"]["active_code"];
    }

    async terminateAttendanceCode(active_code: number): Promise<boolean> {
        const data: object = await super.handleFetch(Fetch.GET, Route.attendance, `/end/${active_code}`, Accept.JSON)
        if(data["status"] === 200) {
            return true;
        }

        return false;
    }

    async attendActiveAttendance(active_code: number): Promise<object> {
        return await super.handleFetch(Fetch.POST, Route.attendance, `/attend/${active_code}`, Accept.JSON, "");
    }

    async locateAttendedDetails(module_name: string, date: Date): Promise<object> {
        return await super.handleFetch(Fetch.GET, Route.attendance, `/details/${module_name}/${date}`, Accept.JSON);
    }
}
