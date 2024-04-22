import {GeneralUtility} from "../utilities/GeneralUtility";
import {IAnalyticsComponent} from "../components/AnalyticsComponent";
import Chart, {ActiveElement, ChartData, ChartEvent} from "chart.js/auto"
import {Role} from "../enums/Role.enum";
import {ChartType} from "../enums/ChartType.enum";
import {disableSpinner} from "../index";
import {Alert} from "../enums/Alert.enum";
import {ServiceFactory} from "../services/ServiceFactory";
import {IAnalyticsService} from "../services/AnalyticsService";

export interface IAnalyticsLogic {
    submitButton(): Promise<void>;
}

export class AnalyticsLogic implements IAnalyticsLogic {
    private _utils: GeneralUtility = null;
    private _selectedModule: object = null;
    private readonly _payload: object = null;
    private _component: IAnalyticsComponent = null;
    private _analyticsService: IAnalyticsService = null;

    private _controlButtons: HTMLButtonElement[] = [];

    constructor(utils: GeneralUtility, payload: object, component: IAnalyticsComponent) {
        this._utils = utils;
        this._component = component;
        this._payload = payload;
        this._analyticsService = ServiceFactory.createAnalyticsService();
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

    async submitButton(): Promise<void> {
        const submitbuttom = document.getElementById("smsubmitbutton");
        submitbuttom.addEventListener('click', async () => {
            if(this._utils.selectedModule !== null) {
                const selmodh4 = document.getElementById("selmodh4");
                selmodh4.textContent = "Selected Module: " + this._utils.selectedModule;
                this._selectedModule = await ServiceFactory.createModuleService().loadModule(this._utils.selectedModule);
                document.getElementById("analytics-data-container").innerHTML = "";
                for(let i = 0; i < this._controlButtons.length; i++) {
                    this._controlButtons[i].disabled = false;
                }
                switch ((this.getUserInfo()["role"] as Role)) {
                    case Role.Student:
                        await this.initAttendanceRateGraph(this._component.container);
                        break;
                    case Role.Lecturer:
                    case Role.AdministrativeFM:
                    case Role.IT:
                        await this.initModuleAttendanceRateGraph(this._component.container);
                        break;
                }
            } else {
                this._utils.generateAlert("", Alert.Danger);
            }
        });
    }

    private async initUserTable() {
        const response: object = await this._analyticsService.getUserTableData(this.getUserInfo()["username"], this._selectedModule["name"])
        this.initTable(response["headStrings"], response["bodyStrings"]);
    }

    private async initModuleTable() {
        const response: object = await this._analyticsService.getModuleTableData(this._selectedModule["name"])
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
        const response: object = await this._analyticsService.getModuleAverageAttendanceRateData(this._selectedModule["name"])
        await this.initGraph("moduleAvgAttendanceRateChart", ChartType.Line, response["data"], container);
    }

    private async initModuleAttendanceRateGraph(container: HTMLElement) {
        const response: object = await this._analyticsService.getModuleAttendanceRateData(this._selectedModule["name"])
        await this.initGraph("userAttendanceRateChart", ChartType.Bar, response["graph"], container, true, response);
    }

    private async initAttendanceRateGraph(container: HTMLElement) {
        const response: object = await this._analyticsService.getUserAttendanceRateData
        (this.getUserInfo()["username"] ,this._selectedModule["name"])
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