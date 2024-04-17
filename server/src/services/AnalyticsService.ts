import {MongoService} from "./MongoService";
import {ChartData} from "chart.js";
import {Collection} from "../enums/Collection.enum";
import {Errors} from "../utilities/Errors";
import {Logs} from "../utilities/Logs";
import {Role} from "../enums/Role.enum";
import {ModuleService} from "./ModuleService";

export class AnalyticsService {
    private _mongoService: MongoService = null;
    private _moduleService: ModuleService = null;

    constructor() {
        this._mongoService = new MongoService();
        this._moduleService = new ModuleService();
    }

    async getIndexTableData(userInfo: object): Promise<object> {
        const role: Role = userInfo["role"];
        const headStrings: string[] = ["Module Name", "Date", "Time"]
        let allBodyStrings: string[][] = null;
        switch (role) {
            case Role.Student:
            case Role.Lecturer:
                allBodyStrings = await this.getIndexData(userInfo["module_list"]);
                break;
            case Role.AdministrativeFM:
            case Role.IT:
                const modules: object[] = await this._moduleService.loadModules();
                allBodyStrings = await this.getIndexData(userInfo["module_list"], modules);
                break;
        }

        return {
            headStrings: headStrings,
            bodyStrings: allBodyStrings
        };
    }

    private async getIndexData(module_list: string[], modules?: object[]): Promise<string[][]> {
        const allBodyStrings: string[][] = [];
        let list = [];
        if(typeof modules !== "undefined") {
            list = modules;
        } else {
            list = module_list;
        }

        for(let i = 0; i < list.length; i++) {
            let moduleName: string = null;
            let module: object = null;
            if(typeof modules !== "undefined") {
                module = list[i];
                moduleName = module["name"];
            } else {
                moduleName = list[i];
                module = await this._moduleService.loadModule(moduleName);
            }
            const timetable: Date[] = module["timetable"];
            if(allBodyStrings.length === 6) {
                break;
            }
            for(let i = 0; i < timetable.length; i++) {
                const date: Date = new Date(timetable[i]);
                if(allBodyStrings.length === 6) {
                    break;
                }

                if(date > new Date()) {
                    const bodyStrings: string[] = [];
                    bodyStrings.push(moduleName);
                    bodyStrings.push(date.toDateString())
                    bodyStrings.push(date.getTime().toString());
                    allBodyStrings.push(bodyStrings);
                }
            }
        }

        const dates: Date[] = [];
        allBodyStrings.map(bodyStrings => {
            const date: Date = new Date(bodyStrings[1]);
            date.setTime(parseInt(bodyStrings[2]));
            dates.push(date);
        })

        dates.sort(function (a, b) {
            if(a < b) {
                return -1;
            } else if( a == b) {
                return 0;
            } else {
                return 1;
            }
        })

        const sortedBodyStrings: string[][] = [];
        for(let i = 0; i < allBodyStrings.length; i++) {
            const date: Date = dates[i];
            for(let x = 0; x < allBodyStrings.length; x++) {
                const bodyString: string[] = allBodyStrings[x];
                const tempDate: Date = new Date(bodyString[1]);
                tempDate.setTime(parseInt(bodyString[2]));
                if(new Date(date).toString() === tempDate.toString()) {
                    const newBodyString: string[] = [];
                    bodyString.map((string, y) => {
                        newBodyString.push(string);
                    })
                    sortedBodyStrings.push(newBodyString);
                    break;
                }
            }
        }

        return sortedBodyStrings;
    }

    async getUserTableData(username: string, module_name: string): Promise<object> {
        const comparativeData: object = await this.getComparativeData(username, module_name);
        const headStrings: string[] = ["#", "Module Name", "Date", "Attended", "Late"];
        const allBodyStrings: string[][] = [];
        const moduleData: object = comparativeData["moduleData"];
        const userData: object = comparativeData["userData"];
        let attObjArr: object[] = userData["attended"];
        let attendedObj: object = this.getAttendedObj(attObjArr, module_name);

        (moduleData["timetable"] as Date[]).map((time, i) => {
            allBodyStrings.push(this.getBodyStrings(i, module_name, time, attendedObj));
        })

        return {
            headStrings: headStrings,
            bodyStrings: allBodyStrings
        }
    }

