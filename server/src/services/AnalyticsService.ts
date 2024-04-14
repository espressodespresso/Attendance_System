import {MongoService} from "./MongoService";
import {ChartData} from "chart.js";
import {Collection} from "../enums/Collection.enum";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";

export class AnalyticsService {
    private mongoService: MongoService = null;


    constructor() {
        this.mongoService = new MongoService();
    }

    async getUserAttendanceRateData(username: string, module_name: string): Promise<object> {
        const comparativeData: object = await this.getComparativeData(username, module_name);
        if(comparativeData === null) {
            return this.messageObj(Errors.ComparativeData, null);
        }

        const userData: object = comparativeData["userData"];
        const moduleData: object = comparativeData["moduleData"];
        const uattendedObj: object = this.getUserModuleAttendedData(userData, moduleData);
        const mtimetable: Date[] = moduleData["timetable"];

        const dateDataPoints: object = this.getDateDataPoints(mtimetable);
        const userAttendanceRate: object = this.getUserAttendanceRate(uattendedObj, mtimetable, dateDataPoints["dateDataPoints"]);

        return this.messageObj(userAttendanceRate["message"], {
            datasets: [{
                label: moduleData["name"] + " Attendance Rate",
                data: userAttendanceRate["data"],
            }],
            labels: dateDataPoints["labels"]
        })
    }

    async getModuleAttendanceRate(module_name: string): Promise<object> {
        const response: object = await this.mongoService.handleConnection
        (async (): Promise<object> => {
            const moduleQuery = {name: module_name};
            const moduleData: object = await this.mongoService.findOne(moduleQuery, Collection.module);

            if (moduleData === null) {
                return this.messageObj(Errors.ComparativeData, null);
            }

            const mtimetable: Date[] = moduleData["timetable"];
            const dateDataPoints: object = this.getDateDataPoints(mtimetable);

            const enrolledArray: string[] = moduleData["enrolled"];
            let enrolledAttendanceRate: object[] = [];
            for (let i = 0; i < enrolledArray.length; i++) {
                const userQuery = {username: enrolledArray[i]};
                const userData: object = await this.mongoService.findOne(userQuery, Collection.users);

                if (userData === null) {
                    enrolledAttendanceRate.push(null);
                }

                const uattendedObj: object = this.getUserModuleAttendedData(userData, moduleData);
                enrolledAttendanceRate.push(this.getUserAttendanceRate(uattendedObj, mtimetable, dateDataPoints["dateDataPoints"]));
            }

            return {
                enrolledAttendanceRate: enrolledAttendanceRate,
                emrolledArray: enrolledArray
            };
        });

        if(response === null) {
            return null;
        }


        const data = [];
        const enrolledAttendanceRate: object[] = response["enrolledAttendanceRate"];
        enrolledAttendanceRate.map(obj => {
            let objData: number[] = obj["data"];
            data.push([0, objData[objData.length - 1]])
        })

        return {
            message: Logs.ModuleAttendanceData,
            graph: {
                datasets: [
                    {
                        label: module_name,
                        data: data
                    }
                ],
                labels: (response["enrolledArray"] as string[])
            },
            data: enrolledAttendanceRate
        }
    }

    private getDateDataPoints(mtimetable: Date[]): object {
        const dateDataPoints: Date[] = [];
        let labels: string[] = [];
        mtimetable.map((date, i) => {
            const timetabledDate = new Date(date);
            if(i === 0) {
                labels.push(new Date(timetabledDate.getTime() - (7 * 24 * 60 * 60 * 1000)).toDateString())
            }
            labels.push(timetabledDate.toDateString());
            if(timetabledDate <= new Date()) {
                dateDataPoints.push(timetabledDate);
            }
        });

        return {
            dateDataPoints: dateDataPoints,
            labels: labels
        }
    }

    private getUserAttendanceRate(uattendedObj: object, mtimetable: Date[], dateDataPoints: Date[]): object {
        let data: number[] = [];
        data.push(100);
        const percentageChangeRate: number = 100 / mtimetable.length;
        let attendanceRate: number = 100;
        let message: string = null;
        if(uattendedObj === null) {
            message = Errors.NoAttendanceData;
            for(let i = 0; i < mtimetable.length; i++) {
                if(i+1 <= dateDataPoints.length) {
                    data.push(Math.round(attendanceRate - percentageChangeRate));
                    attendanceRate = attendanceRate - percentageChangeRate;
                } else {
                    data.push(null);
                }
            }
        } else {
            message = Logs.AttendanceData;
            const attendedArray: Date[] = uattendedObj["attended"];
            for(let i = 0; i < mtimetable.length; i++) {
                if(i+1 <= dateDataPoints.length) {
                    let attended: boolean = false;
                    attendedArray.map(date => {
                        if(dateDataPoints[i].toDateString() === new Date(date).toDateString()) {
                            attended = true;
                        }
                    });

                    if(attended) {
                        data.push(attendanceRate);
                    } else {
                        data.push(attendanceRate = Math.round(attendanceRate - percentageChangeRate));
                        attendanceRate = attendanceRate - percentageChangeRate;
                    }

                } else {
                    data.push(null);
                }
            }
        }

        return {
            message: message,
            data: data
        }
    }

    private messageObj(message: string, data: ChartData): object {
        return {
            message: message,
            data: data
        }
    }

    private getUserModuleAttendedData(userData: object, moduleData: object): object {
        (userData["attended"] as object[]).map(obj => {
            if(obj["module"] === moduleData["name"]) {
                return obj;
            }
        })

        return null;
    }

    private async getComparativeData(username: string, module_name: string): Promise<object> {
        return await this.mongoService.handleConnection
        (async (): Promise<object> => {
            const userQuery = { username: username };
            const userData: object = await this.mongoService.findOne(userQuery, Collection.users);

            if(!userData["status"]) {
                return null;
            }

            const moduleQuery = { name: module_name };
            const moduleData: object = await this.mongoService.findOne(moduleQuery, Collection.module);

            if(!moduleData["status"]) {
                return null;
            }

            return {
                userData: userData["result"],
                moduleData: moduleData["result"]
            }
        });
    }
}