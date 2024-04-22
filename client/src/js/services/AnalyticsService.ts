import {RequestService} from "./RequestService";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";
import {Accept} from "../enums/Accept.enum";

export interface IAnalyticsService {
    getUserAttendanceRateData(username: string, module_name: string): Promise<object>;
    getModuleAttendanceRateData(module_name: string): Promise<object>;
    getModuleAverageAttendanceRateData(module_name: string): Promise<object>;
    getUserTableData(username: string, module_name: string): Promise<object>;
    getModuleTableData(module_name: string): Promise<object>;
    getIndexTableData(): Promise<object>;
}

export class AnalyticsService extends RequestService implements IAnalyticsService {
    async getUserAttendanceRateData(username: string, module_name: string): Promise<object> {
        const data: object = await super.handleFetch(Fetch.GET, Route.analytics, `/attendance/${username}/${module_name}`, Accept.JSON);
        return JSON.parse(data["json"]);
    };

    async getModuleAttendanceRateData(module_name: string): Promise<object>  {
        const data: object = await super.handleFetch(Fetch.GET, Route.analytics, `/attendance/${module_name}`, Accept.JSON);
        return JSON.parse(data["json"]);
    };

    async getModuleAverageAttendanceRateData(module_name: string): Promise<object>  {
        const data: object = await super.handleFetch(Fetch.GET, Route.analytics, `/attendance/avg/${module_name}/data`, Accept.JSON);
        return JSON.parse(data["json"]);
    }

    async getUserTableData(username: string, module_name: string): Promise<object>  {
        const data: object = await super.handleFetch(Fetch.GET, Route.analytics, `/table/${username}/${module_name}`, Accept.JSON);
        return JSON.parse(data["json"]);
    }

    async getModuleTableData(module_name: string): Promise<object>  {
        const data: object = await super.handleFetch(Fetch.GET, Route.analytics, `/table/${module_name}`, Accept.JSON);
        return JSON.parse(data["json"]);
    }

    async getIndexTableData(): Promise<object>  {
        const data: object = await super.handleFetch(Fetch.GET, Route.analytics, `/indextable`, Accept.JSON);
        return JSON.parse(data["json"]);
    }
}