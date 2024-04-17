import {loadModule, loadModules} from "../services/ModuleService";
import {Role} from "../enums/Role.enum";
import Chart, {ChartData} from "chart.js/auto";
import {ChartType} from "../enums/ChartType.enum";
import {getIndexTableData, getModuleAttendanceRateData, getUserAttendanceRateData} from "../services/AnalyticsService";
import {disableSpinner} from "../index";

export class HomeLogic {
    private _payload: object;

    constructor(payload: object) {
        this._payload = payload;
        (async () => {
            const userInfo: object = await this.getRandomAttendanceTrend();
            await this.initLessonsTable();
            disableSpinner();
        })();
    }

    private async getRandomAttendanceTrend(): Promise<object> {
        const userInfo: object = this._payload["json"]["userinfo"];
        const payloadRole: Role =  userInfo["role"];
        const username: string = userInfo["username"];
        const module_list: string[] = userInfo["module_list"];
        switch (payloadRole) {
            case Role.Student: {
                const module: object = await loadModule(module_list[Math.round(Math.random() * (module_list.length - 1))]);
                const response: object = JSON.parse(await getUserAttendanceRateData(username, module["name"]));
                this.initChart(response["data"], ChartType.Line);
                break;
            }
            case Role.Lecturer: {
                const module: object = await loadModule(module_list[Math.round(Math.random() * (module_list.length - 1))]);
                const response: object = JSON.parse(await getModuleAttendanceRateData(module["name"]));
                this.initChart(response["graph"], ChartType.Bar);
                break;
            }
            case Role.AdministrativeFM:
            case Role.IT:
                const modules: object[] = await loadModules();
                const module: object = modules[Math.round(Math.random() * (modules.length - 1))];
                const response: object = JSON.parse(await getModuleAttendanceRateData(module["name"]));
                this.initChart(response["graph"], ChartType.Bar);
                break;
        }

        return userInfo;
    }

    private initChart(data: ChartData, type: ChartType) {
        const container: HTMLElement = document.getElementById("index-side-container-tab1-content");
        container.innerHTML = "";
        const chart = document.createElement("canvas");
        let typeDef = null;
        switch (type) {
            case ChartType.Bar:
                typeDef = "bar";
                break;
            case ChartType.Line:
                typeDef = "line";
                break;
        }

        const chartDef = new Chart(chart, {
            type: typeDef,
            data: data,
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 100
                    }
                }
            }
        });
        container.appendChild(chart);
        container.appendChild(document.createElement("br"));
    }

    async initLessonsTable() {
        const data: object = JSON.parse(await getIndexTableData());
        const container: HTMLElement = document.getElementById("index-side-container-tab2-content");
        const thead = document.getElementById("tablehead");
        const tbody = document.getElementById("tablebody");
        const headTr = document.createElement("tr");
        (data["headStrings"] as string[]).map(name => {
           const th = document.createElement('th');
           th.scope = "col";
           th.innerHTML = name;
           headTr.appendChild(th);
        });

        thead.appendChild(headTr);

        (data["bodyStrings"] as string[][]).map(arr => {
            const tr = document.createElement("tr");
            arr.map((name, i) => {
                switch (i) {
                    case 0: {
                        const th = document.createElement("th");
                        th.scope = "row";
                        th.innerHTML = name;
                        tr.appendChild(th);
                        break;
                    }
                    case 1: {
                        const td = document.createElement("td");
                        td.innerHTML = name;
                        tr.appendChild(td);
                        break;
                    }
                    case 2: {
                        const td = document.createElement("td");
                        const time = new Date(parseInt(name) * 1000)
                        let timeString: string = "";
                        const timeStringArr: string[] = [];
                        timeStringArr.push(time.getHours().toString());
                        const minutes = time.getMinutes();
                        if(minutes < 10) {
                            timeStringArr.push(`0${minutes}`);
                        } else {
                            timeStringArr.push(minutes.toString());
                        }
                        const seconds = time.getSeconds();
                        if(seconds < 10) {
                            timeStringArr.push(`0${seconds}`);
                        } else {
                            timeStringArr.push(seconds.toString());
                        }
                        td.innerHTML = `${timeStringArr[0]}:${timeStringArr[1]}:${timeStringArr[2]}`;
                        tr.appendChild(td);
                        break;
                    }
                }
            });

            tbody.appendChild(tr);
        });
    }
}