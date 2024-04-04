import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";

const requestService = new RequestService();

export async function generateAttendanceCode(module_name: string, date: Date): Promise<number> {
    const generateAttendanceCodeURL = 'http://localhost:8080/attendance/take/' + module_name + '/' + date;
    try {
        const data = await requestService.FetchGETRequest(generateAttendanceCodeURL, Accept.JSON);
        return data["json"]["active_code"];
    } catch (e) {
        console.error("No tokens");
    }
}

export async function terminateAttendanceCode(active_code: number): Promise<boolean> {
    const generateAttendanceCodeURL = 'http://localhost:8080/attendance/end/' + active_code;
    try {
        const data = await requestService.FetchGETRequest(generateAttendanceCodeURL, Accept.JSON);
        if(data["status"] === 200) {
            return true;
        }

        return false;
    } catch (e) {
        console.error("No tokens");
    }
}

export async function attendActiveAttendance(active_code: number): Promise<object> {
    const attendActiveAttendanceURL = 'http://localhost:8080/attendance/attend/' + active_code;
    try {
        return await requestService.FetchPOSTRequest(attendActiveAttendanceURL, "", Accept.JSON);
    } catch (e) {
        console.error("No tokens");
    }
}

export async function locateAttendedDetails(module_name: string, date: Date): Promise<object> {
    const locateAttendedDetailsURL = 'http://localhost:8080/attendance/details/' + module_name + '/' + date;
    try {
        return await requestService.FetchGETRequest(locateAttendedDetailsURL, Accept.JSON);
    } catch (e) {
        console.error("No tokens");
    }
}