    async getModuleTableData(module_name: string): Promise<object> {
        const headStrings: string[] = ["#", "Name | Username", "Date", "Attended", "Late"];
        const bodyStrings: string[][] = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const allBodyStrings: string[][] = [];
            const moduleResult: object = await this.getModuleData(module_name);
            const moduleData: object = moduleResult["result"];

            if(moduleResult["status"] === null) {
                return null;
            }

            const enrolled: string[] = moduleData["enrolled"];
            for(let i = 0; i < enrolled.length; i++) {
                const username: string = enrolled[i];
                const userResult: object = await this.getUserData(username);
                const userData: object = userResult["result"];
                let attObjArr: object[] = userData["attended"];
                let attendedObj: object = this.getAttendedObj(attObjArr, module_name);

                if(userResult["status"] === null) {
                    return null;
                }

                (moduleData["timetable"] as Date[]).map((time, i) => {
                    const name: string = `${userData["first_name"]}, ${userData["last_name"][0]} | ${username}`;
                    allBodyStrings.push(this.getBodyStrings(i, name, time, attendedObj));
                })
            }

            return allBodyStrings;
        });

        return {
            headStrings: headStrings,
            bodyStrings: bodyStrings
        }
    }

    private getAttendedObj(attObjArr: object[], module_name: string): object {
        for(let i = 0; i < attObjArr.length; i++) {
            const obj = attObjArr[i];
            if(obj["module"] === module_name) {
                return obj;
            }
        }

        return null;
    }

    private getBodyStrings(i: number, name: string, time: Date, attendedObj: object): string[] {
        const bodyStrings: string[] = [];
        bodyStrings.push((i+1).toString());
        if(i === 0) {
            bodyStrings.push(name)
        } else {
            bodyStrings.push("-");
        }
        bodyStrings.push(new Date(time).toDateString());
        if(attendedObj === null) {
            bodyStrings.push("X");
            bodyStrings.push("?");
        } else {
            const usrAttendedDates: Date[] = attendedObj["attended"];
            let located: Date = null;
            usrAttendedDates.map((usrTime, i) => {
                if(usrTime === time) {
                    located = usrTime;
                }
            });
            if(located !== null) {
                bodyStrings.push("✓");
                bodyStrings.push(`${(((new Date(time).getTime() - new Date(located).getTime()) / 1000) / 60)} minutes`)
            } else {
                bodyStrings.push("X")
                bodyStrings.push("?");
            }
        }

        return bodyStrings;
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
            }, {
                label: moduleData["name"] + " Predicted Attendance Rate",
                data: await this.predictFutureAttendanceRate(userAttendanceRate["data"]),
                borderDash: [10,5]
            }],
            labels: dateDataPoints["labels"]
        })
    }

    async getModuleAttendanceRate(module_name: string): Promise<object> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const moduleResult: object = await this.getModuleData(module_name);
            const moduleData: object = moduleResult["result"];

            if (!moduleResult["status"]) {
                return null;
            }

            const mtimetable: Date[] = moduleData["timetable"];
            const dateDataPoints: object = this.getDateDataPoints(mtimetable);
            const enrolledArray: string[] = moduleData["enrolled"];
            let enrolledNames: string[] = [];
            let enrolledAttendanceRate: object[] = [];
            for (let i = 0; i < enrolledArray.length; i++) {
                const userResult: object = await this.getUserData(enrolledArray[i]);
                const userData: object = userResult["result"];
                enrolledNames.push(`${userData["first_name"]}, ${(userData["last_name"])[0]} (${enrolledArray[i]})`);

                if (!userResult["status"]) {
                    enrolledAttendanceRate.push(null);
                }

                const uattendedObj: object = this.getUserModuleAttendedData(userData, moduleData);
                enrolledAttendanceRate.push(this.getUserAttendanceRate(uattendedObj, mtimetable, dateDataPoints["dateDataPoints"]));
            }

            return {
                enrolledAttendanceRate: enrolledAttendanceRate,
                enrolledNames: enrolledNames,
                mlabels: dateDataPoints["labels"]
            }
        });

        if(response === null) {
            return null;
        }

        const data = [];
        const enrolledAttendanceRate: object[] = response["enrolledAttendanceRate"];
        enrolledAttendanceRate.map(obj => {
            let objData: number[] = obj["data"];
            let latest: number = null;
            let increment: number = 1;
            while(latest == null ) {
                latest = objData[objData.length - increment];
                increment++;
                if(increment === objData.length+1) {
                    break;
                }
            }
            data.push(latest);
        })

        const predEnrolledAttendanceRate: number[][] = []
        for(let i = 0; i < enrolledAttendanceRate.length; i++) {
            let objData: number[] = enrolledAttendanceRate[i]["data"];
            predEnrolledAttendanceRate.push(await this.predictFutureAttendanceRate(objData))
        }

        return {
            message: Logs.ModuleAttendanceData,
            graph: {
                datasets: [
                    {
                        label: module_name,
                        data: data
                    }
                ],
                labels: (response["enrolledNames"] as string[])
            },
            data: {
                enrolledAttendanceRate: enrolledAttendanceRate,
                predEnrolledAttendanceRate: predEnrolledAttendanceRate
            },
            mlabels: response["mlabels"]
        }
    }

    async getAverageAttendanceRate(module_name: string): Promise<object> {
        const response: object = await this.getModuleAttendanceRate(module_name);
        const data: object[] = response["data"]["enrolledAttendanceRate"];
        const newData: number[] = [];
        data.map((obj, x) => {
            const tempData: number[] = obj["data"];
            tempData.map((num, i) => {
                if(x === 0) {
                    newData.push(num);
                } else {
                    if(newData[i] !== null) {
                        newData[i] += num;
                    }
                }
            });
        });

        newData.map((num, i) => {
            if(newData[i] !== null) {
                newData[i] = (num / data.length)
            }
        })

        return {
            message: Logs.ModuleAttendanceData,
            data: {
                datasets: [
                    {
                        label: module_name,
                        data: newData
                    },
                    {
                        label: module_name + " Predicted Attendance Rate",
                        data: await this.predictFutureAttendanceRate(newData),
                        borderDash: [10,5]
                    }
                ],
                labels: response["mlabels"]
            }
        }
    }

    // ---------------------------------------------------
    // Must be run within mongoService connection handlers
    // ---------------------------------------------------


    private async getModuleData(module_name: string): Promise<object> {
        const moduleQuery = {name: module_name};
        return await this._mongoService.findOne(moduleQuery, Collection.module);
    }

    private async getUserData(username: string): Promise<object> {
        const userQuery = {username: username};
        return await this._mongoService.findOne(userQuery, Collection.users);
    }

    //
    // ---------------------------------------------------
    //

    private async getComparativeData(username: string, module_name: string): Promise<object> {
        return await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const userQuery = { username: username };
            const userData: object = await this._mongoService.findOne(userQuery, Collection.users);

            if(!userData["status"]) {
                return null;
            }

            const moduleQuery = { name: module_name };
            const moduleData: object = await this._mongoService.findOne(moduleQuery, Collection.module);

            if(!moduleData["status"]) {
                return null;
            }

            return {
                userData: userData["result"],
                moduleData: moduleData["result"]
            }
        });
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

    private async predictFutureAttendanceRate(data: number[]): Promise<number[]> {
        const newData: number[] = [];
        let currentRate: number = 0;
        for(let i = 0; i < data.length; i++) {
            if(data[i+1] === null) {
                currentRate = data[i] + data[i-1];
                newData.push(data[i]);
                break;
            } else {
                newData.push(null)
            }
        }

        const trendPercentage = ((currentRate - 100)/ 100) * 100;
        for(let i = newData.length-1; i < data.length; i++) {
            if(trendPercentage >= 0) {
                newData.push(newData[i] - trendPercentage);
            } else {
                newData.push(newData[i] + trendPercentage);
            }
        }

        return newData;
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
}