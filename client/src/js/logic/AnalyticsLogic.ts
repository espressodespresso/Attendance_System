import {Utils} from "../utils/Utils";
import {loadModule} from "../services/ModuleService";
import {AnalyticsComponent} from "../components/AnalyticsComponent";

export class AnalyticsLogic {
    private _utils: Utils = null;
    private _selectedModule: object = null;
    private _payload: object = null;
    private _component: AnalyticsComponent = null;

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
        });
        const disTable = document.getElementById("tablebutton");
        disTable.addEventListener('click', () => {
            component.displayTable();
        });
        const disGraph = document.getElementById("graphbutton");
        disGraph.addEventListener('click', async () => {

        });
    }

    async submitButton() {
        const submitbuttom = document.getElementById("smsubmitbutton");
        submitbuttom.addEventListener('click', async () => {
           const selmodh4 = document.getElementById("selmodh4");
           selmodh4.textContent = "Selected Module: " + this._utils.selectedModule;
           this._selectedModule = await loadModule(this._utils.selectedModule);
           document.getElementById("analytics-data-container").innerHTML = "";
        });
    }

    displayTable() {
        const tbody = document.getElementById("tablebody");
        const userInfo: object = this._payload["json"]["userinfo"];
        const timetable: Date[] = this._selectedModule["timetable"];
        const attendedObjArr: object[] = userInfo["attended"];
        let attendedObj: object = null;
        attendedObjArr.map(obj => {
            if(obj["module"] === this._selectedModule["name"]) {
                attendedObj = obj;
            }
        });

        timetable.map((time, i) => {
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
            if(attendedObj === null) {
                attended.innerHTML = "X";
                late.innerHTML = "?";
            } else {
                const usrAttendedDates: Date[] = attendedObj["attended"];
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

    }
}