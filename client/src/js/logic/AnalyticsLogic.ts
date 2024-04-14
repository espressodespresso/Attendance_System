import {Utils} from "../utils/Utils";
import {loadModule} from "../services/ModuleService";
import {AnalyticsComponent} from "../components/AnalyticsComponent";
import Chart, {ChartData} from "chart.js/auto"
import {getUserAttendanceRateData} from "../services/AnalyticsService";

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
        const disGraph = document.getElementById("graphbutton");
        disGraph.addEventListener('click', async () => {
            component.displayGraph();
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
           (document.getElementById("graphbutton") as HTMLButtonElement).disabled = false;
        });
    }

    displayTable() {
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

    displayGraph() {
        (async () => {
            await this.initAttendanceRateGraph();
        })()
    }

    private initUserAttendanceRateGraph() {
        const container = this._component.container;
        const userAttendanceRateChart = document.createElement("canvas");
        userAttendanceRateChart.id = "userAttendanceRateChart";
        /*new Chart(userAttendanceRateChart, {
            type: "bar",
            data: this.userAttendanceRateData(),
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 100
                    }
                }
            }
        });
        container.appendChild(userAttendanceRateChart);*/
    }

    /*private userAttendanceRateData(): ChartData {
        let labels: string[] = [];

        return {

        }
    }*/

    private async initAttendanceRateGraph() {
        const container = this._component.container;
        const attendanceRateChart = document.createElement("canvas");
        attendanceRateChart.id = "attendanceRateChart";
        const response: object = await getUserAttendanceRateData(this.getUserInfo()["username"] ,this._selectedModule["name"])
        console.log(`data: ${response}`)
        new Chart(attendanceRateChart, {
            type: "line",
            data: response["data"]["data"],
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 100
                    }
                }
            }
        });
        container.appendChild(attendanceRateChart);
    }

    private attendanceRateData(): ChartData  {
        const dateDataPoints: Date[] = [];
        let labels: string[] = [];
        this._mtimetable.map((date, i) => {
            const timetabledDate = new Date(date);
            if(i === 0) {
                labels.push(new Date(timetabledDate.getTime() - (7 * 24 * 60 * 60 * 1000)).toDateString())
            }
            labels.push(timetabledDate.toDateString());
            if(timetabledDate <= new Date()) {
                dateDataPoints.push(timetabledDate);
            }
        });

        let data: number[] = [];
        data.push(100);
        const percentageChangeRate: number = 100 / this._mtimetable.length;
        if(this._uattendedObj === null) {
            console.log("No user attendance data found");
            console.log("Percentage Change Rate = " + percentageChangeRate);
            let attendanceRate: number = 100;
            for(let i = 0; i < this._mtimetable.length; i++) {
                if(i+1 <= dateDataPoints.length) {
                    data.push(Math.round(attendanceRate - percentageChangeRate));
                    attendanceRate = attendanceRate - percentageChangeRate;
                } else {
                    data.push(null);
                }
            }

            //const attendanceRate: number = percentageChangeRate * (mtimetable.length - dateDataPoints.length);
        } else {
            console.log("User attendance data found");
            let attendanceRate: number = 100;
            const attendedArray: Date[] = this._uattendedObj["attended"];
            for(let i = 0; i < this._mtimetable.length; i++) {
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
            datasets: [{
                label: this._selectedModule["name"] + " Attendance Rate",
                data: data,
            }],
            labels: labels
        };
    }
}