import {Utils} from "../utils/Utils";
import {loadModule} from "../services/ModuleService";
import {AnalyticsComponent} from "../components/AnalyticsComponent";
import Chart, {ActiveElement, ChartData, ChartEvent} from "chart.js/auto"
import {
    getModuleAttendanceRateData,
    getModuleAverageAttendanceRateData,
    getUserAttendanceRateData
} from "../services/AnalyticsService";
import {Role} from "../enums/Role.enum";

enum Type {
    Line,
    Bar
}

export class AnalyticsLogic {
    private _utils: Utils = null;
    private _selectedModule: object = null;
    private _payload: object = null;
    private _component: AnalyticsComponent = null;

    private _mtimetable: Date[] = null;
    private _uattendedObj: object = null;

    constructor(utils: Utils, payload: object, component: AnalyticsComponent) {
        this._utils = utils;
        this._component = component;
        this._payload = payload;
        const dselbutton = document.getElementById("deselectbutton");
        dselbutton.addEventListener('click', async () => {
            this._selectedModule = null;
            await this._component.selectModule(payload);
            const selmodh4 = document.getElementById("selmodh4");
            selmodh4.textContent = "Selected Module: None";
            (document.getElementById("tablebutton") as HTMLButtonElement).disabled = true;
            (document.getElementById("graphbutton") as HTMLButtonElement).disabled = true;
        });
        const disTable = document.getElementById("tablebutton");
        disTable.addEventListener('click', () => {
            component.displayTable();
        });
    }

    private getUserInfo(): object {
        return this._payload["json"]["userinfo"];
    }

    private getAttObjfromArray(objArray: object[], name: string):object {
        objArray.map(obj => {
           if(obj["module"] === name) {
               return obj;
           }
        });

        return null;
    }

    async submitButton() {
        const submitbuttom = document.getElementById("smsubmitbutton");
        submitbuttom.addEventListener('click', async () => {
           const selmodh4 = document.getElementById("selmodh4");
           selmodh4.textContent = "Selected Module: " + this._utils.selectedModule;
           this._selectedModule = await loadModule(this._utils.selectedModule);
           this._mtimetable = this._selectedModule["timetable"];
           this._uattendedObj = this.getAttObjfromArray(this.getUserInfo()["attended"], this._selectedModule["name"]);
           document.getElementById("analytics-data-container").innerHTML = "";
           (document.getElementById("tablebutton") as HTMLButtonElement).disabled = false;
           //(document.getElementById("graphbutton") as HTMLButtonElement).disabled = false;
           await this.initModuleAttendanceRateGraph();
        });
    }

    displayTable() {
        this.initUserTable();
    }

    private initUserTable() {
        const tbody = document.getElementById("tablebody");
        this._mtimetable.map((time, i) => {
            const tr = document.createElement("tr");
            const th = document.createElement("th");
            th.scope = "row";
            th.innerHTML = (i+1).toString();
            tr.appendChild(th);
            const name = document.createElement("td");
            if(i === 0) {
                name.innerHTML = this._selectedModule["name"];
            } else {
                name.innerHTML = "-";
            }
            tr.appendChild(name);
            const date = document.createElement("td");
            date.innerHTML = new Date(time).toDateString();
            tr.appendChild(date);
            const attended = document.createElement("td");
            const late = document.createElement("td");
            if(this._uattendedObj === null) {
                attended.innerHTML = "X";
                late.innerHTML = "?";
            } else {
                const usrAttendedDates: Date[] = this._uattendedObj["attended"];
                let located: Date = null;
                usrAttendedDates.map((usrTime, i) => {
                    if(usrTime === time) {
                        located = usrTime;
                    }
                });
                if(located !== null) {
                    attended.innerHTML = "✓";
                    late.innerHTML = (((new Date(time).getTime() - new Date(located).getTime()) / 1000) / 60) + " minutes";
                } else {
                    attended.innerHTML = "X";
                    late.innerHTML = "?";
                }
            }
            tr.appendChild(attended);
            tr.appendChild(late);
            tbody.appendChild(tr);
        })
    }

    private initElevatedTable() {

    }

    private async initModuleAverageAttendanceRateGraph() {
        const response: object = JSON.parse(await getModuleAverageAttendanceRateData(this._selectedModule["name"]));
        await this.initGraph("moduleAvgAttendanceRateChart", Type.Line, response["data"], false);
    }

    private async initModuleAttendanceRateGraph() {
        const response: object = JSON.parse(await getModuleAttendanceRateData(this._selectedModule["name"]));
        await this.initGraph("userAttendanceRateChart", Type.Bar, response["graph"], false, async () => {
            //await this.initAttendanceRateGraphwData();
        }, response);
    }

    private async initAttendanceRateGraph() {
        const response: object = JSON.parse(await getUserAttendanceRateData
        (this.getUserInfo()["username"] ,this._selectedModule["name"]));
        await this.initGraph("attendanceRateChart", Type.Line, response["data"], false);
    }

    private async initAttendanceRateGraphwData(chartElements: ActiveElement[], response: object, chart: Chart) {
        const clickedIndex: number = chartElements[0].index;
        const name: string = (chart.data.labels[clickedIndex] as string);
        const data = response["data"];
        const chartData: ChartData = {
            labels: response["mlabels"],
            datasets: [{
                label: `${name} | ${this._selectedModule["name"]}`,
                data: data[clickedIndex]["data"]
            }]
        };

        await this.initGraph("attendanceRateChart", Type.Line, chartData, true);
    }

    private async initGraph(id: string, type: Type, data: ChartData, replace: boolean
                            , onClick?: (...args: any[]) => any, response?: object) {
        document.getElementById("analytics-data-container").innerHTML = "";
        const container = this._component.container;
        const chart = document.createElement("canvas");
        chart.id = id;
        let typeDef = null;
        switch (type) {
            case Type.Bar:
                typeDef = "bar";
                break;
            case Type.Line:
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
        })

        if(typeof onClick !== "undefined") {
            chartDef.options.onClick(onClick(chartDef.getActiveElements(), response, chartDef));
        }

        if(replace) {
            container.removeChild(document.getElementById("userAttendanceRateChart"));
        }

        container.appendChild(chart);
    }
}