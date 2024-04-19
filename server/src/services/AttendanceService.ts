import {MongoService} from "./MongoService";
import {AccountService} from "./AccountService";
import {Collection} from "../enums/Collection.enum";
import {Logs} from "../utilities/Logs";
import {Errors} from "../utilities/Errors";
import {ModuleService} from "./ModuleService";

export class AttendanceService {
    private _mongoService: MongoService = null;
    
    constructor() {
        this._mongoService = new MongoService;
    }

    private generateCode(): number {
        return Math.round(Math.random() * (99999 - 10000) + 10000);
    }

    private async updateUserAttendance(username: string,attendance: object[], module_name: string
                                       , date: Date): Promise<boolean> {
        const located: object[] = attendance.filter(object => object["module"] === module_name);

        if(located.length > 0) {
            // Module with that name is found
            const module: object = located[0];
            const objAttended: Date[] = module["attended"];
            // Attended date is pushed into the array
            objAttended.push(date);
            // Create the replacment object with the updated date attended
            const updatedAttendance: object = {
                module: module_name,
                attended: objAttended
            }
            // Replace the object with the updated attendance object
            attendance[attendance.indexOf(module)] = updatedAttendance;
        } else {
            // Module with the name isn't found hence has not attended before
            // Define a new date array and attendance object
            const attended: Date[] = [];
            attended.push(date);
            const attendanceObj: object = {
                module: module_name,
                attended: attended
            };
            // Attended date is pushed into the array
            attendance.push(attendanceObj);
        }

        const update = {
            $set: {
                attended: attendance
            },
        };

        // Update the section within the users document in the database
        if(await new AccountService().updateUser(username, update)) {
            return true;
        }

        return false;
    }

    private async locateActiveCode(code: number): Promise<object> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { active_code: code };
            return await this._mongoService.findOne(query, Collection.attendance);
        });

        return response;
    }

    async generateAttendanceCode(module_name: string, date: Date): Promise<number> {
        console.log("here");
        const attended: string[] = [];
        let code: number = null;
        while(code === null) {
            let temp = this.generateCode();
            const locateResponse: object = await this.locateActiveCode(temp);
            if(!locateResponse["status"]) {
                code = temp;
            }
        }

        console.log("Code Generated - " + code);
        const data = {
            active_code: code.toString(),
            module: module_name,
            date: new Date(date).toISOString(),
            attended: attended
        }

        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            return await this._mongoService.insertOne(data, Collection.attendance);
        });

        if(response["status"]) {
            console.log(Logs.CodeGenerated);
        } else {
            console.error(Errors.CodeGenerated);
        }

        return code;
    }

    async terminateActiveAttendance(active_code: number): Promise<boolean> {
        const codeResponse: object = await this.locateActiveCode(active_code);
        if(codeResponse["status"]) {
            const prevdata = codeResponse["result"];
            const attended = prevdata["attended"];
            console.log(attended);
            const attendance = {
                used_code: active_code.toString(),
                module: prevdata["module"],
                date: prevdata["date"],
                attended: attended
            }

            const response: object = await this._mongoService.handleConnection
            (async (): Promise<object> => {
                const query = { active_code: active_code }
                return await this._mongoService.replaceOne(query, attendance, Collection.attendance);
            });

            if(response["status"]) {
                console.log(Logs.CodeTerminated);
            } else {
                console.error(Errors.CodeTerminated);
            }

            return true;
        }

        return false;
    }

    async attendActiveAttendance(active_code: number, username: string): Promise<object> {
        const codeResponse: object = await this.locateActiveCode(active_code);
        if(!codeResponse["status"]) {
            return this.altObj(false, Errors.NoAttendanceCode);
        }

        const attendanceData: object = codeResponse["result"];

        const moduleName = attendanceData["module"];
        const moduleData = await new ModuleService().loadModule(moduleName);
        if(!(moduleData["enrolled"] as string[]).includes(username)) {
            return this.altObj(false, Errors.NotEnrolled);
        }

        const attended: string[] = attendanceData["attended"];
        if(attended.includes(username)) {
            return this.altObj(false, Errors.AttendedPreviously);
        }

        attended.push(username);
        const update = {
            $set: {
                attended: attended
            },
        };

        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { active_code: active_code.toString() };
            return await this._mongoService.updateOne(query, update, Collection.attendance);
        });

        if(!response["status"]) {
            return this.altObj(false, Errors.AttendanceModification);
        }

        const userData = await new AccountService().getUserInfobyUsername(username);
        const attendance: object[] = userData["attended"];

        if(!await this.updateUserAttendance(username, attendance, moduleName, attendanceData["date"])) {
            return this.altObj(false, Errors.UserUpdateAttendance);
        }

        return this.altObj(true, Logs.UserAttended);
    }

    private altObj(status: boolean, message: string) {
        return {
            status: status,
            message: message
        };
    }

    async locateAttended(module_name: string, date: Date): Promise<object> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = {
                module: module_name,
                date: new Date(date).toISOString()
            };
            return await this._mongoService.findOne(query, Collection.attendance);
        });

        return response["result"];
    }

}