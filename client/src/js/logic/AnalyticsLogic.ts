import {Utils} from "../utilities/Utils";
import {loadModule} from "../services/ModuleService";
import {AnalyticsComponent} from "../components/AnalyticsComponent";
import Chart, {ActiveElement, ChartData, ChartEvent} from "chart.js/auto"
import {
    getModuleAttendanceRateData,
    getModuleAverageAttendanceRateData,
    getModuleTableData,
    getUserAttendanceRateData,
    getUserTableData
} from "../services/AnalyticsService";
import {Role} from "../enums/Role.enum";
import {ChartType} from "../enums/ChartType.enum";
import {disableSpinner} from "../index";
import {Alert} from "../enums/Alert.enum";

export class AnalyticsLogic {
    private _utils: Utils = null;
    private _selectedModule: object = null;
    private _payload: object = null;
    private _component: AnalyticsComponent = null;

    private _mtimetable: Date[] = null;
    private _uattendedObj: object = null;
    private _controlButtons: HTMLButtonElement[] = [];

    constructor(utils: Utils, payload: object, component: AnalyticsComponent) {
        this._utils = utils;
        this._component = component;
        this._payload = payload;
        const dselButton = document.getElementById("deselectbutton");
        dselButton.addEventListener('click', async () => {
            this._selectedModule = null;
            await this._component.selectModule(payload);
            const selmodh4 = document.getElementById("selmodh4");
            selmodh4.textContent = "Selected Module: None";
            for(let i = 0; i < this._controlButtons.length; i++) {
                this._controlButtons[i].disabled = true;
            }
        });

        const tableButton = component.addControlbutton("Display Table", "tablebutton");
        this._controlButtons.push(tableButton);
        switch ((this.getUserInfo()["role"] as Role)) {
            case Role.Student: {
                tableButton.addEventListener('click', async () => {
                    await this.initUserTable();
                });
                const attendanceButton = component.addControlbutton("Display Attendance Rate", "graphbutton");
                attendanceButton.addEventListener('click', async () => {
                    await this.initAttendanceRateGraph(this._component.container);
                });
                this._controlButtons.push(attendanceButton);
                break;
            }
            case Role.IT:
            case Role.AdministrativeFM:
            case Role.Lecturer:
                tableButton.addEventListener('click', async () => {
                    await this.initModuleTable();
                });
                const attendanceButton  = component.addControlbutton("Display Current Attendance Rate", "bargraphbutton");
                attendanceButton.addEventListener('click', async () => {
                    await this.initModuleAttendanceRateGraph(this._component.container);
                });
                this._controlButtons.push(attendanceButton);
                const attendanceAvgButton  = component.addControlbutton("Display Average Attendance Rate", "linegraphbutton");
                attendanceAvgButton.addEventListener('click', async () => {
                    await this.initModuleAverageAttendanceRateGraph(this._component.container);
                });
                this._controlButtons.push(attendanceAvgButton);
                break;
        }
        disableSpinner();
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
            if(this._utils.selectedModule !== null) {
                const selmodh4 = document.getElementById("selmodh4");
                selmodh4.textContent = "Selected Module: " + this._utils.selectedModule;
                this._selectedModule = await loadModule(this._utils.selectedModule);
                this._mtimetable = this._selectedModule["timetable"];
                this._uattendedObj = this.getAttObjfromArray(this.getUserInfo()["attended"], this._selectedModule["name"]);
                document.getElementById("analytics-data-container").innerHTML = "";
                for(let i = 0; i < this._controlButtons.length; i++) {
                    this._controlButtons[i].disabled = false;
                }
                await this.initModuleAttendanceRateGraph(this._component.container);
            } else {
                this._utils.generateAlert("", Alert.Danger);
            }
        });
    }

    private async initUserTable() {
        const response: object = JSON.parse(await getUserTableData(this.getUserInfo()["username"], this._selectedModule["name"]));
        this.initTable(response["headStrings"], response["bodyStrings"]);
    }

    private async initModuleTable() {
        const response: object = JSON.parse(await getModuleTableData(this._selectedModule["name"]));
        this.initTable(response["headStrings"], response["bodyStrings"]);
    }

    private initTable(headStrings: string[], bodyStrings: string[][]) {
        this._component.displayTable();
        const thead = document.getElementById("tablehead");
        thead.innerHTML = "";
        const tbody =  document.getElementById("tablebody");
        tbody.innerHTML = "";
        const headTr = document.createElement("tr");
        headStrings.map(name => {
            const th = document.createElement("th");
            th.scope = "col";
            th.innerHTML = name;
            headTr.appendChild(th);
        });

        thead.appendChild(headTr);

        bodyStrings.map(arr => {
            const tr = document.createElement("tr");
            arr.map((name, i) => {
                if(i === 0) {
                    const th = document.createElement("th");
                    th.scope = "row";
                    th.innerHTML = name;
                    tr.appendChild(th);
                } else {
                    const td = document.createElement("td");
                    td.innerHTML = name;
                    tr.appendChild(td);
                }
            });

            tbody.appendChild(tr);
        });
    }

    private async initModuleAverageAttendanceRateGraph(container: HTMLElement) {
        const response: object = JSON.parse(await getModuleAverageAttendanceRateData(this._selectedModule["name"]));
        await this.initGraph("moduleAvgAttendanceRateChart", ChartType.Line, response["data"], container);
    }

    private async initModuleAttendanceRateGraph(container: HTMLElement) {
        const response: object = JSON.parse(await getModuleAttendanceRateData(this._selectedModule["name"]));
        await this.initGraph("userAttendanceRateChart", ChartType.Bar, response["graph"], container, true, response);
    }

    private async initAttendanceRateGraph(container: HTMLElement) {
        const response: object = JSON.parse(await getUserAttendanceRateData
        (this.getUserInfo()["username"] ,this._selectedModule["name"]));
        await this.initGraph("attendanceRateChart", ChartType.Line, response["data"], container);
    }

    private async initAttendanceRateGraphwData(chartElements: ActiveElement[], response: object, chart: Chart) {
        const clickedIndex: number = chartElements[0].index;
        const name: string = (chart.data.labels[clickedIndex] as string);
        const data = response["data"];
        const chartData: ChartData = {
            labels: response["mlabels"],
            datasets: [{
                label: `${name} | ${this._selectedModule["name"]}`,
                data: data["enrolledAttendanceRate"][clickedIndex]["data"]
            },{
                label: `${name} | Predicted ${this._selectedModule["name"]}`,
                data: data["predEnrolledAttendanceRate"][clickedIndex],
                borderDash: [10,5]
            }]
        };

        await this.initGraph("attendanceRateChart", ChartType.Line, chartData, this._component.container);
    }

    private async initGraph(id: string, type: ChartType, data: ChartData, container: HTMLElement, wData?: boolean, response?: object) {
        this._component.displayGraph();
        const chart = document.createElement("canvas");
        chart.id = id;
        let typeDef = null;
        switch (type) {
            case ChartType.Bar:
                typeDef = "bar";
                break;
            case ChartType.Line:
                typeDef = "line";
                break;
        }

        let chartDef = null;
        if(wData) {
            chartDef = new Chart(chart, {
                type: typeDef,
                data: data,
                options: {
                    scales: {
                        y: {
                            min: 0,
                            max: 100
                        }
                    },
                    onClick: async (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
                        await this.initAttendanceRateGraphwData(elements, response, chart)
                    }
                }
            })

        } else {
            chartDef = new Chart(chart, {
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
        }

        container.appendChild(chart);
    }
}